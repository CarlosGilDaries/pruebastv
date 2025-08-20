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
        Schema::create('company_details', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('fiscal_address');
            $table->string('nif_cif');
			$table->string('email')->nullable();
            $table->longtext('commercial_registry_text');
            $table->longtext('lopd_text');
            $table->string('favicon')->nullable();
            $table->string('logo')->nullable();
            $table->string('invoice_logo')->nullable();
			$table->string('facebook')->nullable();
			$table->string('instagram')->nullable();
			$table->string('twitter')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('company_details');
    }
};
