<?php

namespace App\Http\Controllers;

use App\Services\VisitorImportService;
use App\Models\VisitorType;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Carbon\Carbon;

class VisitorImportController extends Controller
{
    public function index()
    {
        return Inertia::render('visitors/import', [
            'types' => VisitorType::select(['id', 'name'])->get(),
        ]);
    }

    public function store(Request $request)
    {
        $request->validate([
            'file' => 'required|file|mimes:csv,txt|max:5120',
            'expires_at' => 'nullable|date',
            'type_id' => 'nullable|exists:visitor_types,id',
        ]);

        $file = $request->file('file');
        $filename = $file->getClientOriginalName();

        $handle = fopen($file->path(), 'r');

        $header = fgetcsv($handle);

        if (!$header) {
            fclose($handle);
            return back()->withErrors(['file' => 'Arquivo vazio ou inválido']);
        }

        $rows = [];
        while (($row = fgetcsv($handle, 1000, ',')) !== false) {
            $rows[] = $row;
        }
        fclose($handle);

        if (empty($rows)) {
            return back()->withErrors(['file' => 'Nenhum dado encontrado no arquivo']);
        }

        $expiresAt = $request->input('expires_at')
            ? Carbon::parse($request->input('expires_at'))->format('Y-m-d')
            : now()->addDays(7)->format('Y-m-d');

        $typeId = $request->input('type_id') ?? 3;

        $importService = new VisitorImportService();
        $batch = $importService->import(
            $rows,
            auth()->id(),
            $filename,
            $expiresAt,
            $typeId
        );

        return redirect()->route('visitors.index')
            ->with('success', "Importação iniciada: {$batch->total_rows} visitante(s) serão processados em background. O envio de e-mails pode levar alguns minutos.");
    }
}