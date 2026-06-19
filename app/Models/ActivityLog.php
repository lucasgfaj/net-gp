<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class ActivityLog extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'action',
        'data',
    ];

    protected $casts = [
        'data' => 'array',
        'created_at' => 'datetime',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function getDescription(): string
    {
        $data = $this->data ?? [];

        return match ($this->action) {
            'visitor_created' => "Novo visitante: " . ($data['visitor_name'] ?? ''),
            'visitor_password_resent' => "Senha reenviada para: " . ($data['visitor_name'] ?? ''),
            'visitor_updated' => "Atualizou: " . ($data['visitor_name'] ?? ''),
            'visitor_deleted' => "Removeu: " . ($data['visitor_name'] ?? ''),
            'visitor_password_generated' => "Nova senha: " . ($data['visitor_name'] ?? ''),
            'visitor_expired' => "Expirou (login: " . ($data['login'] ?? '') . ")",
            'department_created' => "Novo depto: " . ($data['department_name'] ?? ''),
            'department_deleted' => "Removeu dept: " . ($data['department_name'] ?? ''),
            'visitor_type_created' => "Novo tipo: " . ($data['type_name'] ?? ''),
            'visitor_type_deleted' => "Removeu tipo: " . ($data['type_name'] ?? ''),
            default => $this->action,
        };
    }
}
