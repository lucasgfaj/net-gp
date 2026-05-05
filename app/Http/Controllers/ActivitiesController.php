<?php

namespace App\Http\Controllers;

use App\Models\ActivityLog;
use Inertia\Inertia;

class ActivitiesController extends Controller
{
    private function getActionLabel(string $action): string
    {
        $labels = [
            'visitor_created' => 'Visitante Criado',
            'visitor_updated' => 'Visitante Atualizado',
            'visitor_deleted' => 'Visitante Excluído',
            'visitor_password_generated' => 'Senha Gerada',
            'visitor_expired' => 'Visitante Expirado',
            'user_login' => 'Login de Usuário',
            'department_created' => 'Departamento Criado',
            'department_deleted' => 'Departamento Excluído',
            'visitor_type_created' => 'Tipo Criado',
            'visitor_type_deleted' => 'Tipo Excluído',
        ];
        return $labels[$action] ?? $action;
    }

private function getActionDescription(string $action, array $data): string
    {
        return match ($action) {
            'visitor_created' => 'Novo visitante criado: ' . ($data['visitor_name'] ?? ''),
            'visitor_updated' => 'Dados atualizados de: ' . ($data['visitor_name'] ?? ''),
            'visitor_deleted' => 'Visitante removido do sistema: ' . ($data['visitor_name'] ?? ''),
            'visitor_password_generated' => 'Senha redefinida para: ' . ($data['visitor_name'] ?? ''),
            'visitor_expired' => 'Acesso expirou (login: ' . ($data['login'] ?? '') . ')',
            'department_created' => 'Departamento criado: ' . ($data['department_name'] ?? ''),
            'department_deleted' => 'Departamento removido: ' . ($data['department_name'] ?? ''),
            'visitor_type_created' => 'Tipo de visitante criado: ' . ($data['type_name'] ?? ''),
            'visitor_type_deleted' => 'Tipo de visitante removido: ' . ($data['type_name'] ?? ''),
            default => $action,
        };
    }

    public function index()
    {
        $user = auth()->user();

        if (!$user->isAdmin()) {
            abort(403, 'Acesso restrito a administradores.');
        }

        $activities = ActivityLog::with('user.department')
            ->orderBy('created_at', 'desc')
            ->paginate(10)
            ->withQueryString();

        $activitiesFormatted = $activities->getCollection()->map(function ($log) {
            return [
                'id' => $log->id,
                'user' => $log->user?->name,
                'department' => $log->user?->department?->name,
                'user_role' => $log->user?->role,
                'action_label' => $this->getActionLabel($log->action),
                'action' => $this->getActionDescription($log->action, $log->data ?? []),
                'created_at' => $log->created_at->format('d/m H:i'),
            ];
        });

        $activitiesArray = $activities->toArray();
        $activitiesArray['data'] = $activitiesFormatted->values()->all();
        
        if (!empty($activitiesArray['links'])) {
            $activitiesArray['links'] = collect($activitiesArray['links'])
                ->map(fn($link) => [
                    'url' => $link['url'],
                    'label' => strip_tags(html_entity_decode($link['label'])),
                    'active' => $link['active'] ?? false,
                ])
                ->all();
        }

        return Inertia::render('activities/index', [
            'activities' => $activitiesArray,
        ]);
    }

    public function show(ActivityLog $activity)
    {
        $user = auth()->user();

        if (!$user->isAdmin()) {
            abort(403, 'Acesso restrito a administradores.');
        }

        $activity->load('user.department');

        return Inertia::render('activities/show', [
            'activity' => [
                'id' => $activity->id,
                'created_at' => $activity->created_at->toIsoString(),
                'action' => $activity->action,
                'action_label' => $this->getActionLabel($activity->action),
                'data' => $activity->data,
                'user' => $activity->user ? [
                    'id' => $activity->user->id,
                    'name' => $activity->user->name,
                    'email' => $activity->user->email,
                    'role' => $activity->user->role,
                    'department' => $activity->user->department ? [
                        'id' => $activity->user->department->id,
                        'name' => $activity->user->department->name,
                    ] : null,
                ] : null,
            ],
        ]);
    }
}