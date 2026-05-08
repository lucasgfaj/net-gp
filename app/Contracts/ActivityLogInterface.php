<?php

namespace App\Contracts;

interface ActivityLogInterface
{
    public function log(string $action, ?array $data = null): void;
    public function logVisitorCreated(int $visitorId, string $visitorName, int $userId): void;
    public function logVisitorUpdated(int $visitorId, string $visitorName, array $old = [], array $new = [], int $userId): void;
    public function logVisitorDeleted(int $visitorId, string $visitorName, int $userId): void;
    public function logPasswordGenerated(int $visitorId, string $visitorName, int $userId): void;
    public function logPasswordResent(int $visitorId, string $visitorName, int $userId): void;
    public function logVisitorExpired(int $visitorId, string $login): void;
    public function logLogin(): void;
    public function logDepartmentCreated(int $departmentId, string $departmentName, int $userId): void;
    public function logDepartmentDeleted(int $departmentId, string $departmentName, int $userId): void;
    public function logVisitorTypeCreated(int $typeId, string $typeName, int $userId): void;
    public function logVisitorTypeDeleted(int $typeId, string $typeName, int $userId): void;
}