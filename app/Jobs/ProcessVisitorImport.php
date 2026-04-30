<?php

namespace App\Jobs;

use App\Models\Visitor;
use App\Models\Voucher;
use App\Models\ImportBatch;
use App\Notifications\VisitorLogin;
use App\Contracts\SambaInterface;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Log;

class ProcessVisitorImport implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public int $tries = 3;
    public int $backoff = 60;

    public function __construct(
        public Visitor $visitor,
        public ImportBatch $batch
    ) {}

    public function handle(SambaInterface $sambaService): void
    {
        try {
            $login = preg_replace('/\D/', '', $this->visitor->cpf);
            $passwordPlain = substr(md5(uniqid()), 0, 8);

            Voucher::create([
                'visitor_id' => $this->visitor->id,
                'login' => $login,
                'password' => $passwordPlain,
                'expires_at' => $this->visitor->expires_at,
                'created_by' => $this->visitor->created_by,
            ]);

            $result = $sambaService->createSambaUser($login, $passwordPlain);

            if (!$result['success']) {
                Log::error("Erro ao criar usuário Samba", [
                    'visitor_id' => $this->visitor->id,
                    'error' => $result['error'] ?? 'Erro desconhecido'
                ]);
                $this->batch->increment('error_count');
                return;
            }

            if ($this->visitor->email) {
                $this->visitor->notify(new VisitorLogin(
                    email: $login,
                    password: $passwordPlain,
                    expiresAt: $this->visitor->expires_at->format('d/m/Y H:i')
                ));

                $this->visitor->update([
                    'email_sent' => true,
                    'email_sent_at' => now(),
                ]);
            }

            $this->batch->increment('success_count');

            Log::info("Visitante importado com sucesso", [
                'visitor_id' => $this->visitor->id,
                'name' => $this->visitor->name,
                'email_sent' => $this->visitor->email_sent,
            ]);

        } catch (\Throwable $e) {
            Log::error("Erro ao processar visitante importado", [
                'visitor_id' => $this->visitor->id,
                'error' => $e->getMessage()
            ]);
            $this->batch->increment('error_count');
            throw $e;
        }
    }

    public function failed(\Throwable $exception): void
    {
        $this->batch->increment('error_count');
        
        \App\Models\ImportError::create([
            'import_batch_id' => $this->batch->id,
            'line_number' => $this->visitor->id,
            'error_message' => 'Processamento: ' . $exception->getMessage(),
            'row_data' => [
                'name' => $this->visitor->name,
                'cpf' => $this->visitor->cpf,
                'email' => $this->visitor->email,
            ],
        ]);
        
        Log::error("Job falhou para visitante", [
            'visitor_id' => $this->visitor->id,
            'error' => $exception->getMessage()
        ]);
    }
}