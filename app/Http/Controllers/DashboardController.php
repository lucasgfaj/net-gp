<?php

namespace App\Http\Controllers;

use App\Models\Visitor;
use App\Models\Department;
use App\Models\ActivityLog;
use App\Models\Voucher;
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

        $visitorsByDepartment = Department::all()
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
            DATE_FORMAT(created_at, "%Y-%m") as month,
            COUNT(*) as count
        ')
            ->whereBetween('created_at', [
                $now->copy()->subMonths(11)->startOfMonth(),
                $now->endOfMonth(),
            ])
            ->groupBy('month')
            ->orderBy('month')
            ->get();

        $nextToExpire = Voucher::with([
            'visitor.type',
            'visitor.creator.department',
        ])
            ->whereNotNull('expires_at')
            ->where('expires_at', '>', $now)
            ->where('expires_at', '<=', $now->copy()->addDays(7))
            ->orderBy('expires_at')
            ->limit(10)
            ->get();

        $alreadyExpired = Visitor::with([
            'type',
            'creator.department',
        ])
            ->where('expires_at', '<=', $now)
            ->whereHas('voucher')
            ->orderBy('expires_at', 'desc')
            ->limit(10)
            ->get();

        $recentActivities = ActivityLog::with('user.department')
            ->orderBy('created_at', 'desc')
            ->limit(15)
            ->get()
            ->map(function ($log) {
                switch ($log->action) {
                    case 'visitor_created':
                        $description = "criou visitante " . ($log->data['visitor_name'] ?? '');
                        break;
                    case 'visitor_updated':
                        $description = "atualizou visitante " . ($log->data['visitor_name'] ?? '');
                        break;
                    case 'visitor_deleted':
                        $description = "removeu visitante " . ($log->data['visitor_name'] ?? '');
                        break;
                    case 'visitor_password_generated':
                        $description = "gerou nova senha para " . ($log->data['visitor_name'] ?? '');
                        break;
                    case 'visitor_expired':
                        $description = "visitante expirou (login: " . ($log->data['login'] ?? '') . ")";
                        break;
                    case 'department_created':
                        $description = "criou department " . ($log->data['department_name'] ?? '');
                        break;
                    case 'department_deleted':
                        $description = "removeu department " . ($log->data['department_name'] ?? '');
                        break;
                    case 'visitor_type_created':
                        $description = "criou tipo " . ($log->data['type_name'] ?? '');
                        break;
                    case 'visitor_type_deleted':
                        $description = "removeu tipo " . ($log->data['type_name'] ?? '');
                        break;
                    default:
                        $description = $log->action;
                        break;
                }

                return [
                    'id' => $log->id,
                    'user' => $log->user ? $log->user->name : null,
                    'department' => $log->user && $log->user->department ? $log->user->department->name : null,
                    'action' => $description,
                    'created_at' => $log->created_at->format('d/m H:i'),
                ];
            });

        return Inertia::render('dashboard', [
            'stats' => [
                'totalVisitors' => $totalVisitors,
                'totalThisMonth' => $totalThisMonth,
                'expiredVisitors' => $expiredVisitors,
            ],
            'visitorsByDepartment' => $visitorsByDepartment,
            'visitorsByMonth' => $visitorsByMonth,
            'nextToExpire' => $nextToExpire,
            'alreadyExpired' => $alreadyExpired,
            'recentActivities' => $recentActivities,
        ]);
    }
}