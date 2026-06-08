<?php

namespace App\Models;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Builder;

class Voucher extends Model
{

    use HasFactory;
    protected $table = 'visitor_vouchers'; 

    protected $fillable = [
        'visitor_id',
        'login',
        'password',
        'expires_at',
        'printer_id',
        'phone_private',
        'phone_public',
        'auto_generated',
        'created_by',
    ];

    protected $casts = [
        'expires_at' => 'datetime',
        'auto_generated' => 'boolean',
    ];
    // ...

    /* ================= RELATIONSHIPS ================= */

    public function visitor()
    {
        return $this->belongsTo(Visitor::class);
    }

    public function creator()
    {
        return $this->belongsTo(User::class, 'created_by');
    }


    /* ================= SCOPES ================= */
public function scopeDepartmentFilter(
    Builder $query,
    User $user,
    ?int $departmentId
): Builder {
    if ($user->isAdmin()) {
        if ($departmentId && $departmentId !== 'all') {
            return $query->whereHas(
                'visitor.creator',
                fn ($q) => $q->where('department_id', $departmentId)
            );
        }
        return $query;
    }

    return $query->whereHas(
        'visitor.creator',
        fn ($q) => $q->where('department_id', $user->department_id)
    );
}
    public function scopeSearch(Builder $query, ?string $search): Builder
    {
        if (!$search) {
            return $query;
        }

        return $query->where(function ($q) use ($search) {
            $q->where('login', 'like', "%{$search}%")
              ->orWhereHas('visitor', function ($q2) use ($search) {
                  $q2->where('name', 'like', "%{$search}%")
                     ->orWhere('cpf', 'like', "%{$search}%");
              });
        });
    }

    public function scopeTypeFilter(Builder $query, ?int $typeId): Builder
    {
        return $typeId
            ? $query->whereHas(
                'visitor',
                fn ($q) => $q->where('type_id', $typeId)
            )
            : $query;
    }

    public function scopeCreatorFilter(Builder $query, ?int $creatorId): Builder
{
    return $creatorId
        ? $query->whereHas(
            'visitor',
            fn ($q) => $q->where('created_by', $creatorId)
        )
        : $query;
}

    public function scopeApplyOrdering(
        Builder $query,
        ?string $expireSort,
        ?string $createdSort,
        string $sort = 'id',
        string $direction = 'desc'
    ): Builder {
        if ($expireSort === 'closest') {
            return $query->orderBy('expires_at', 'asc');
        }

        if ($expireSort === 'furthest') {
            return $query->orderBy('expires_at', 'desc');
        }

        if ($createdSort === 'newest') {
            return $query->orderBy('created_at', 'desc');
        }

        if ($createdSort === 'oldest') {
            return $query->orderBy('created_at', 'asc');
        }

        return $query->orderBy($sort, $direction);
    }
}