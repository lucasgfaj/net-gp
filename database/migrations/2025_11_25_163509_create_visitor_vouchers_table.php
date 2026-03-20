<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('visitor_vouchers', function (Blueprint $table) {
            $table->id();

            $table->foreignId('visitor_id')
                ->nullable() // permite voucher sem visitante
                ->constrained('visitors')
                ->cascadeOnDelete();

            $table->string('login')->unique();
            $table->string('password');
            
            $table->timestamp('expires_at')->nullable();

            $table->integer('printer_id')->nullable();

            $table->string('phone_private')->nullable();
            $table->string('phone_public')->nullable();

            $table->boolean('auto_generated')->default(true);

            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('visitor_vouchers');
    }
};
