<?php

namespace App\Http\Controllers;

use App\Models\Visitor;
use App\Models\Department;
use App\Models\ActivityLog;
use App\Models\Voucher;
use App\Models\ImportBatch;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Carbon\Carbon;

class DashboardController extends Controller
{
    public function index(Request $request)
    {
        $user = auth()->user();
        $today = Carbon::today();
        $now = Carbon::now();

        $queryBase = Visitor::query()
            ->whereHas('voucher');

        if ($user->department_id !== 1) {
            $queryBase->whereHas('creator', fn ($q) =>
                $q->where('department_id', $user->department_id)
            );
        }

        $totalVisitors = (clone $queryBase)->count();

        $totalThisMonth = (clone $queryBase)
            ->whereBetween('created_at', [
                $today->startOfMonth(),
                $today->endOfMonth(),
            ])
            ->count();

        $expiredVisitors = (clone $queryBase)
            ->where('expires_at', '<=', $now)
            ->count();

        $departments = Department::all();
        if ($user->department_id !== 1) {
            $departments = $departments->where('id', $user->department_id);
        }

        $visitorsByDepartment = $departments
            ->map(function ($department) use ($queryBase) {
                $count = (clone $queryBase)
                    ->whereHas('creator', function ($q) use ($department) {
                        $q->where('department_id', $department->id);
                    })
                    ->count();

                return [
                    'id' => $department->id,
                    'name' => $department->name,
                    'count' => $count,
                ];
            })
            ->filter(fn ($d) => $d['count'] > 0)
            ->values();

        $visitorsByMonth = Visitor::selectRaw('
            TO_CHAR(created_at, \'YYYY-MM\') as month,
            COUNT(*) as count
        ')
            ->whereBetween('created_at', [
                $now->copy()->subMonths(11)->startOfMonth(),
                $now->endOfMonth(),
            ])
            ->groupBy('month')
            ->orderBy('month')
            ->get();

        $nextToExpireQuery = Voucher::with([
            'visitor.type',
            'visitor.creator.department',
        ])
            ->whereNotNull('expires_at')
            ->where('expires_at', '>', $now)
            ->where('expires_at', '<=', $now->copy()->addDays(7));

        if ($user->department_id !== 1) {
            $nextToExpireQuery->whereHas('visitor.creator', fn ($q) =>
                $q->where('department_id', $user->department_id)
            );
        }

        $nextToExpire = $nextToExpireQuery
            ->orderBy('expires_at')
            ->limit(10)
            ->get();

        $alreadyExpiredQuery = Visitor::with([
            'type',
            'creator.department',
        ])
            ->where('expires_at', '<=', $now)
            ->whereHas('voucher');

        if ($user->department_id !== 1) {
            $alreadyExpiredQuery->whereHas('creator', fn ($q) =>
                $q->where('department_id', $user->department_id)
            );
        }

        $alreadyExpired = $alreadyExpiredQuery
            ->orderBy('expires_at', 'desc')
            ->limit(10)
            ->get();

        $recentActivities = ActivityLog::with('user.department')
            ->orderBy('created_at', 'desc')
            ->limit(5)
            ->get()
            ->map(function ($log) {
                switch ($log->action) {
                    case 'visitor_created':
                        $description = "Novo visitante: " . ($log->data['visitor_name'] ?? '');
                        break;
                    case 'visitor_updated':
                        $description = "Atualizou: " . ($log->data['visitor_name'] ?? '');
                        break;
                    case 'visitor_deleted':
                        $description = "Removeu: " . ($log->data['visitor_name'] ?? '');
                        break;
                    case 'visitor_password_generated':
                        $description = "Nova senha: " . ($log->data['visitor_name'] ?? '');
                        break;
                    case 'visitor_expired':
                        $description = "Expirou (login: " . ($log->data['login'] ?? '') . ")";
                        break;
                    case 'department_created':
                        $description = "Novo depto: " . ($log->data['department_name'] ?? '');
                        break;
                    case 'department_deleted':
                        $description = "Removeu dept: " . ($log->data['department_name'] ?? '');
                        break;
                    case 'visitor_type_created':
                        $description = "Novo tipo: " . ($log->data['type_name'] ?? '');
                        break;
                    case 'visitor_type_deleted':
                        $description = "Removeu tipo: " . ($log->data['type_name'] ?? '');
                        break;
                    default:
                        $description = $log->action;
                        break;
                }

                return [
                    'id' => $log->id,
                    'user' => $log->user ? $log->user->name : null,
                    'user_role' => $log->user ? $log->user->role : null,
                    'department' => $log->user && $log->user->department ? $log->user->department->name : null,
                    'action' => $description,
                    'created_at' => $log->created_at->format('d/m H:i'),
                ];
            });

        $importStatsQuery = ImportBatch::query();
        
        if ($user->department_id !== 1) {
            $importStatsQuery->where('created_by', $user->id);
        }

        $importStats = $importStatsQuery->selectRaw('
            COUNT(*) as total_batches,
            SUM(total_rows) as total_imported,
            SUM(success_count) as total_success,
            SUM(error_count) as total_errors
        ')->first();

        $recentImportsQuery = ImportBatch::with('creator:id,name');

        if ($user->department_id !== 1) {
            $recentImportsQuery->where('created_by', $user->id);
        }

        $recentImports = $recentImportsQuery
            ->orderBy('created_at', 'desc')
            ->limit(5)
            ->get()
            ->map(fn ($batch) => [
                'id' => $batch->id,
                'filename' => $batch->filename,
                'total' => $batch->total_rows,
                'success' => $batch->success_count,
                'errors' => $batch->error_count,
                'status' => $batch->status,
                'created_at' => $batch->created_at->format('d/m H:i'),
                'creator' => $batch->creator?->name,
            ]);

        return Inertia::render('dashboard', [
            'stats' => [
                'totalVisitors' => $totalVisitors,
                'totalThisMonth' => $totalThisMonth,
                'expiredVisitors' => $expiredVisitors,
            ],
            'importStats' => [
                'totalBatches' => $importStats->total_batches ?? 0,
                'totalImported' => $importStats->total_imported ?? 0,
                'totalSuccess' => $importStats->total_success ?? 0,
                'totalErrors' => $importStats->total_errors ?? 0,
            ],
            'visitorsByDepartment' => $visitorsByDepartment,
            'visitorsByMonth' => $visitorsByMonth,
            'nextToExpire' => $nextToExpire,
            'alreadyExpired' => $alreadyExpired,
            'recentActivities' => $recentActivities,
            'recentImports' => $recentImports,
        ]);
    }
}