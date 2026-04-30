<?php

namespace App\Contracts;

interface ActivityLogInterface
{
    public function log(string $action, ?array $data = null): void;
    public function logVisitorCreated(int $visitorId, string $visitorName): void;
    public function logVisitorUpdated(int $visitorId, string $visitorName, array $old = [], array $new = []): void;
    public function logVisitorDeleted(int $visitorId, string $visitorName): void;
    public function logPasswordGenerated(int $visitorId, string $visitorName): void;
    public function logVisitorExpired(int $visitorId, string $login): void;
    public function logLogin(): void;
    public function logDepartmentCreated(int $departmentId, string $departmentName): void;
    public function logDepartmentDeleted(int $departmentId, string $departmentName): void;
    public function logVisitorTypeCreated(int $typeId, string $typeName): void;
    public function logVisitorTypeDeleted(int $typeId, string $typeName): void;
}