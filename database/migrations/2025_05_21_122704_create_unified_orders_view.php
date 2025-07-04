<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        DB::statement(<<<SQL
CREATE VIEW unified_orders AS
SELECT
    id,
    reference,
    amount,
    status,
    user_id,
    description,
    created_at,
    'plan' AS type
FROM plan_orders

UNION ALL

SELECT
    id,
    reference,
    amount,
    status,
    user_id,
    description,
    created_at,
    'ppv' AS type
FROM ppv_orders
SQL);
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        DB::statement("DROP VIEW IF EXISTS unified_orders");
    }
};
