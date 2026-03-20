<?php

namespace App\Http\Controllers;

use App\Models\VisitorType;
use Illuminate\Http\Request;
use Inertia\Inertia;

class VisitorTypeController extends Controller
{
    public function index()
    {
        return Inertia::render('visitor-types/index', [
            'types' => VisitorType::all(),
        ]);
    }

    public function create()
    {
        return Inertia::render('visitor-types/create');
    }

    public function store(Request $request)
    {
        $request->validate([
            'name' => ['required'],
            'description' => ['nullable'],
        ]);

        VisitorType::create($request->only(['name', 'description']));

        return redirect()->route('visitor-types.index');
    }

    public function edit(VisitorType $visitorType)
    {
        return Inertia::render('visitor-types/edit', [
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

        return redirect()->route('visitor-types.index');
    }

    public function destroy(VisitorType $visitorType)
    {
        $visitorType->delete();

        return redirect()->route('visitor-types.index');
    }
}
