<?php

namespace App\Services;

use App\Contracts\ActivityLogInterface;
use App\Contracts\SambaInterface;
use App\Contracts\VisitorInterface;
use App\Enums\VisitorError;
use App\Exceptions\VisitorException;
use App\Models\Visitor;
use App\Models\Voucher;
use App\Notifications\ResendVisitorLogin;
use App\Notifications\UpdateVisitorLogin;
use App\Notifications\VisitorLogin;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class VisitorService implements VisitorInterface
{
    public function __construct(
        protected SambaInterface $sambaService,
        protected ActivityLogInterface $activityLogService
    ) {}

    public function create(array $data): Visitor
    {
        return DB::transaction(function () use ($data) {
            $login = preg_replace('/\D/', '', $data['cpf']);

            if ($this->sambaService->userExists($login)) {
                throw VisitorException::sambaUserExists($login);
            }

            $visitor = Visitor::create([
                'name' => $data['name'],
                'cpf' => $login,
                'email' => $data['email'] ?? null,
                'phone' => $data['phone'] ?? null,
                'type_id' => $data['type_id'],
                'expires_at' => $data['expires_at'],
                'created_by' => $data['created_by'],
                'enabled' => true,
            ]);

            $passwordPlain = $this->generateRandomPassword();

            Voucher::create([
                'visitor_id' => $visitor->id,
                'login' => $login,
                'password' => $passwordPlain,
                'expires_at' => $visitor->expires_at,
                'created_by' => $data['created_by'],
            ]);

            $result = $this->sambaService->createSambaUser($login, $passwordPlain);

            if (!$result['success']) {
                $error = VisitorError::fromSambaResult($result);
                throw VisitorException::sambaConnectionError($error?->message() ?? $result['error'] ?? 'Erro ao criar usuário no Samba');
            }

            $this->activityLogService->logVisitorCreated($visitor->id, $visitor->name, $visitor->created_by);

            if ($visitor->email) {
                $visitor->notify(new VisitorLogin(
                    email: $login,
                    password: $passwordPlain,
                    expiresAt: $visitor->expires_at->format('d/m/Y H:i')
                ));
            }

            return $visitor;
        });
    }

    public function update(Visitor $visitor, array $data, ?int $userId = null): Visitor
    {
        $userId = $userId ?? $visitor->created_by;
        
        $oldCpf = preg_replace('/\D/', '', $visitor->cpf);
        $oldExpiresAt = $visitor->expires_at?->format('Y-m-d');

        $visitor->update([
            'name' => $data['name'],
            'cpf' => preg_replace('/\D/', '', $data['cpf']),
            'email' => $data['email'] ?? null,
            'phone' => $data['phone'] ?? null,
            'type_id' => $data['type_id'],
            'expires_at' => $data['expires_at'],
            'enabled' => $data['enabled'] ?? true,
        ]);

        $newCpf = preg_replace('/\D/', '', $visitor->cpf);
        $newExpiresAt = $visitor->expires_at->format('Y-m-d');
        $cpfChanged = $oldCpf !== $newCpf;
        $expiresAtChanged = $oldExpiresAt !== $newExpiresAt;

        $voucher = Voucher::firstOrNew(['visitor_id' => $visitor->id]);

        if ($cpfChanged && $voucher->exists) {
            $this->sambaService->deleteSambaUser($oldCpf);
            $voucher->password = $this->generateRandomPassword();
            $this->sambaService->createSambaUser($newCpf, $voucher->password);
        } else {
            if (!$voucher->password) {
                $voucher->password = $this->generateRandomPassword();
                $this->sambaService->createSambaUser($newCpf, $voucher->password);
            }

            if ($data['reset_password'] ?? false) {
                $voucher->password = $this->generateRandomPassword();
                $this->sambaService->updateSambaUserPassword($newCpf, $voucher->password);
            }
        }

        $voucher->login = $newCpf;
        $voucher->expires_at = $visitor->expires_at;
        $voucher->save();

        if ($expiresAtChanged) {
            $this->sambaService->updateSambaUserExpiry($newCpf, $visitor->expires_at);
        }

        $this->activityLogService->logVisitorUpdated($visitor->id, $visitor->name, [], [], $userId);

        return $visitor->refresh();
    }

    public function delete(Visitor $visitor, int $userId): void
    {
        $login = preg_replace('/\D/', '', $visitor->cpf);

        $result = $this->sambaService->deleteSambaUser($login);

        if (!$result['success']) {
            $errorMsg = $result['error'] ?? 'Erro desconhecido';
            
            if (stripos($errorMsg, 'NT_STATUS_NO_SUCH_USER') !== false || stripos($errorMsg, 'not found') !== false || stripos($errorMsg, 'Unable to find user') !== false) {
                \Log::warning('Usuário SAMBA não encontrado, continuando remoção local', ['login' => $login]);
            } else {
                \Log::error('Erro ao deletar usuário SAMBA', [
                    'login' => $login,
                    'error' => $errorMsg,
                ]);
            }
        }

        Voucher::where('visitor_id', $visitor->id)->delete();

        $this->activityLogService->logVisitorDeleted($visitor->id, $visitor->name, $userId);

        $visitor->delete();
    }

    public function generatePassword(Visitor $visitor, ?int $userId = null): array
    {
        $userId = $userId ?? $visitor->created_by;
        
        $visitor->refresh();

        $login = preg_replace('/\D/', '', $visitor->cpf);
        $passwordPlain = $this->generateRandomPassword();

        if (!$visitor->expires_at || $visitor->expires_at->isPast()) {
            return ['success' => false, 'error' => 'Informe uma data de expiração válida antes de gerar a senha.'];
        }

        $expiresAt = $visitor->expires_at;

        $voucher = Voucher::firstOrNew(['visitor_id' => $visitor->id]);
        $isNewVoucher = !$voucher->exists;

        $voucher->login = $login;
        $voucher->password = $passwordPlain;
        $voucher->expires_at = $expiresAt;
        $voucher->created_by = $visitor->created_by;
        $voucher->save();

        if ($isNewVoucher) {
            $result = $this->sambaService->createSambaUser($login, $passwordPlain);
        } else {
            $result = $this->sambaService->updateSambaUserPassword($login, $passwordPlain);
        }

        if (!$result['success']) {
            Log::error('Erro ao gerar senha no SAMBA', [
                'visitor_id' => $visitor->id,
                'login' => $login,
                'error' => $result['error']
            ]);
        }

        if ($visitor->email) {
            $visitor->notify(new UpdateVisitorLogin(
                email: $login,
                password: $passwordPlain,
                expiresAt: $expiresAt->format('d/m/Y H:i')
            ));
        }

        $this->activityLogService->logPasswordGenerated($visitor->id, $visitor->name, $userId);

        return ['success' => true, 'visitor' => $visitor];
    }

    public function resendPassword(Visitor $visitor, int $userId): bool
    {
        $visitor->refresh();
        $voucher = Voucher::where('visitor_id', $visitor->id)->first();

        if (!$voucher) {
            return false;
        }

        if ($visitor->email) {
            $visitor->notify(new ResendVisitorLogin(
                email: $voucher->login,
                password: $voucher->password,
                expiresAt: $visitor->expires_at->format('d/m/Y H:i')
            ));

            $visitor->update(['email_sent' => true, 'email_sent_at' => now()]);
        }

        $this->activityLogService->logPasswordResent($visitor->id, $visitor->name, $userId);

        return true;
    }

    protected function generateRandomPassword(): string
    {
        return substr(md5(uniqid()), 0, 8);
    }
}