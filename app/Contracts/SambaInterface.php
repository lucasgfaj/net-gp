<?php

namespace App\Contracts;

interface SambaInterface
{
    public function createSambaUser(string $username, string $password): array;
    public function updateSambaUserPassword(string $username, string $newPassword): array;
    public function deleteSambaUser(string $username): array;
}