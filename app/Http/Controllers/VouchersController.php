<?php

namespace App\Http\Controllers;

use App\Contracts\SambaInterface;
use App\Http\Requests\VoucherIndexRequest;
use App\Models\Department;
use App\Models\User;
use App\Models\Visitor;
use App\Models\Voucher;
use App\Models\VisitorType;
use Illuminate\Http\Request;
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
            'is_admin' => $user->isAdmin(),
        ]);
    }

    public function create()
    {
        return Inertia::render('vouchers/create', [
            'visitors' => Visitor::with('voucher')
                ->whereDoesntHave('voucher')
                ->get(['id', 'name', 'cpf']),
        ]);
    }

    public function store(Request $request, SambaInterface $sambaService)
    {
        $validated = $request->validate([
            'visitor_id' => 'required|exists:visitors,id',
            'password' => 'required|string|min:8',
        ]);

        $visitor = Visitor::findOrFail($validated['visitor_id']);
        $login = preg_replace('/\D/', '', $visitor->cpf);

        if (Voucher::where('visitor_id', $visitor->id)->exists()) {
            return back()->withErrors(['visitor_id' => 'Este visitante já possui voucher.']);
        }

        $result = $sambaService->createSambaUser($login, $validated['password']);

        if (!$result['success']) {
            return back()->withErrors(['password' => 'Erro ao criar usuário no Samba: ' . ($result['error'] ?? 'Desconhecido')]);
        }

        Voucher::create([
            'visitor_id' => $visitor->id,
            'login' => $login,
            'password' => $validated['password'],
            'expires_at' => $visitor->expires_at,
            'created_by' => auth()->id(),
        ]);

        return redirect()->route('vouchers.index')
            ->with('success', 'Voucher criado com sucesso.');
    }

    public function show(Voucher $voucher)
    {
        $voucher->load(['visitor.type', 'visitor.creator.department', 'creator']);

        return Inertia::render('vouchers/show', [
            'voucher' => $voucher,
        ]);
    }

    public function edit(Voucher $voucher)
    {
        $voucher->load('visitor');

        return Inertia::render('vouchers/edit', [
            'voucher' => $voucher,
        ]);
    }

    public function update(Request $request, Voucher $voucher)
    {
        $validated = $request->validate([
            'expires_at' => 'required|date|after:now',
        ]);

        $voucher->update([
            'expires_at' => $validated['expires_at'],
        ]);

        return redirect()->route('vouchers.index')
            ->with('success', 'Voucher atualizado com sucesso.');
    }

    public function destroy(Voucher $voucher, SambaInterface $sambaService)
    {
        $login = $voucher->login;

        $result = $sambaService->deleteSambaUser($login);

        if (!$result['success']) {
            $errorMsg = $result['error'] ?? '';
            if (stripos($errorMsg, 'NT_STATUS_NO_SUCH_USER') === false &&
                stripos($errorMsg, 'not found') === false &&
                stripos($errorMsg, 'Unable to find user') === false) {
                return back()->with('error', 'Erro ao remover usuário Samba: ' . $errorMsg);
            }
        }

        $voucher->delete();

        return redirect()->route('vouchers.index')
            ->with('success', 'Voucher removido com sucesso.');
    }
}
