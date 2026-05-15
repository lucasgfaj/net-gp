<?php

namespace App\Http\Controllers;

use App\Models\ImportBatch;
use App\Models\Visitor;
use App\Models\Voucher;
use App\Contracts\SambaInterface;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\DB;

class ImportBatchController extends Controller
{
    public function index(Request $request)
    {
        $user = auth()->user();

        $query = ImportBatch::query();

        if ($user->department_id !== 1) {
            $query->whereHas('creator', fn ($q) =>
                $q->where('department_id', $user->department_id)
            );
        }

        $batches = $query->with('creator:id,name')
            ->orderBy('created_at', 'desc')
            ->paginate(10);

        return Inertia::render('import-batches/index', [
            'batches' => $batches,
        ]);
    }

    public function show(ImportBatch $batch)
    {
        $user = auth()->user();

        $batch->load('creator:id,name,department_id');

        if ($user->department_id !== 1 && $batch->creator->department_id !== $user->department_id) {
            abort(403, 'Acesso negado');
        }

        $visitors = Visitor::where('import_batch_id', $batch->id)
            ->with(['type:id,name', 'voucher'])
            ->orderBy('created_at', 'desc')
            ->paginate(20);

        $errors = \App\Models\ImportError::where('import_batch_id', $batch->id)
            ->orderBy('line_number')
            ->get();

        return Inertia::render('import-batches/show', [
            'batch' => $batch,
            'visitors' => $visitors,
            'errors' => $errors,
        ]);
    }

    public function destroy(ImportBatch $batch, SambaInterface $sambaService)
    {
        $user = auth()->user();

        $batch->load('creator:id,name,department_id');

        if ($user->department_id !== 1 && $batch->creator->department_id !== $user->department_id) {
            abort(403, 'Acesso negado');
        }

        $visitors = Visitor::where('import_batch_id', $batch->id)->get();

        foreach ($visitors as $visitor) {
            $login = preg_replace('/\D/', '', $visitor->cpf);
            $sambaService->deleteSambaUser($login);

            Voucher::where('visitor_id', $visitor->id)->delete();
            $visitor->delete();
        }

        $batch->update(['status' => 'deleted']);

        return back()->with('success', 'Lote removido com sucesso.');
    }
}