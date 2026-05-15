<?php

namespace App\Http\Controllers;
use App\Models\Department;
use App\Http\Requests\VoucherIndexRequest;
use App\Models\User;
use App\Models\Voucher;
use App\Models\VisitorType;
use Inertia\Inertia;
use Carbon\Carbon;

class VouchersController extends Controller
{
    public function index(VoucherIndexRequest $request)
    {
        $user = auth()->user();
        $filters = $request->validated();

        $query = Voucher::with([
            'visitor.type',
            'visitor.creator.department',
        ])
            ->departmentFilter(
                $user,
                $filters['order_department'] ?? null
            )
            ->search($filters['search'] ?? null)
            ->typeFilter($filters['type_id'] ?? null)
            ->creatorFilter($filters['creator_id'] ?? null)
            ->applyOrdering(
                $filters['expire_sort'] ?? null,
                $filters['created_sort'] ?? null,
                $filters['sort'] ?? 'id',
                $filters['direction'] ?? 'desc'
            );

        $paginator = $query->paginate(12)->withQueryString();

        $today = Carbon::today();
        $paginator->getCollection()->transform(function ($voucher) use ($today) {
            $voucher->is_expired = $voucher->expires_at
                ? $voucher->expires_at->lt($today)
                : false;
            return $voucher;
        });

        $paginatorArray = $paginator->toArray();
        $paginatorArray['links'] = collect($paginatorArray['links'])
            ->map(fn($link) => [
                'url' => $link['url'],
                'label' => strip_tags(html_entity_decode($link['label'])),
                'active' => $link['active'] ?? false,
            ])
            ->all();

      return Inertia::render('vouchers/index', [
    'vouchers' => $paginatorArray,
    'filters' => $filters,
    'types' => VisitorType::select(['id', 'name'])->get(),
    'creators' => User::select(['id', 'name'])->get(),
    'departments' => Department::select(['id', 'name'])->get(),
    'user_department_id' => $user->department_id,
]);

    }
}
