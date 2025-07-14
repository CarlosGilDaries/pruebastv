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
        Schema::create('movies', function (Blueprint $table) {
            $table->id();
            $table->string('title');
            $table->string('cover')->nullable();
            $table->string('tall_cover')->nullable();
            $table->string('trailer')->nullable();
            $table->longText('overview');
            $table->longText('tagline');
            $table->foreignId('gender_id')->constrained();
            $table->enum('type', ['video/mp4', 'audio/mpeg', 'application/vnd.apple.mpegurl', 'url_mp4', 'url_hls', 'url_mp3', 'stream']);
            $table->string('url');
            $table->boolean('pay_per_view');
            $table->decimal('pay_per_view_price', 5, 2)->nullable();
            $table->boolean('rent');
            $table->integer('rent_days')->nullable();
            $table->decimal('rent_price', 5, 2)->nullable();
            $table->datetime('start_time')->nullable();
            $table->datetime('end_time')->nullable();
            $table->time('duration')->nullable();
            $table->string('slug')->unique();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('movies');
    }
};
