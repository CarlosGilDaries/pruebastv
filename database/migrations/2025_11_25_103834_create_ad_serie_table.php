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
        Schema::create('ad_serie', function (Blueprint $table) {
            $table->id();
            $table->foreignId('ad_id')->constrained()->onDelete('cascade');
            $table->foreignId('serie_id')->constrained()->onDelete('cascade');
            $table->unique(['ad_id', 'serie_id'], 'foreign_keys');
            $table->enum('type', ['preroll', 'midroll', 'postroll', 'overlay']);
            $table->decimal('midroll_time')->nullable();
            $table->boolean('skippable');
            $table->integer('skip_time')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('ad_serie');
    }
};
