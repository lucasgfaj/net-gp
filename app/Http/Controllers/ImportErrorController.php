<?php

namespace App\Http\Controllers;

use App\Models\ImportError;
use App\Models\Visitor;
use App\Jobs\ProcessVisitorImport;
use App\Exceptions\VisitorException;
use App\Services\VisitorImportService;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

class ImportErrorController extends Controller
{
    public function skip(ImportError $importError)
    {
        $importError->load('batch');

        $importError->update(['skipped' => true]);
        $this->checkBatchCompletion($importError->batch);

        return back()->with('success', 'Erro pulado com sucesso.');
    }

    public function destroy(ImportError $importError)
    {
        $importError->load('batch');

        $importError->batch->decrement('error_count');
        $importError->delete();
        $this->checkBatchCompletion($importError->batch);

        return back()->with('success', 'Erro removido com sucesso.');
    }

    private function checkBatchCompletion($batch): void
    {
        $remaining = ImportError::where('import_batch_id', $batch->id)
            ->where('skipped', false)
            ->count();

        if ($remaining === 0) {
            $batch->update(['status' => 'completed']);
        }
    }

    public function update(Request $request, ImportError $importError)
    {
        $importError->load('batch');

        $data = $request->validate([
            'name' => 'required|string|max:255',
            'cpf' => 'required|string',
            'email' => 'nullable|string',
            'phone' => 'nullable|string',
            'reason' => 'nullable|string',
            'expires_at' => 'nullable|string',
            'type_id' => 'nullable|integer|exists:visitor_types,id',
        ]);

        $cpf = preg_replace('/\D/', '', $data['cpf']);
        $row = [
            $data['name'],
            $cpf,
            $data['email'] ?? '',
            $data['phone'] ?? '',
            $data['reason'] ?? '',
            $data['expires_at'] ?? '',
        ];

        try {
            DB::beginTransaction();

            $service = app(VisitorImportService::class);
            $ref = new \ReflectionMethod($service, 'validateRow');
            $ref->setAccessible(true);
            $ref->invoke($service, $row, $importError->line_number);

            $visitor = Visitor::create([
                'name' => $data['name'],
                'cpf' => $cpf,
                'email' => $data['email'] ?: null,
                'phone' => $data['phone'] ?: null,
                'type_id' => $data['type_id'] ?? 1,
                'school' => $data['reason'] ?: null,
                'expires_at' => $data['expires_at']
                    ? Carbon::parse($data['expires_at'])->startOfDay()
                    : now()->addDays(7)->startOfDay(),
                'created_by' => $importError->batch->created_by,
                'enabled' => true,
                'import_batch_id' => $importError->batch->id,
            ]);

            ProcessVisitorImport::dispatch($visitor, $importError->batch);

            $importError->batch->decrement('error_count');
            $importError->delete();

            DB::commit();

            return back()->with('success', 'Registro corrigido e reenviado com sucesso.');
        } catch (VisitorException $e) {
            DB::rollBack();

            $importError->update([
                'row_data' => $row,
                'error_message' => $e->getMessage(),
            ]);

            throw ValidationException::withMessages(['edit_error' => $e->getMessage()]);
        }
    }
}
