<?php

namespace App\Http\Controllers;

use App\Http\Requests\UserIndexRequest;
use App\Models\User;
use App\Models\Department;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\Hash;
class UsersController extends Controller
{
    
public function index(UserIndexRequest $request)
{
    $filters = $request->validated();

    $query = User::with('department')
        ->search($filters['search'] ?? null)
        ->departmentFilter($filters['department_id'] ?? null)
        ->applyOrdering(
            $filters['order_name'] ?? null,
            $filters['order_created'] ?? null,
            $filters['sort'] ?? 'id',
            $filters['direction'] ?? 'desc'
        );

    $paginator = $query
        ->paginate(10)
        ->withQueryString();

    $paginatorArray = $paginator->toArray();
    $paginatorArray['links'] = collect($paginatorArray['links'])->map(fn ($link) => [
        'url' => $link['url'],
        'label' => strip_tags(html_entity_decode($link['label'])),
        'active' => $link['active'] ?? false,
    ])->all();

    return Inertia::render('users/index', [
        'users' => $paginatorArray,
        'filters' => $filters,
        'departments' => Department::select(['id', 'name'])->get(),
    ]);
}




    public function create()
    {
        return Inertia::render('users/create', [
            'departments' => Department::all(),
        ]);
    }

    public function store(Request $request)
    {
        $request->validate([
            'name' => ['required'],
            'email' => ['required', 'email', 'unique:users,email'],
            'password' => ['required', 'min:6'],
            'role' => ['required', 'in:admin,operator'],
            'department_id' => ['required', 'exists:departments,id'],
        ]);

        User::create([
            'name' => $request->name,
            'email' => $request->email,
            'department_id' => $request->department_id,
            'role' => $request->role,
            'password' => Hash::make($request->password),
        ]);

        return redirect()->route('users.index');
    }

    public function edit(User $user)
    {
        return Inertia::render('users/edit', [
            'user' => $user,
            'authUser' => auth()->user(),
            'departments' => Department::all(),
        ]);
    }

    public function update(Request $request, User $user)
    {
        $isSelf = auth()->id() === $user->id;

        // Validações gerais
        $request->validate([
            'name' => ['required'],
            'email' => ['required', 'email', 'unique:users,email,' . $user->id],
            'password' => ['nullable', 'min:6'],
            'role' => ['required', 'in:admin,operator'],
            'department_id' => ['required', 'exists:departments,id'],
        ]);

        // Começa com os valores que sempre podem ser alterados
        $data = [
            'name' => $request->name,
        ];

        // Se NÃO for ele mesmo → pode alterar email, role e departamento
        if (!$isSelf) {
            $data['email'] = $request->email;
            $data['role'] = $request->role;
            $data['department_id'] = $request->department_id;
        }

        // Senha opcional
        if ($request->filled('password')) {
            $data['password'] = Hash::make($request->password);
        }

        $user->update($data);

        return redirect()->route('users.index');
    }

    public function destroy(User $user)
    {

        $isSelf = auth()->id() === $user->id;

        if ($isSelf) {
            return back()->withErrors([
                'error' => 'Não é possível deletar seu próprio usuário.'
            ]);
        }

        $user->delete();

        return redirect()->route('users.index')
             ->with('success', 'Usuário excluído');
    }
}
