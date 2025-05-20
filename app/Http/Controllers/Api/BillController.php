<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Bill;
use App\Models\User;
//use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;

class BillController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        try {
        $bills = Bill::all();

        return response()->json([
            'success' => true,
            'bills' => $bills,
            'message' => 'Facturas obtenidas con éxito.',
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
    public function store(Request $request)
    {
        try {
			$validated = $request->validate([
				'user_id' => 'required|exists:users,id',
				'order_id' => 'required|exists:orders,id'
			]);

			$order = Order::find($validated['order_id']);
			$order->paidWithRedsys();

			return response()->json([
				'success' => true,
				'message' => 'Pedido pagado y factura generada con éxito'
			], 200);

		} catch(\Exception $e) {
			Log::error('Error: ' . $e->getMessage());

			return response()->json([
				'success' => false,
				'message' => 'Error: ' . $e->getMessage(),
			], 500);
		}
	}

    /**
     * Display the specified resource.
     */
    public function show(string $id)
    {
        try {
            $bill = Bill::where('id', $id)->first();

            return response()->json([
                'success' => true,
                'bill' => $bill,
                'message' => 'Factura obtenida con éxito.'
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
           
            return response()->json([
                'success' => true,
                'bill' => $bill,
                'message' => 'Factura editada con éxito'
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
            $bill = Bill::where('id', $id)->first();
            $bill->delete();

            return response()->json([
                'success' => true,
                'message' => 'Factura eliminada con éxito'
            ], 200);

        } catch(\Exception $e) {
            Log::error('Error: ' . $e->getMessage());
            
            return response()->json([
                'success' => false,
                'message' => 'Error: ' . $e->getMessage(),
            ], 500);
        }
    }
}