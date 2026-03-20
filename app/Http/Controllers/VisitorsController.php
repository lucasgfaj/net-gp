<?php

namespace App\Http\Controllers;

use App\Http\Requests\VisitorIndexRequest;
use App\Models\Visitor;
use App\Models\VisitorType;
use App\Models\Voucher;
use App\Models\Department;
use App\Notifications\ResendVisitorLogin;
use App\Notifications\UpdateVisitorLogin;
use App\Notifications\VisitorLogin;
use App\Rules\CpfRule;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use App\Services\SambaService;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class VisitorsController extends Controller
{

    private SambaService $sambaService;

    public function __construct(SambaService $sambaService)
    {
        $this->sambaService = $sambaService;
    }

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

   public function store(Request $request, Visitor $visitor)
{
    $validated = $request->validate([
        'name' => ['required', 'string', 'min:3', 'max:255'],
        'cpf' => [
            'required',
            Rule::unique('visitors', 'cpf')->ignore($visitor->id),
            new CpfRule,
        ],
        'email' => [
            'required',
            'email',
            Rule::unique('visitors', 'email')->ignore($visitor->id),
        ],
        'phone' => ['nullable', 'string', 'max:20'],
        'type_id' => ['required', 'exists:visitor_types,id'],
        'expires_at' => ['required', 'date', 'after:now'],
    ]);

    try {

        DB::beginTransaction();

        $visitor = Visitor::create([
            ...$validated,
            'cpf' => preg_replace('/\D/', '', $validated['cpf']),
            'created_by' => auth()->id(),
            'enabled' => true,
        ]);

        $login = preg_replace('/\D/', '', $visitor->cpf);
        $passwordPlain = substr(md5(uniqid()), 0, 8);

        Voucher::create([
            'visitor_id' => $visitor->id,
            'login' => $login,
            'password' => $passwordPlain,
            'expires_at' => $visitor->expires_at,
            'created_by' => auth()->id(),
        ]);

        $result = $this->sambaService->createSambaUser(
            $login,
            $passwordPlain
        );

        if(!$result['success']){
            throw new \Exception($result['error'] ?? 'Erro ao criar usuário no Samba');
        }

        DB::commit();

        if ($visitor->email) {
            $visitor->notify(
                new VisitorLogin(
                    email: $login,
                    password: $passwordPlain,
                    expiresAt: $visitor->expires_at->format('d/m/Y H:i')
                )
            );
        }

        return redirect()
            ->route('visitors.index')
            ->with('success', 'Visitante criado com sucesso.');

    } catch (\Throwable $e) {

        DB::rollBack();

        Log::error('Erro ao criar visitante no Samba', [
            'error' => $e->getMessage(),
            'trace' => $e->getTraceAsString(),
        ]);

        return back()
            ->withErrors([
                'samba' => 'Não foi possível criar o usuário no sistema de acesso (Samba). Tente novamente ou contate o suporte.'
            ])
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

        $oldCpf = preg_replace('/\D/', '', $visitor->cpf);

        $visitor->update([
            ...$request->only([
                'name',
                'phone',
                'email',
                'type_id',
                'school',
                'expires_at',
                'enabled'
            ]),
            'cpf' => preg_replace('/\D/', '', $request->cpf),
        ]);

        $newCpf = preg_replace('/\D/', '', $visitor->cpf);

        $voucher = Voucher::firstOrNew([
            'visitor_id' => $visitor->id
        ]);

        $cpfChanged = $oldCpf !== $newCpf;

        if ($cpfChanged && $voucher->exists) {

            $this->sambaService->deleteSambaUser($oldCpf);

            $voucher->password = substr(md5(uniqid()), 0, 8);

            $this->sambaService->createSambaUser(
                $newCpf,
                $voucher->password
            );
        }
          else {

            if (!$voucher->password) {

                $voucher->password = substr(md5(uniqid()), 0, 8);

                $this->sambaService->createSambaUser(
                    $newCpf,
                    $voucher->password
                );
            }

            if ($request->boolean('reset_password')) {

                $voucher->password = substr(md5(uniqid()), 0, 8);

                $this->sambaService->updateSambaUserPassword(
                    $newCpf,
                    $voucher->password
                );
            }
        }

        $voucher->login = $newCpf;
        $voucher->expires_at = $visitor->expires_at;
        $voucher->save();

        // Enviar e-mail só se trocar CPF ou resetar senha
        if ($cpfChanged || $request->boolean('reset_password')) {
            // dispatch(new SendVoucherMail($visitor, $voucher));
        }

        return back()->with('success', 'Visitante atualizado com sucesso.');
    }

    public function generatePassword(Visitor $visitor)
    {
        $visitor->refresh();

        $login = preg_replace('/\D/', '', $visitor->cpf);
        $passwordPlain = substr(md5(uniqid()), 0, 8);

        $voucher = Voucher::firstOrNew([
            'visitor_id' => $visitor->id,
        ]);

        $isNewVoucher = !$voucher->exists;

        $voucher->login = $login;
        $voucher->password = $passwordPlain;
        $voucher->expires_at = $visitor->expires_at;
        $voucher->save();

        if ($isNewVoucher) {
            $this->sambaService->createSambaUser(
                $login,
                $passwordPlain
            );
        } else {
            $this->sambaService->updateSambaUserPassword(
                $login,
                $passwordPlain
            );
        }

        // Envia e-mail somente se tiver e-mail
        if ($visitor->email) {
            $visitor->notify(
                new UpdateVisitorLogin(
                    email: $login,
                    password: $passwordPlain,
                    expiresAt: $visitor->expires_at->format('d/m/Y H:i')
                )
            );
        }

        return back()->with('success', 'Nova senha gerada e enviada com sucesso.');
    }

    public function resendPassword(Visitor $visitor)
    {
        $visitor->refresh();

        $voucher = Voucher::where('visitor_id', $visitor->id)->first();

        if (!$voucher) {
            return back()->with('error', 'Voucher não encontrado para este visitante.');
        }

        if ($visitor->email) {
            $visitor->notify(
                new ResendVisitorLogin(
                    email: $voucher->login,
                    password: $voucher->password,
                    expiresAt: $visitor->expires_at->format('d/m/Y H:i')
                )
            );
        }

        return back()
            ->with('success', 'Voucher reenviado com sucesso.');
    }

    public function destroy(Visitor $visitor)
    {
        $login = preg_replace('/\D/', '', $visitor->cpf);

        $this->sambaService->deleteSambaUser($login);

        Voucher::where('visitor_id', $visitor->id)->delete();

        $visitor->delete();

        return back()->with('success', 'Visitante removido com sucesso.');
    }

}
