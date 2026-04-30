<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('visitors', function (Blueprint $table) {
            $table->foreignId('import_batch_id')
                ->nullable()
                ->constrained('import_batches')
                ->nullOnDelete();
            $table->boolean('email_sent')->default(false);
            $table->timestamp('email_sent_at')->nullable();
        });
    }

    public function down(): void
    {
        Schema::table('visitors', function (Blueprint $table) {
            $table->dropForeign(['import_batch_id']);
            $table->dropColumn(['import_batch_id', 'email_sent', 'email_sent_at']);
        });
    }
};