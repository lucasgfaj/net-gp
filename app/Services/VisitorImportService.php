<?php

namespace App\Services;

use App\Models\Visitor;
use App\Models\ImportBatch;
use App\Jobs\ProcessVisitorImport;
use Illuminate\Support\Facades\Log;
use Carbon\Carbon;

class VisitorImportService
{
    protected int $createdBy;
    protected ImportBatch $batch;
    protected string $defaultExpires;
    protected int $defaultTypeId;

    public function import(
        array $rows,
        int $createdBy,
        string $filename,
        ?string $expiresAt = null,
        ?int $typeId = null
    ): ImportBatch {
        $this->createdBy = $createdBy;
        $this->defaultExpires = $expiresAt ?? now()->addDays(7)->format('Y-m-d');
        $this->defaultTypeId = $typeId ?? 1;

        $this->batch = ImportBatch::create([
            'filename' => $filename,
            'total_rows' => count($rows),
            'status' => 'processing',
            'created_by' => $createdBy,
        ]);

        foreach ($rows as $index => $row) {
            $line = $index + 2;

            $row = array_map(fn($v) => is_null($v) ? '' : trim($v), $row);
            if (empty(array_filter($row, fn($v) => !empty($v)))) {
                continue;
            }

            try {
                $this->validateRow($row, $line);
                $visitor = $this->createVisitor($row);
                $visitor->update(['import_batch_id' => $this->batch->id]);

                ProcessVisitorImport::dispatch($visitor, $this->batch)
                    ->delay(now()->addSeconds($index * 2));

            } catch (\Throwable $e) {
                $this->batch->increment('error_count');
                
                \App\Models\ImportError::create([
                    'import_batch_id' => $this->batch->id,
                    'line_number' => $line,
                    'error_message' => $e->getMessage(),
                    'row_data' => $row,
                ]);
                
                Log::warning("Erro na importação linha {$line}", [
                    'row' => $row,
                    'error' => $e->getMessage()
                ]);
            }
        }

        $this->batch->refresh();
        if ($this->batch->success_count > 0 && $this->batch->error_count == 0) {
            $this->batch->update(['status' => 'completed']);
        } elseif ($this->batch->error_count == $this->batch->total_rows) {
            $this->batch->update(['status' => 'failed']);
        } else {
            $this->batch->update(['status' => 'partial']);
        }

        return $this->batch;
    }

    protected function validateRow(array $row, int $line): void
    {
        if (count($row) < 2) {
            throw new \Exception("Dados insuficientes (nome e CPF obrigatórios)");
        }

        $name = trim($row[0] ?? '');
        $cpf = preg_replace('/\D/', '', $row[1] ?? '');
        $email = isset($row[2]) ? trim($row[2]) : null;

        if (empty($name)) {
            throw new \Exception("Nome vazio");
        }

        if (empty($cpf) || strlen($cpf) < 11) {
            throw new \Exception("CPF inválido (muito curto)");
        }

        if (!$this->isValidCpf($cpf)) {
            throw new \Exception("CPF inválido (dígito verificador)");
        }

        if (!empty($email) && !filter_var($email, FILTER_VALIDATE_EMAIL)) {
            throw new \Exception("Email inválido");
        }

        if (Visitor::where('cpf', $cpf)->exists()) {
            throw new \Exception("CPF já cadastrado no sistema");
        }

        if (empty($email)) {
            throw new \Exception("Email é obrigatório para enviar login/senha");
        }

        if (Visitor::where('email', $email)->exists()) {
            throw new \Exception("Email já cadastrado no sistema");
        }
    }

    protected function isValidCpf(string $cpf): bool
    {
        $cpf = preg_replace('/\D/', '', $cpf);

        if (strlen($cpf) != 11) {
            return false;
        }

        if (preg_match('/(\d)\1{10}/', $cpf)) {
            return false;
        }

        $digits = array_map('intval', str_split($cpf));

        $sum = 0;
        for ($i = 0; $i < 9; $i++) {
            $sum += $digits[$i] * (10 - $i);
        }
        $firstDigit = ($sum % 11) < 2 ? 0 : 11 - ($sum % 11);

        if ($digits[9] != $firstDigit) {
            return false;
        }

        $sum = 0;
        for ($i = 0; $i < 10; $i++) {
            $sum += $digits[$i] * (11 - $i);
        }
        $secondDigit = ($sum % 11) < 2 ? 0 : 11 - ($sum % 11);

        return $digits[10] == $secondDigit;
    }

    protected function createVisitor(array $row): Visitor
    {
        $name = isset($row[0]) ? trim($row[0]) : '';
        $cpf = isset($row[1]) ? preg_replace('/\D/', '', $row[1]) : '';
        $email = isset($row[2]) && !empty(trim($row[2])) ? trim($row[2]) : null;
        $phone = isset($row[3]) && !empty(trim($row[3])) ? trim($row[3]) : null;
        $reason = isset($row[4]) && !empty(trim($row[4])) ? trim($row[4]) : null;

        $expiresAt = isset($row[5]) && !empty($row[5])
            ? Carbon::parse($row[5])->format('Y-m-d')
            : $this->defaultExpires;

        $visitor = Visitor::create([
            'name' => $name,
            'cpf' => $cpf,
            'email' => $email,
            'phone' => $phone,
            'type_id' => $this->defaultTypeId,
            'school' => $reason,
            'expires_at' => $expiresAt,
            'created_by' => $this->createdBy,
            'enabled' => true,
            'import_batch_id' => $this->batch->id,
        ]);

        $this->batch->increment('success_count');

        return $visitor;
    }

    protected function resolveTypeId(?string $typeName): int
    {
        if (empty($typeName)) {
            return $this->defaultTypeId;
        }

        $type = \App\Models\VisitorType::where('name', 'like', "%{$typeName}%")->first();
        return $type?->id ?? $this->defaultTypeId;
    }
}