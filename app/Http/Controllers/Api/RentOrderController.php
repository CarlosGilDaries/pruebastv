<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\RentOrder;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

class RentOrderController extends Controller
{
        public function show(string $id)
    {
        try {
            $order = RentOrder::with(['user'])
				->where('id', $id)->first();

            return response()->json([
                'success' => true,
                'order' => $order,
                'message' => 'Pedido obtenido con éxito.'
            ]);

        } catch (\Exception $e) {
            Log::error('Error: ' . $e->getMessage());

            return response()->json([
                'success' => false,
                'message' => 'Error: ' . $e->getMessage(),
            ], 500);
        }
    }
}
