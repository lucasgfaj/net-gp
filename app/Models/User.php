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
        'ldap_dn',
        'username',
        'role',
        'department_id',
    ];
    protected $hidden = [
        'password',
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

    /* ================= HELPERS PARA LDAP / POLICIES ================= */

    /**
     * Verifica se o usuário pertence a um departamento específico
     * (usado nas Policies e regras de autorização)
     */
    public function belongsToDepartment(Department $department): bool
    {
        return $this->department_id === $department->id;
    }

    public function syncRoleFromDepartment(): void
    {
        $this->role = $this->department?->name === 'COGETI' ? 'admin' : 'operator';
    }

    /**
     * Verifica se é admin pelo papel vindo do AD
     */
    public function isAdmin(): bool
    {
        return $this->role === 'admin';
    }

    /**
     * Verifica se é operador
     */
    public function isOperator(): bool
    {
        return $this->role === 'operator';
    }

    /* ================= SCOPES ================= */

    public function scopeSearch(Builder $query, ?string $search): Builder
    {
        if (!$search) {
            return $query;
        }

        return $query->where(function ($q) use ($search) {
            $q->where('name', 'like', "%{$search}%")
                ->orWhere('email', 'like', "%{$search}%")
                ->orWhere('username', 'like', "%{$search}%")
                ->orWhere('ldap_dn', 'like', "%{$search}%");
        });
    }

    public function scopeDepartmentFilter(Builder $query, ?int $departmentId): Builder
    {
        if (!$departmentId) {
            return $query;
        }

        return $query->where('department_id', $departmentId);
    }

    /**
     * Ordenações padrão (mantido)
     */
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