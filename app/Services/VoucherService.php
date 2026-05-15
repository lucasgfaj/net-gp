<?php

namespace App\Services;

use App\Contracts\VoucherInterface;
use App\Models\Visitor;
use App\Models\Voucher;

class VoucherService implements VoucherInterface
{
    public function create(Visitor $visitor, string $password): Voucher
    {
        $login = preg_replace('/\D/', '', $visitor->cpf);

        return Voucher::create([
            'visitor_id' => $visitor->id,
            'login' => $login,
            'password' => $password,
            'expires_at' => $visitor->expires_at,
            'created_by' => $visitor->created_by,
        ]);
    }

    public function update(Voucher $voucher, array $data): Voucher
    {
        $voucher->update($data);
        return $voucher->refresh();
    }

    public function delete(Voucher $voucher): void
    {
        $voucher->delete();
    }

    public function findByVisitor(Visitor $visitor): ?Voucher
    {
        return Voucher::where('visitor_id', $visitor->id)->first();
    }

    public function updatePassword(Voucher $voucher, string $password): Voucher
    {
        $voucher->password = $password;
        $voucher->save();
        return $voucher;
    }
}