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
        Schema::create('scripts', function (Blueprint $table) {
            $table->id();
            $table->string('key');
            $table->string('type');
            $table->longText('code');
            $table->foreignId('movie_id')->nullable()->constrained()->cascadeOnDelete();
            $table->foreignId('action_id')->nullable()->constrained()->cascadeOnDelete();
            $table->foreignId('tag_id')->nullable()->constrained()->cascadeOnDelete();
            $table->foreignId('gender_id')->nullable()->constrained()->cascadeOnDelete();
            $table->foreignId('category_id')->nullable()->constrained()->cascadeOnDelete();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('scripts');
    }
};
