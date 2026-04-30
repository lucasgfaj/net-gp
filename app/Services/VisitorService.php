<?php

namespace App\Services;

use App\Contracts\ActivityLogInterface;
use App\Contracts\SambaInterface;
use App\Contracts\VisitorInterface;
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
            $visitor = Visitor::create([
                'name' => $data['name'],
                'cpf' => preg_replace('/\D/', '', $data['cpf']),
                'email' => $data['email'] ?? null,
                'phone' => $data['phone'] ?? null,
                'type_id' => $data['type_id'],
                'expires_at' => $data['expires_at'],
                'created_by' => $data['created_by'],
                'enabled' => true,
            ]);

            $login = preg_replace('/\D/', '', $visitor->cpf);
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
                throw new \Exception($result['error'] ?? 'Erro ao criar usuário no Samba');
            }

            $this->activityLogService->logVisitorCreated($visitor->id, $visitor->name);

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

    public function update(Visitor $visitor, array $data): Visitor
    {
        $oldCpf = preg_replace('/\D/', '', $visitor->cpf);

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
        $cpfChanged = $oldCpf !== $newCpf;

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

        $this->activityLogService->logVisitorUpdated($visitor->id, $visitor->name);

        return $visitor->refresh();
    }

    public function delete(Visitor $visitor): void
    {
        $login = preg_replace('/\D/', '', $visitor->cpf);

        $this->sambaService->deleteSambaUser($login);
        Voucher::where('visitor_id', $visitor->id)->delete();

        $this->activityLogService->logVisitorDeleted($visitor->id, $visitor->name);

        $visitor->delete();
    }

    public function generatePassword(Visitor $visitor): array
    {
        $visitor->refresh();

        $login = preg_replace('/\D/', '', $visitor->cpf);
        $passwordPlain = $this->generatePassword();

        $voucher = Voucher::firstOrNew(['visitor_id' => $visitor->id]);
        $isNewVoucher = !$voucher->exists;

        $voucher->login = $login;
        $voucher->password = $passwordPlain;
        $voucher->expires_at = $visitor->expires_at;
        $voucher->save();

        if ($isNewVoucher) {
            $this->sambaService->createSambaUser($login, $passwordPlain);
        } else {
            $this->sambaService->updateSambaUserPassword($login, $passwordPlain);
        }

        if ($visitor->email) {
            $visitor->notify(new UpdateVisitorLogin(
                email: $login,
                password: $passwordPlain,
                expiresAt: $visitor->expires_at->format('d/m/Y H:i')
            ));
        }

        $this->activityLogService->logPasswordGenerated($visitor->id, $visitor->name);

        return ['success' => true, 'visitor' => $visitor];
    }

    public function resendPassword(Visitor $visitor): bool
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
        }

        return true;
    }

    protected function generateRandomPassword(): string
    {
        return substr(md5(uniqid()), 0, 8);
    }
}