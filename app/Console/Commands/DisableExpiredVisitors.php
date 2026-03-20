<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\Visitor;
use App\Models\Voucher;
use App\Services\SambaService;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Carbon\Carbon;

class DisableExpiredVisitors extends Command
{
    protected $signature = 'visitors:disable-expired';
    protected $description = 'Remove voucher e usuário Samba de visitantes expirados';

    public function handle(SambaService $sambaService)
    {
        $now = Carbon::now();

        $visitors = Visitor::where('expires_at', '<=', $now)
            ->whereHas('voucher')
            ->get();

        foreach ($visitors as $visitor) {
            DB::beginTransaction();

            try {
                $login = preg_replace('/\D/', '', $visitor->cpf);

                $sambaService->deleteSambaUser($login);

                Voucher::where('visitor_id', $visitor->id)->delete();

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
