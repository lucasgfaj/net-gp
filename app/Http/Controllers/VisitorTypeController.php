<?php

namespace App\Http\Controllers;

use App\Models\VisitorType;
use Illuminate\Http\Request;
use Inertia\Inertia;

class VisitorTypeController extends Controller
{
    public function index(Request $request)
    {
        $query = VisitorType::query();

        if ($request->search) {
            $query->where(function ($q) use ($request) {
                $q->where('name', 'like', '%' . $request->search . '%');
            });
        }

        $sort = $request->get('sort', 'id');
        $direction = $request->get('direction', 'desc');

        $paginator = $query
            ->orderBy($sort, $direction)
            ->paginate(10)
            ->withQueryString();

        $paginatorArray = $paginator->toArray();
        $paginatorArray['links'] = collect($paginatorArray['links'])->map(function ($link) {
            return [
                'url' => $link['url'],
                'label' => strip_tags(html_entity_decode($link['label'])),
                'active' => $link['active'] ?? false,
            ];
        })->all();
        return Inertia::render('visitorTypes/index', [
            'visitorTypes' => $paginatorArray,
            'filters' => $request->only('search', 'sort', 'direction'),
        ]);
    }

    public function create()
    {
        return Inertia::render('visitorTypes/create');
    }

    public function store(Request $request)
    {
        $request->validate([
            'name' => ['required'],
            'description' => ['nullable'],
        ]);

        VisitorType::create($request->only(['name', 'description']));

        return redirect()->route('visitorTypes.index');
    }

    public function edit(VisitorType $visitorType)
    {
        return Inertia::render('visitorTypes/edit', [
            'type' => $visitorType,
        ]);
    }

    public function update(Request $request, VisitorType $visitorType)
    {
        $request->validate([
            'name' => ['required'],
            'description' => ['nullable'],
        ]);

        $visitorType->update($request->only(['name', 'description']));

        return redirect()->route('visitorTypes.index');
    }

    public function destroy(VisitorType $visitorType)
    {
        $visitorType->delete();

        return redirect()->route('visitorTypes.index');
    }
}
