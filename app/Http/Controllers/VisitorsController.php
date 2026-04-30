<?php

namespace App\Http\Controllers;

use App\Http\Requests\VisitorIndexRequest;
use App\Models\Visitor;
use App\Models\VisitorType;
use App\Models\Department;
use App\Rules\CpfRule;
use App\Services\VisitorService;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Inertia\Inertia;

class VisitorsController extends Controller
{
    public function __construct(
        protected VisitorService $visitorService
    ) {}

    public function index(VisitorIndexRequest $request)
    {
        $user = auth()->user();
        $filters = $request->validated();

        $query = Visitor::with(['type', 'creator'])
            ->departmentFilter(
                $user,
                $filters['order_department'] ?? null
            )
            ->search($filters['search'] ?? null)
            ->typeFilter($filters['type_id'] ?? null)
            ->applyOrdering(
                $filters['order_name'] ?? null,
                $filters['order_created'] ?? null,
                $filters['sort'] ?? 'id',
                $filters['direction'] ?? 'desc'
            );

        $paginator = $query->paginate(10)->withQueryString();

        $paginatorArray = $paginator->toArray();
        $paginatorArray['links'] = collect($paginatorArray['links'])
            ->map(fn($link) => [
                'url' => $link['url'],
                'label' => strip_tags(html_entity_decode($link['label'])),
                'active' => $link['active'] ?? false,
            ])
            ->all();

        return Inertia::render('visitors/index', [
            'visitors' => $paginatorArray,
            'filters' => $filters,
            'types' => VisitorType::select(['id', 'name'])->get(),
            'user_department_id' => $user->department_id,
            'departments' => Department::select(['id', 'name'])->get(),
        ]);
    }

    public function create()
    {
        return Inertia::render('visitors/create', [
            'types' => VisitorType::all(),
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'min:3', 'max:255'],
            'cpf' => [
                'required',
                Rule::unique('visitors', 'cpf'),
                new CpfRule,
            ],
            'email' => [
                'required',
                'email',
                Rule::unique('visitors', 'email'),
            ],
            'phone' => ['nullable', 'string', 'max:20'],
            'type_id' => ['required', 'exists:visitor_types,id'],
            'expires_at' => ['required', 'date', 'after:now'],
        ]);

        try {
            $this->visitorService->create([
                ...$validated,
                'created_by' => auth()->id(),
            ]);

            return redirect()
                ->route('visitors.index')
                ->with('success', 'Visitante criado com sucesso.');
        } catch (\Throwable $e) {
            return back()
                ->withErrors(['samba' => 'Não foi possível criar o usuário no sistema de acesso (Samba). Tente novamente ou contate o suporte.'])
                ->withInput();
        }
    }

    public function edit(Visitor $visitor)
    {
        $visitor->load(['type', 'voucher']);

        return Inertia::render('visitors/edit', [
            'visitor' => $visitor,
            'types' => VisitorType::all(),
            'voucher' => $visitor->voucher,
        ]);
    }

    public function update(Request $request, Visitor $visitor)
    {
        $request->validate([
            'name' => 'required',
            'cpf' => 'required',
            'email' => 'nullable|email',
            'type_id' => 'required|exists:visitor_types,id',
            'expires_at' => 'required|date',
        ]);

        $this->visitorService->update($visitor, $request->all());

        return back()->with('success', 'Visitante atualizado com sucesso.');
    }

    public function generatePassword(Visitor $visitor)
    {
        $this->visitorService->generatePassword($visitor);

        return back()->with('success', 'Nova senha gerada e enviada com sucesso.');
    }

    public function resendPassword(Visitor $visitor)
    {
        $result = $this->visitorService->resendPassword($visitor);

        if (!$result) {
            return back()->with('error', 'Voucher não encontrado para este visitante.');
        }

        return back()->with('success', 'Voucher reenviado com sucesso.');
    }

    public function destroy(Visitor $visitor)
    {
        $this->visitorService->delete($visitor);

        return back()->with('success', 'Visitante removido com sucesso.');
    }
}