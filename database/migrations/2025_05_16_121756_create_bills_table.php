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
			$table->string('bill_number')->unique();
			$table->string('user_dni');
			$table->foreign('user_dni')->references('dni')->on('users');
			$table->string('url');
			$table->string('billable_reference'); 
			$table->string('billable_type');
			$table->decimal('amount', 10, 2); 
			$table->enum('payment_method', ['PayPal', 'Redsys']);
			$table->index(['billable_reference', 'billable_type']);
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
