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
		Schema::create('bills', function (Blueprint $table) {
			$table->id();
			$table->foreignId('user_id')->constrained()->onDelete('set null');
			$table->string('url');
			$table->nullableMorphs('billable'); // billable_id + billable_type
			$table->timestamps();
		});
	}

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('bills');
    }
};
