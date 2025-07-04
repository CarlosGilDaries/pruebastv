<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Order;
//use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;

class OrderController extends Controller
{
        public function index()
    {
        try {
        $orders = Order::with(['user', 'plan'])->get();

        return response()->json([
            'success' => true,
            'orders' => $orders,
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
            $order = Order::with(['user', 'plan'])
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
            $order = Order::where('id', $id)->first();
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