<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Department extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
    ];

    /**
     * Relacionamento: um departamento tem muitos usuários.
     */
    public function users()
    {
        return $this->hasMany(User::class);
    }
}
