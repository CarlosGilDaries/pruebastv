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
		Schema::create('rent_orders', function (Blueprint $table) {
            $table->id();
            $table->string('reference')->unique();
            $table->decimal('amount', 10, 2);
            $table->string('status')->default('pending');
            $table->foreignId('user_id')->constrained();
            $table->foreignId('movie_id')->nullable()->constrained()->onDelete('set null');
			$table->string('description');
            $table->timestamp('expires_at');
            $table->enum('payment_method', ['PayPal', 'Redsys']);
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('rent_orders');
    }
};
