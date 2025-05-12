<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\PlanOrder;
use App\Models\PpvOrder;
//use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;

class PlanOrderController extends Controller
{
        public function index()
    {
        try {
        $planOrders = PlanOrder::with(['user', 'plan'])->get();
		$ppvOrders = PpvOrder::with(['user', 'movie'])->get();

        return response()->json([
            'success' => true,
            'orders' => [
				'planOrder' => $planOrders,
				'ppvOrder' => $ppvOrders
			],
            'message' => 'Pedidos obtenidos con éxito.',
        ], 200);

        } catch (\Exception $e) {
            Log::error('Error: ' . $e->getMessage());

            return response()->json([
                'success' => false,
                'message' => 'Error: ' . $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Store a newly created resource in storage.
     */
    /*public function store(Request $request)
    {
        try {
            $order = new Order();

            return response()->json([
                'success' => true,
                'gender' => $gender,
                'message' => 'Pedido creado con éxito'
            ], 200);

        } catch(\Exception $e) {
            Log::error('Error: ' . $e->getMessage());

            return response()->json([
                'success' => false,
                'message' => 'Error: ' . $e->getMessage(),
            ], 500);
        }
    }*/

    /**
     * Display the specified resource.
     */
    public function show(string $id)
    {
        try {
            $order = PlanOrder::with(['user', 'plan'])
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

    /**
     * Update the specified resource in storage.
     */
    /*public function update(Request $request, string $id)
    {
        try {
            $order = Order::where('id', $id)->first();
			
            return response()->json([
                'success' => true,
                'order' => $order,
                'message' => 'Pedido editado con éxito'
            ], 200);

        } catch(\Exception $e) {
            Log::error('Error: ' . $e->getMessage());

            return response()->json([
                'success' => false,
                'message' => 'Error: ' . $e->getMessage(),
            ], 500);
        }
    }*/

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Request $request)
    {
        try {
            $id = $request->input('content_id');
            $order = PlanOrder::where('id', $id)->first();
            $order->delete();

            return response()->json([
                'success' => true,
                'message' => 'Pedido eliminado con éxito'
            ], 200);

        } catch(\Exception $e) {
            Log::error('Error al eliminar el pedido: ' . $e->getMessage());
            
            return response()->json([
                'success' => false,
                'message' => 'Error: ' . $e->getMessage(),
            ], 500);
        }
    }
}