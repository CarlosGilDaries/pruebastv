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
        Schema::create('series', function (Blueprint $table) {
            $table->id();
            $table->string('title');
            $table->string('slug')->unique();
            $table->foreignId('movie_id')->constrained()->onDelete('cascade');
            $table->enum('type', ['video/mp4', 'audio/mpeg', 'application/vnd.apple.mpegurl', 'url_mp4', 'url_hls', 'url_mp3', 'stream']);
            $table->integer('season_number');
            $table->integer('episode_number');
            $table->string('url');
            $table->string('image_url')->nullable();
            $table->foreignId('seo_setting_id')->nullable()->constrained()->nullOnDelete();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('series');
    }
};
