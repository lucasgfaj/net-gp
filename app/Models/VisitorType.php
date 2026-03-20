<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class VisitorType extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'description',
    ];

    public function visitors()
    {
        return $this->hasMany(Visitor::class, 'type_id');
    }
}
    