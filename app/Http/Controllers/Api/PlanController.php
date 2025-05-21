<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Plan;
//use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;
use DataTables;

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

    public function datatable()
    {
        try {
            $plans = Plan::all();

			return DataTables::of($plans)
				->addColumn('id', function($plan) {
					return $plan->id;
				})
				->addColumn('name', function($plan) {
					return $plan->name;
				})
				->addColumn('price', function($plan) {
					return $plan->price;
				})
				->addColumn('max_devices', function($plan) {
					return $plan->max_devices;
				})
				->addColumn('max_streams', function($plan) {
					return $plan->max_streams;
				})
                ->addColumn('ads', function($plan) {
					return $plan->ads;
				})
				->addColumn('actions', function($plan) {
					return $this->getActionButtons($plan);
				})
				->rawColumns(['actions'])
				->make(true);

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

    private function getActionButtons($plan)
	{
		$id = $plan->id;

		return '
			<div class="actions-container">
				<button class="actions-button">Acciones</button>
				<div class="actions-menu">
					<a href="/admin/edit-plan.html" class="action-item content-action edit-button" data-id="'.$id.'">Editar</a>
                    <form class="plans-delete-form" data-id="' . $id . '">
						<input type="hidden" name="content_id" value="' . $id . '">
						<button class="action-item content-action delete-btn" type="submit">Eliminar</button>
					</form>
				</div>
			</div>';
	}
}
