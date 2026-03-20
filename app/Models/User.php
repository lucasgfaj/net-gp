<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Fortify\TwoFactorAuthenticatable;

class User extends Authenticatable
{
    use HasFactory, Notifiable, TwoFactorAuthenticatable;

    protected $fillable = [
        'name',
        'email',
        'password',
        'department_id',
        'role',
    ];

    protected $hidden = [
        'password',
        'two_factor_secret',
        'two_factor_recovery_codes',
        'remember_token',
    ];

    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
            'two_factor_confirmed_at' => 'datetime',
        ];
    }

    /* ================= RELATIONSHIPS ================= */

    public function department()
    {
        return $this->belongsTo(Department::class);
    }

    public function createdVisitors()
    {
        return $this->hasMany(Visitor::class, 'created_by');
    }

    public function createdVouchers()
    {
        return $this->hasMany(Voucher::class, 'created_by');
    }

    /* ================= SCOPES ================= */

    public function scopeSearch(Builder $query, ?string $search): Builder
    {
        if (!$search) {
            return $query;
        }

        return $query->where(function ($q) use ($search) {
            $q->where('name', 'like', "%{$search}%")
              ->orWhere('email', 'like', "%{$search}%");
        });
    }

    public function scopeDepartmentFilter(
        Builder $query,
        ?int $departmentId
    ): Builder {
        return $departmentId
            ? $query->where('department_id', $departmentId)
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
