<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class ImportBatch extends Model
{
    use HasFactory;

    protected $fillable = [
        'filename',
        'total_rows',
        'success_count',
        'error_count',
        'status',
        'created_by',
    ];

    protected $casts = [
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
    ];

    public function creator()
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    public function visitors()
    {
        return $this->hasMany(Visitor::class, 'import_batch_id');
    }
}