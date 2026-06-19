<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table("import_errors", function (Blueprint $table) {
            $table->boolean("skipped")->default(false)->after("row_data");
        });
    }

    public function down(): void
    {
        Schema::table("import_errors", function (Blueprint $table) {
            $table->dropColumn("skipped");
        });
    }
};
