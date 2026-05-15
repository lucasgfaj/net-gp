<?php

namespace App\Services;

use App\Contracts\ActivityLogInterface;
use App\Models\ActivityLog;
use App\Models\User;
use Illuminate\Support\Facades\Request;

class ActivityLogService implements ActivityLogInterface
{
    public function log(string $action, ?array $data = null): void
    {
        $user = auth()->user();

        if (!$user) {
            return;
        }

        $this->logWithUser($action, $data, $user);
    }

    protected function logWithUser(string $action, ?array $data, User $user): void
    {
        ActivityLog::create([
            'user_id' => $user->id,
            'action' => $action,
            'data' => array_merge($data ?? [], [
                'user_name' => $user->name,
                'user_email' => $user->email,
                'user_role' => $user->role,
                'user_department' => $user->department?->name ?? 'Sem departamento',
                'ip' => Request::ip(),
                'user_agent' => Request::userAgent(),
            ]),
        ]);
    }

    public function logVisitorCreated(int $visitorId, string $visitorName, int $userId): void
    {
        $user = User::find($userId);
        if ($user) {
            $this->logWithUser('visitor_created', [
                'visitor_id' => $visitorId,
                'visitor_name' => $visitorName,
            ], $user);
        }
    }

    public function logVisitorUpdated(int $visitorId, string $visitorName, array $old = [], array $new = [], int $userId): void
    {
        $user = User::find($userId);
        if ($user) {
            $this->logWithUser('visitor_updated', [
                'visitor_id' => $visitorId,
                'visitor_name' => $visitorName,
                'old' => $old,
                'new' => $new,
            ], $user);
        }
    }

    public function logVisitorDeleted(int $visitorId, string $visitorName, int $userId): void
    {
        $user = User::find($userId);
        if ($user) {
            $this->logWithUser('visitor_deleted', [
                'visitor_id' => $visitorId,
                'visitor_name' => $visitorName,
            ], $user);
        }
    }

public function logPasswordGenerated(int $visitorId, string $visitorName, int $userId): void
    {
        $this->logWithUser('visitor_password_generated', [
            'visitor_id' => $visitorId,
            'visitor_name' => $visitorName,
        ], User::findOrFail($userId));
    }

    public function logPasswordResent(int $visitorId, string $visitorName, int $userId): void
    {
        $this->logWithUser('visitor_password_resent', [
            'visitor_id' => $visitorId,
            'visitor_name' => $visitorName,
        ], User::findOrFail($userId));
    }

    public function logVisitorExpired(int $visitorId, string $login): void
    {
        $this->log('visitor_expired', [
            'visitor_id' => $visitorId,
            'login' => $login,
        ]);
    }

    public function logLogin(): void
    {
        $this->log('user_login');
    }

    public function logDepartmentCreated(int $departmentId, string $departmentName, int $userId): void
    {
        $user = User::find($userId);
        if ($user) {
            $this->logWithUser('department_created', [
                'department_id' => $departmentId,
                'department_name' => $departmentName,
            ], $user);
        }
    }

    public function logDepartmentDeleted(int $departmentId, string $departmentName, int $userId): void
    {
        $user = User::find($userId);
        if ($user) {
            $this->logWithUser('department_deleted', [
                'department_id' => $departmentId,
                'department_name' => $departmentName,
            ], $user);
        }
    }

    public function logVisitorTypeCreated(int $typeId, string $typeName, int $userId): void
    {
        $user = User::find($userId);
        if ($user) {
            $this->logWithUser('visitor_type_created', [
                'type_id' => $typeId,
                'type_name' => $typeName,
            ], $user);
        }
    }

    public function logVisitorTypeDeleted(int $typeId, string $typeName, int $userId): void
    {
        $user = User::find($userId);
        if ($user) {
            $this->logWithUser('visitor_type_deleted', [
                'type_id' => $typeId,
                'type_name' => $typeName,
            ], $user);
        }
    }
}