<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Notifications\Notifiable;
use App\Models\User;

class Visitor extends Model
{
    use HasFactory, Notifiable;

    protected $fillable = [
        'name',
        'cpf',
        'phone',
        'email',
        'type_id',
        'school',
        'expires_at',
        'created_by',
        'disabled_at',
        'enabled',
        'import_batch_id',
        'email_sent',
        'email_sent_at',
    ];

    protected $casts = [
        'expires_at' => 'datetime',
        'created_at' => 'datetime',
        'disabled_at' => 'datetime',
        'enabled' => 'boolean',
        'email_sent' => 'boolean',
        'email_sent_at' => 'datetime',
    ];

    /* ================= RELATIONSHIPS ================= */

    public function type()
    {
        return $this->belongsTo(VisitorType::class, 'type_id');
    }

    public function creator()
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    public function vouchers()
    {
        return $this->hasMany(Voucher::class, 'visitor_id');
    }

    public function voucher()
    {
        return $this->hasOne(Voucher::class, 'visitor_id');
    }

    public function importBatch()
    {
        return $this->belongsTo(ImportBatch::class, 'import_batch_id');
    }

    /* ================= SCOPES ================= */

    public function scopeDepartmentFilter(
        Builder $query,
        User $user,
        ?int $departmentId
    ): Builder {
        if ($user->department_id === 1) {
            if ($departmentId && $departmentId !== 'all') {
                return $query->whereHas('creator', fn ($q) =>
                    $q->where('department_id', $departmentId)
                );
            }

            return $query;
        }

        return $query->whereHas('creator', fn ($q) =>
            $q->where('department_id', $user->department_id)
        );
    }

    public function scopeSearch(Builder $query, ?string $search): Builder
    {
        if (!$search) {
            return $query;
        }

        return $query->where(function ($q) use ($search) {
            $q->where('name', 'like', "%{$search}%")
              ->orWhere('cpf', 'like', "%{$search}%")
              ->orWhere('email', 'like', "%{$search}%");
        });
    }

    public function scopeTypeFilter(Builder $query, ?int $typeId): Builder
    {
        return $typeId
            ? $query->where('type_id', $typeId)
            : $query;
    }

    public function scopeApplyOrdering(
        Builder $query,
        ?string $orderName,
        ?string $orderCreated,
        string $sort = 'id',
        string $direction = 'desc'
    ): Builder {
        if ($orderName) {
            return $query->orderBy('name', $orderName);
        }

        if ($orderCreated === 'newest') {
            return $query->orderBy('created_at', 'desc');
        }

        if ($orderCreated === 'oldest') {
            return $query->orderBy('created_at', 'asc');
        }

        return $query->orderBy($sort, $direction);
    }
}
