<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class ImportError extends Model
{
    use HasFactory;

    protected $fillable = [
        'import_batch_id',
        'line_number',
        'error_message',
        'row_data',
        'skipped',
    ];

    protected $casts = [
        'row_data' => 'array',
        'skipped' => 'boolean',
    ];

    public function batch()
    {
        return $this->belongsTo(ImportBatch::class, 'import_batch_id');
    }
}