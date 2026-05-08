<?php

namespace App\Contracts;

use App\Models\Visitor;

interface VisitorInterface
{
    public function create(array $data): Visitor;
    public function update(Visitor $visitor, array $data): Visitor;
    public function delete(Visitor $visitor, int $userId): void;
    public function generatePassword(Visitor $visitor): array;
    public function resendPassword(Visitor $visitor): bool;
}