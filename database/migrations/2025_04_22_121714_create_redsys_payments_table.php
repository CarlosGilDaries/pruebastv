<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::create('redsys_requests', function (Blueprint $table) {
            $table->id();
            $table->nullableMorphs('model', 'model_morph');
            $table->boolean('save_card')->default(false);
            $table->nullableMorphs('card_request_model', 'card_model_morph');
            $table->uuid('uuid');
            $table->enum('status', ['pending', 'error', 'success'])->default('pending');
            $table->bigInteger('order_number');
            $table->bigInteger('amount');
            $table->integer('currency');
            $table->string('pay_method')->nullable();
            $table->string('transaction_type');
            $table->string('response_code')->nullable();
            $table->text('response_message')->nullable();
            $table->string('auth_code')->nullable();
            $table->timestamps();
        });

        Schema::create('redsys_cards', function (Blueprint $table) {
            $table->id();
            $table->nullableMorphs('model');
            $table->uuid('uuid');
            $table->string('number')->nullable();
            $table->integer('expiration_date');
            $table->string('merchant_identifier');
            $table->string('cof_transaction_id')->nullable();
            $table->timestamps();
        });

         Schema::create('redsys_notification_logs', function (Blueprint $table) {
            $table->id();
            $table->foreignId('redsys_request_id')->nullable();
            $table->json('merchant_parameters');
            $table->timestamps();
         });

         Schema::create('plan_orders', function (Blueprint $table) {
            $table->id();
            $table->string('reference')->unique();
            $table->decimal('amount', 10, 2);
            $table->string('status')->default('pending');
            $table->foreignId('user_id')->constrained()->onDelete('set null')->nullable();
            $table->foreignId('plan_id')->constrained()->onDelete('set null')->nullable();
			$table->string('description');
            $table->timestamps();
        });
		
		Schema::create('ppv_orders', function (Blueprint $table) {
            $table->id();
            $table->string('reference')->unique();
            $table->decimal('amount', 10, 2);
            $table->string('status')->default('pending');
            $table->foreignId('user_id')->constrained()->onDelete('set null')->nullable();
            $table->foreignId('movie_id')->constrained()->onDelete('set null')->nullable();
			$table->string('description');
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('redsys_requests');
        Schema::dropIfExists('redsys_cards');
        Schema::dropIfExists('redsys_notification_logs');
        Schema::dropIfExists('plan_orders');
		Schema::dropIfExists('ppv_orders');
    }
};
