<?php

namespace App\Console\Commands;

use App\Contracts\ActivityLogInterface;
use App\Contracts\SambaInterface;
use App\Models\Visitor;
use App\Models\Voucher;
use Carbon\Carbon;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class DisableExpiredVisitors extends Command
{
    protected $signature = 'visitors:disable-expired';
    protected $description = 'Remove voucher e usuário Samba de visitantes expirados';

    public function handle(SambaInterface $sambaService, ActivityLogInterface $activityLogService)
    {
        $today = Carbon::today();

        $visitors = Visitor::where('expires_at', '<', $today)
            ->whereHas('voucher')
            ->get();

        foreach ($visitors as $visitor) {
            DB::beginTransaction();

            try {
                $login = preg_replace('/\D/', '', $visitor->cpf);

                $sambaService->deleteSambaUser($login);

                Voucher::where('visitor_id', $visitor->id)->delete();

                $activityLogService->logVisitorExpired(
                    $visitor->id,
                    $login
                );

                DB::commit();

                Log::info('Visitante expirado: voucher e samba removidos', [
                    'visitor_id' => $visitor->id,
                    'login' => $login,
                ]);
            } catch (\Throwable $e) {
                DB::rollBack();

                Log::error('Erro ao processar visitante expirado', [
                    'visitor_id' => $visitor->id,
                    'error' => $e->getMessage(),
                ]);
            }
        }

        $this->info('Processo de expiração finalizado.');
    }
}
