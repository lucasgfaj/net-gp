<?php

namespace App\Services;

use App\Models\Visitor;
use App\Models\ImportBatch;
use App\Jobs\ProcessVisitorImport;
use App\Exceptions\VisitorException;
use Illuminate\Support\Facades\Log;
use Carbon\Carbon;

class VisitorImportService
{
    protected int $createdBy;
    protected ImportBatch $batch;
    protected string $defaultExpires;
    protected int $defaultTypeId;
    protected ?string $defaultReason = null;

    public function import(
        array $rows,
        int $createdBy,
        string $filename,
        ?string $expiresAt = null,
        ?int $typeId = null,
        ?int $totalRows = null,
        ?string $defaultReason = null
    ): ImportBatch {
        $this->createdBy = $createdBy;
        $this->defaultExpires = $expiresAt ?? now()->addDays(7)->startOfDay()->format('Y-m-d');
        $this->defaultTypeId = $typeId ?? 1;
        $this->defaultReason = $defaultReason;

        $this->batch = ImportBatch::create([
            'filename' => $filename,
            'total_rows' => $totalRows ?? count($rows),
            'status' => 'processing',
            'created_by' => $createdBy,
        ]);

        foreach ($rows as $index => $row) {
            $line = $index + 2;

            $row = array_map(fn($v) => is_null($v) ? '' : trim($v), $row);

            try {
                $this->validateRow($row, $line);

                $cpf = preg_replace('/\D/', '', $row[1]);
                $existing = Visitor::where('cpf', $cpf)->first();

                if ($existing) {
                    $existing->update([
                        'name' => $row[0],
                        'email' => !empty($row[2]) ? $row[2] : $existing->email,
                        'phone' => !empty($row[3]) ? $row[3] : $existing->phone,
                        'school' => !empty($row[4]) ? $row[4] : $existing->school,
                        'expires_at' => !empty($row[5]) ? Carbon::parse($row[5])->startOfDay() : $this->defaultExpires,
                        'import_batch_id' => $this->batch->id,
                    ]);
                    $visitor = $existing;
                } else {
                    $visitor = $this->createVisitor($row);
                    $visitor->update(['import_batch_id' => $this->batch->id]);
                }

                ProcessVisitorImport::dispatch($visitor, $this->batch)
                    ->delay(now()->addSeconds($index * 2));

            } catch (VisitorException $e) {
                $this->batch->increment('error_count');
                
                \App\Models\ImportError::create([
                    'import_batch_id' => $this->batch->id,
                    'line_number' => $line,
                    'error_message' => $e->getMessage(),
                    'row_data' => $row,
                ]);
                
                Log::warning("Erro na importação linha {$line}", [
                    'row' => $row,
                    'error_code' => $e->getCodeEnum(),
                    'error' => $e->getMessage()
                ]);
            }
        }

        $this->batch->refresh();
        
        $totalProcessed = $this->batch->success_count + $this->batch->error_count;
        
        if ($totalProcessed >= $this->batch->total_rows) {
            if ($this->batch->error_count > 0 && $this->batch->success_count == 0) {
                $this->batch->update(['status' => 'failed']);
            } else {
                $this->batch->update(['status' => 'completed']);
            }
        }

        return $this->batch->refresh();
    }

    protected function validateRow(array $row, int $line): void
    {
        if (count($row) < 2) {
            throw VisitorException::invalidName('Dados insuficientes (nome e CPF obrigatórios)');
        }

        $name = trim($row[0] ?? '');
        $cpf = preg_replace('/\D/', '', $row[1] ?? '');
        $email = (isset($row[2]) && trim($row[2] ?? '') !== '') ? trim($row[2]) : null;
        $phone = (isset($row[3]) && trim($row[3] ?? '') !== '') ? trim($row[3]) : null;

        if (empty($name)) {
            throw VisitorException::invalidName();
        }

        if (!$this->isValidName($name)) {
            throw VisitorException::invalidName('Nome deve conter apenas letras e espaços');
        }

        if (strlen($name) < 2) {
            throw VisitorException::invalidName('Nome muito curto');
        }

        if (strlen($name) > 255) {
            throw VisitorException::invalidName('Nome muito longo');
        }

        if (empty($cpf) || strlen($cpf) < 11) {
            throw VisitorException::invalidCpfLength();
        }

        if (!$this->isValidCpf($cpf)) {
            throw VisitorException::invalidCpf();
        }

        if (!empty($phone) && !$this->isValidPhone($phone)) {
            throw VisitorException::invalidPhone();
        }

        if (!empty($email) && !filter_var($email, FILTER_VALIDATE_EMAIL)) {
            throw VisitorException::invalidEmail();
        }

        if (!empty($email) && Visitor::where('email', $email)->where('cpf', '!=', $cpf)->exists()) {
            throw VisitorException::duplicateEmail($email);
        }
    }

    protected function isValidName(string $name): bool
    {
        $name = trim($name);
        
        if (preg_match('/[\d\p{P}]/u', $name)) {
            return false;
        }
        
        if (preg_match('/(.)\1{5,}/', $name)) {
            return false;
        }
        
        return true;
    }

protected function isValidPhone(string $phone): bool
    {
        $digits = preg_replace('/\D/', '', $phone);
        
        if (strlen($digits) < 10 || strlen($digits) > 11) {
            return false;
        }
        
        return true;
    }

    protected function validateExpiresAt(?string $date, int $line): string
    {
        if (empty($date)) {
            return $this->defaultExpires;
        }

        try {
            $parsed = Carbon::parse($date);
            
            if ($parsed->isPast()) {
                throw VisitorException::invalidDate('Data não pode estar no passado');
            }
            
            $maxDate = now()->addYears(2);
            if ($parsed->isAfter($maxDate)) {
                throw VisitorException::invalidDate('Data máxima é de 2 anos');
            }
            
            return $parsed->format('Y-m-d');
        } catch (\Throwable $e) {
            if ($e instanceof VisitorException) {
                throw $e;
            }
            throw VisitorException::invalidDate();
        }
    }

    protected function isValidCpf(string $cpf): bool
    {

        if (strlen($cpf) != 11) {
            return false;
        }

        if (preg_match('/(\d)\1{10}/', $cpf)) {
            return false;
        }

        $digits = array_map('intval', str_split($cpf));

        if (count($digits) < 11) {
            return false;
        }

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
        $name = trim($row[0] ?? '');
        $cpf = preg_replace('/\D/', '', $row[1] ?? '');
        $email = (array_key_exists(2, $row) && trim($row[2] ?? '') !== '') ? trim($row[2]) : null;
        $phone = (array_key_exists(3, $row) && trim($row[3] ?? '') !== '') ? trim($row[3]) : null;
        $reason = (array_key_exists(4, $row) && trim($row[4] ?? '') !== '') ? trim($row[4]) : $this->defaultReason;

        $expiresAt = (array_key_exists(5, $row) && trim($row[5] ?? '') !== '')
            ? Carbon::parse($row[5])->startOfDay()->format('Y-m-d')
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