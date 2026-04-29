<?php

namespace App\Http\Controllers;

use App\Models\Department;
use App\Services\ActivityLogService;
use Illuminate\Http\Request;
use Inertia\Inertia;

class DepartmentsController extends Controller
{
public function index(Request $request)
{
    $query = Department::query();

    if ($request->search) {
        $query->where(function($q) use ($request) {
            $q->where('name', 'like', '%' . $request->search . '%');
        });
    }

    $sort = $request->get('sort', 'id');
    $direction = $request->get('direction', 'desc');

    $paginator = $query 
        ->orderBy($sort, $direction)
        ->paginate(10)
        ->withQueryString();

    // remover HTML dos labels da paginação
    $paginatorArray = $paginator->toArray();
    $paginatorArray['links'] = collect($paginatorArray['links'])->map(function ($link) {
        return [
            'url' => $link['url'],
            'label' => strip_tags(html_entity_decode($link['label'])),
            'active' => $link['active'] ?? false,
        ];
    })->all();

    return Inertia::render('departments/index', [
        'departments' => $paginatorArray,
        'filters' => $request->only('search', 'sort', 'direction'),
    ]);
}


    public function create()
    {
        return Inertia::render('departments/create');
    }

    public function store(Request $request, ActivityLogService $activityLogService)
    {
        $request->validate(
            [
                'name' => 'required|string|unique:departments,name',
            ],
            [
                'name.unique' => 'Este departamento já existe!',
            ]
        );

        $department = Department::create([
            'name' => $request->name,
        ]);

        $activityLogService->logDepartmentCreated(
            $department->id,
            $department->name
        );

        return redirect()->route('departments.index')
            ->with('success', 'Departamento criado com sucesso!');
    }


    public function edit(Department $department)
    {
        return Inertia::render('departments/edit', [
            'department' => $department,
        ]);
    }
    public function update(Request $request, Department $department)
    {
        $request->validate(
            [
                'name' => 'required|string|unique:departments,name,' . $department->id,
            ],
            [
                'name.unique' => 'Este departamento já existe!',
                'name.required' => 'O nome é obrigatório.',
            ]
        );

        $department->update([
            'name' => $request->name,
        ]); 

        return redirect()->route('departments.index')
            ->with('success', 'Departamento atualizado com sucesso!');
    }


    public function destroy(Department $department, ActivityLogService $activityLogService)
    {
        if ($department->users()->exists()) {
            return back()->withErrors([
                'error' => 'Não é possível deletar, existem usuários relacionados a este departamento!'
            ]);
        }

        $departmentName = $department->name;
        $department->delete();

        $activityLogService->logDepartmentDeleted(
            $department->id,
            $departmentName
        );

        return redirect()->route('departments.index')
            ->with('success', 'Departamento excluído');
    }

}