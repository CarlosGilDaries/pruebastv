<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('active_streams', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->string('device_id');
            $table->timestamp('last_active_at')->default(DB::raw('CURRENT_TIMESTAMP'));
            $table->timestamps();
            $table->foreign('device_id')->references('device_id')->on('user_sessions')->onDelete('cascade');
        });     
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('active_streams');
    }
};
