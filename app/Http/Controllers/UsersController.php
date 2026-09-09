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

        $user = auth()->user();

        $query = User::with('department')
            ->search($filters['search'] ?? null)
            ->departmentFilter($filters['department_id'] ?? null, $user)
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
        $paginatorArray['links'] = collect($paginatorArray['links'])->map(fn($link) => [
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
            'departments' => Department::select(['id', 'name'])->get(),
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|email|unique:users,email',
            'username' => 'required|string|unique:users,username',
            'department_id' => 'required|exists:departments,id',
            'role' => 'required|in:admin,operator',
        ]);

        $user = User::create([
            ...$validated,
            'password' => '$ldap$',
        ]);

        return redirect()->route('users.index')
            ->with('success', 'Usuário criado com sucesso.');
    }

    public function show(User $user)
    {
        $user->load('department');

        return Inertia::render('users/show', [
            'user' => $user,
        ]);
    }

    public function edit(User $user)
    {
        return Inertia::render('users/edit', [
            'user' => $user,
            'authUser' => auth()->user(),
            $user->load('department'),
            'readOnly' => auth()->id() === $user->id || auth()->user()->role !== 'admin',
        ]);
    }

    public function update(Request $request, User $user)
    {
        $request->validate([
            'active' => ['required', 'in:0,1'],
        ]);

        $user->load('department');
        $user->syncRoleFromDepartment();
        $user->enabled = $request->active === '1';
        $user->save();

        return redirect()->route('users.index');
    }

    public function destroy(User $user)
    {
        if ($user->id === auth()->id()) {
            return back()->withErrors(['error' => 'Você não pode excluir seu próprio usuário.']);
        }

        $user->delete();

        return redirect()->route('users.index')
            ->with('success', 'Usuário excluído com sucesso.');
    }
}
