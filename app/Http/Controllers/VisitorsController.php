<?php

namespace App\Http\Controllers;

use App\Http\Requests\VisitorIndexRequest;
use App\Models\Visitor;
use App\Models\VisitorType;
use App\Models\Department;
use App\Rules\CpfRule;
use App\Services\VisitorService;
use App\Exceptions\VisitorException;
use Carbon\Carbon;
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
            'is_admin' => $user->isAdmin(),
            'departments' => Department::select(['id', 'name'])->get(),
        ]);
    }

    public function create()
    {
        return Inertia::render('visitors/create', [
            'types' => VisitorType::all(),
        ]);
    }

    public function show(Visitor $visitor)
    {
        $visitor->load(['type', 'voucher', 'creator.department']);

        return Inertia::render('visitors/show', [
            'visitor' => $visitor,
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => [
                'required',
                'string',
                'min:2',
                'max:255',
                function ($attribute, $value, $fail) {
                    $name = trim($value);
                    if (preg_match('/[0-9]/', $name)) {
                        $fail('Nome não pode conter números');
                    }
                    if (preg_match('/(.)\1{5,}/', $name)) {
                        $fail('Nome inválido');
                    }
                }
            ],
            'cpf' => [
                'required',
                'string',
                'min:11',
                'max:14',
                Rule::unique('visitors', 'cpf'),
                new CpfRule,
            ],
            'email' => [
                'required',
                'email',
                Rule::unique('visitors', 'email'),
            ],
            'phone' => [
                'nullable',
                'string',
                'min:10',
                'max:15',
            ],
            'type_id' => ['required', 'exists:visitor_types,id'],
            'expires_at' => [
                'required',
                'date',
                'after:now',
                function ($attribute, $value, $fail) {
                    $inputDate = \Carbon\Carbon::parse($value);
                    $today = now()->startOfDay();
                    $maxDate = $today->copy()->addYears(2);
                    
                    if ($inputDate->year === 2030 && $inputDate->year > $today->year) {
                        $maxDate = $today->copy()->addYears(4);
                    } elseif ($inputDate->year >= 2028) {
                        $maxDate = $today->copy()->addYears(2);
                    }
                    
                    if ($inputDate->isAfter($maxDate)) {
                        $fail('A data máxima é ' . $maxDate->format('d/m/Y') . '. Após esse ano não é permitida.');
                    }
                },
            ],
        ]);

        try {
            $visitor = $this->visitorService->create([
                ...$validated,
                'created_by' => auth()->id(),
            ]);

            $login = preg_replace('/\D/', '', $visitor->cpf);
            
            return redirect()
                ->route('visitors.index')
                ->with('success', "Visitante criado com sucesso. Login: {$login} | Senha enviada para {$visitor->email}");
        } catch (VisitorException $e) {
            $field = $e->getField();
            
            if ($field) {
                return back()
                    ->withErrors([$field => $e->getMessage()])
                    ->withInput();
            }
            
            return back()
                ->withErrors(['samba' => $e->getMessage()])
                ->withInput();
        } catch (\Throwable $e) {
            return back()
                ->withErrors(['error' => 'Erro interno do servidor. Contate o suporte.'])
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
            'expires_at' => [
                'required',
                'date',
                'after:now',
                function ($attribute, $value, $fail) {
                    $inputDate = \Carbon\Carbon::parse($value);
                    $today = now()->startOfDay();
                    
                    if ($inputDate->year >= 2028) {
                        $maxDate = $today->copy()->addYears(2);
                        $fail('A data máxima é ' . $maxDate->format('d/m/Y') . '. Após esse ano não é permitida.');
                    }
                },
            ],
        ]);

        $this->visitorService->update($visitor, $request->all(), auth()->id());

        return back()->with('success', 'Visitante atualizado com sucesso.');
    }

    public function generatePassword(Visitor $visitor)
    {
        if ($visitor->expires_at && $visitor->expires_at->isPast()) {
            return back()->with('error', 'A data de expiração deve ser hoje ou posterior.');
        }

        $result = $this->visitorService->generatePassword($visitor, auth()->id());

        if (!$result['success']) {
            return back()->with('error', $result['error']);
        }

        $visitor->refresh();
        
        $login = preg_replace('/\D/', '', $visitor->cpf);
        
        return back()->with('success', "Nova senha gerada. Login: {$login} | enviada para {$visitor->email}");
    }

    public function resendPassword(Visitor $visitor)
    {
        $result = $this->visitorService->resendPassword($visitor, auth()->id());

        if (!$result) {
            return back()->with('error', 'Voucher não encontrado para este visitante.');
        }
        
        $visitor->refresh();
        $login = preg_replace('/\D/', '', $visitor->cpf);

        return back()->with('success', "Voucher reenviado. Login: {$login} | Senha enviada para {$visitor->email}");
    }

    public function destroy(Visitor $visitor)
    {
        $login = preg_replace('/\D/', '', $visitor->cpf);
        $name = $visitor->name;

        try {
            $this->visitorService->delete($visitor, auth()->id());
        } catch (\Throwable $e) {
            return back()->with('error', 'Erro ao remover visitante: ' . $e->getMessage());
        }

        return back()->with('success', "Visitante '{$name}' removido com sucesso.");
    }
}