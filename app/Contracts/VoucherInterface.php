<?php

namespace App\Contracts;

use App\Models\Visitor;
use App\Models\Voucher;

interface VoucherInterface
{
    public function create(Visitor $visitor, string $password): Voucher;
    public function update(Voucher $voucher, array $data): Voucher;
    public function delete(Voucher $voucher): void;
    public function findByVisitor(Visitor $visitor): ?Voucher;
}