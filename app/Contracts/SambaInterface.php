<?php

namespace App\Contracts;

interface SambaInterface
{
    public function createSambaUser(string $username, string $password): array;
    public function userExists(string $username): bool;
    public function updateSambaUserPassword(string $username, string $newPassword): array;
    public function updateSambaUserExpiry(string $username, string $expiresAt): array;
    public function deleteSambaUser(string $username): array;
}