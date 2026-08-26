<?php

namespace App\Http\Controllers;

use App\Models\Visitor;
use App\Models\ActivityLog;
use App\Models\Voucher;
use App\Models\ImportBatch;
use App\Models\ImportError;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Carbon\Carbon;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Support\Collection;

class DashboardController extends Controller
{
    public function index(Request $request)
    {
        $user = auth()->user();
        $today = Carbon::today()->utc();
        $now = Carbon::now();

        return Inertia::render('dashboard', [
            'stats' => [
                'totalVisitors' => $this->totalVisitors($user),
                'totalVouchers' => $this->totalVouchers($user),
                'totalThisMonth' => $this->totalCreatedThisMonth($user),
                'expiredVisitors' => $this->expiredVisitorCount($today, $user),
            ],
            'importStats' => $this->importStats($user),
            'visitorsByDepartment' => $this->visitorsByDepartment($user),
            'visitorsByMonth' => $this->visitorsByMonth($user, $now),
            'nextToExpire' => $this->nextToExpire($user, $today),
            'alreadyExpired' => $this->alreadyExpired($user, $today),
            'recentActivities' => $this->recentActivities($user),
            'recentImports' => $this->recentImports($user),
        ]);
    }

    private function scopeDepartment(Builder $query, string $relation): void
    {
        $user = auth()->user();
        if ($user->isAdmin()) {
            return;
        }

        $query->whereHas($relation, fn ($q) =>
            $q->where('department_id', $user->department_id)
        );
    }

    private function totalVisitors($user): int
    {
        $q = Visitor::query();
        $this->scopeDepartment($q, 'creator');

        return $q->count();
    }

    private function totalVouchers($user): int
    {
        $q = Voucher::query();
        $this->scopeDepartment($q, 'visitor.creator');

        return $q->count();
    }

    private function totalCreatedThisMonth($user): int
    {
        $q = Visitor::whereYear('created_at', now()->year)
            ->whereMonth('created_at', now()->month);

        $this->scopeDepartment($q, 'creator');

        return $q->count();
    }

    private function expiredVisitorCount(Carbon $today, $user): int
    {
        $q = Visitor::where('expires_at', '<=', $today)
            ->where('expires_at', '>=', $today->copy()->subDays(7)->startOfDay());

        $this->scopeDepartment($q, 'creator');

        return $q->count();
    }

    private function visitorsByDepartment($user): Collection
    {
        $q = Visitor::selectRaw('users.department_id, departments.name, COUNT(*) as count')
            ->join('users', 'visitors.created_by', '=', 'users.id')
            ->join('departments', 'users.department_id', '=', 'departments.id');

        if (!$user->isAdmin()) {
            $q->where('users.department_id', $user->department_id);
        }

        return $q->groupBy('users.department_id', 'departments.name')
            ->orderByDesc('count')
            ->get()
            ->map(fn ($row) => [
                'id' => $row->department_id,
                'name' => $row->name,
                'count' => (int) $row->count,
            ]);
    }

    private function visitorsByMonth($user, Carbon $now): Collection
    {
        $q = Visitor::selectRaw('TO_CHAR(created_at, \'YYYY-MM\') as month, COUNT(*) as count')
            ->whereBetween('created_at', [
                $now->copy()->subMonths(11)->startOfMonth(),
                $now->endOfMonth(),
            ]);

        $this->scopeDepartment($q, 'creator');

        return $q->groupBy('month')->orderBy('month')->get();
    }

    private function nextToExpire($user, Carbon $today): Collection
    {
        $q = Voucher::with(['visitor.type', 'visitor.creator.department'])
            ->whereNotNull('expires_at')
            ->where('expires_at', '>=', $today->startOfDay())
            ->where('expires_at', '<', $today->copy()->addDays(8));

        $this->scopeDepartment($q, 'visitor.creator');

        return $q->orderBy('expires_at')->get();
    }

    private function alreadyExpired($user, Carbon $today): Collection
    {
        $q = Visitor::with(['type', 'creator.department'])
            ->where('expires_at', '<=', $today)
            ->where('expires_at', '>=', $today->copy()->subDays(7)->startOfDay());

        $this->scopeDepartment($q, 'creator');

        return $q->orderBy('expires_at', 'desc')->get();
    }

    private function recentActivities($user): Collection
    {
        $q = ActivityLog::with('user.department');
        $this->scopeDepartment($q, 'user');

        return $q->orderBy('created_at', 'desc')
            ->limit(5)
            ->get()
            ->map(fn ($log) => [
                'id' => $log->id,
                'user' => $log->user?->name,
                'user_role' => $log->user?->role,
                'department' => $log->user?->department?->name,
                'action' => $log->getDescription(),
                'created_at' => $log->created_at->format('d/m H:i'),
            ]);
    }

    private function importStats($user): array
    {
        $q = ImportBatch::where('status', '!=', 'deleted');
        $this->scopeDepartment($q, 'creator');

        $batchIds = (clone $q)->pluck('id');
        $totalErrors = ImportError::whereIn('import_batch_id', $batchIds)
            ->where('skipped', false)
            ->count();

        $totalSkipped = ImportError::whereIn('import_batch_id', $batchIds)
            ->where('skipped', true)
            ->count();

        $stats = $q->selectRaw('
                COUNT(*) as total_batches,
                COALESCE(SUM(total_rows), 0) as total_imported,
                COALESCE(SUM(success_count), 0) as total_success
            ')->first();

        return [
            'totalBatches' => $stats->total_batches ?? 0,
            'totalImported' => $stats->total_imported ?? 0,
            'totalSuccess' => $stats->total_success ?? 0,
            'totalErrors' => $totalErrors,
            'totalSkipped' => $totalSkipped,
        ];
    }

    private function recentImports($user): Collection
    {
        $q = ImportBatch::where('status', '!=', 'deleted')->with('creator:id,name');
        $this->scopeDepartment($q, 'creator');

        return $q->orderBy('created_at', 'desc')
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
    }
}
