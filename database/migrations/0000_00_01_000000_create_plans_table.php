<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('plans', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->decimal('price', 5, 2);
            $table->integer('max_devices');
            $table->integer('max_streams');
            $table->boolean('ads');
            $table->timestamps();
        });
    }

    /*
    INSERT INTO `plans` (`name`, `price`, `max_devices`, `max_streams`, `ads`, `created_at`, `updated_at`) VALUES
        ('Free', 0, 1, 1, true, NOW(), NOW()),
        ('Sencillo', 4.99, 2, 1, true, NOW(), NOW()),
        ('Premium', 7.99, 4, 2, true, NOW(), NOW()),
        ('Platinum', 9.99, 4, 4, false, NOW(), NOW()),
        ('Admin', 0, 10, 10, true, NOW(), NOW());
    */

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('plans');
    }
};
