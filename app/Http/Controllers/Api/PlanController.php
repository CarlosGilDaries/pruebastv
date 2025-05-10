<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Plan;
//use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;

class PlanController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        try {
        $plans = Plan::whereNot('name', 'admin')->get();

        return response()->json([
            'success' => true,
            'plans' => $plans,
            'message' => 'Planes obtenidos con éxito.',
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
            $plan = new Plan();
            $name = sanitize_html($request->input('name'));
            $price = sanitize_html($request->input('price'));
            $max_devices = sanitize_html(($request->input('max_devices')));
            $max_streams = sanitize_html(($request->input('max_streams')));
            $ads = $request->input('ads');

            $plan->name = $name;
            $plan->price = $price;
            $plan->max_devices = $max_devices;
            $plan->max_streams = $max_streams;
            $plan->ads = $ads;
            $plan->save();

            return response()->json([
                'success' => true,
                'plan' => $plan,
                'message' => 'Plan creado con éxito'
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
            $plan = Plan::where('id', $id)->first();

            return response()->json([
                'success' => true,
                'plan' => $plan,
                'message' => 'Plan obtenido con éxito.'
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
    public function update(Request $request, string $id)
    {
        try {
            $plan = Plan::where('id', $id)->first();
            $name = sanitize_html($request->input('name'));
            $price = sanitize_html($request->input('price'));
            $max_devices = sanitize_html(($request->input('max_devices')));
            $max_streams = sanitize_html(($request->input('max_streams')));
            $ads = $request->input('ads');

            $plan->name = $name;
            $plan->price = $price;
            $plan->max_devices = $max_devices;
            $plan->max_streams = $max_streams;
            $plan->ads = $ads;
            $plan->save();

            return response()->json([
                'success' => true,
                'plan' => $plan,
                'message' => 'Plan editado con éxito'
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
     * Remove the specified resource from storage.
     */
    public function destroy(Request $request)
    {
        try {
            $id = $request->input('content_id');
            $plan = Plan::where('id', $id)->first();
            $plan->delete();

            return response()->json([
                'success' => true,
                'message' => 'Plan eliminado con éxito'
            ], 200);

        } catch(\Exception $e) {
            Log::error('Error al eliminar el plan: ' . $e->getMessage());
            
            return response()->json([
                'success' => false,
                'message' => 'Error: ' . $e->getMessage(),
            ], 500);
        }
    }
}
