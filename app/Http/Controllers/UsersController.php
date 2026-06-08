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
}
