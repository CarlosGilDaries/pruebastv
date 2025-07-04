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
        Schema::create('genders', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->timestamps();
        });
    }

    /*
    INSERT INTO `genders` (`name`, `created_at`, `updated_at`) VALUES
        ('Acción', NOW(), NOW()),
        ('Aventuras', NOW(), NOW()),
        ('Ciencia ficción', NOW(), NOW()),
        ('Comedia', NOW(), NOW()),
        ('Drama', NOW(), NOW()),
        ('Terror/Suspense', NOW(), NOW()),
        ('Fantasía', NOW(), NOW()),
        ('Romance', NOW(), NOW()),
        ('Thriller', NOW(), NOW()),
        ('Crimen/Misterio', NOW(), NOW()),
        ('Bélico', NOW(), NOW()),
        ('Histórico', NOW(), NOW()),
        ('Animación (infantil/adulta)', NOW(), NOW()),
        ('Documental', NOW(), NOW()),
        ('Musical', NOW(), NOW()),
        ('Western', NOW(), NOW()),
        ('Deportivo', NOW(), NOW()),
        ('Biográfico', NOW(), NOW()),
        ('Entrevistas', NOW(), NOW()),
        ('Noticias/Actualidad', NOW(), NOW()),
        ('Educativo', NOW(), NOW()),
        ('True Crime', NOW(), NOW()),
        ('Humor', NOW(), NOW()),
        ('Narrativo (Storytelling)', NOW(), NOW()),
        ('Salud/Bienestar', NOW(), NOW()),
        ('Negocios/Emprendimiento', NOW(), NOW()),
        ('Tecnología', NOW(), NOW()),
        ('Cultura pop', NOW(), NOW()),
        ('Política/Sociedad', NOW(), NOW()),
        ('Gaming', NOW(), NOW()),
        ('Conciertos/Música en vivo', NOW(), NOW()),
        ('Eventos deportivos', NOW(), NOW()),
        ('Charlas/Webinars', NOW(), NOW()),
        ('Tutoriales', NOW(), NOW()),
        ('Reacciones', NOW(), NOW()),
        ('Fitness/Wellness en vivo', NOW(), NOW());
    */

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('genders');
    }
};
