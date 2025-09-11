<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Plan;
use Illuminate\Support\Facades\Log;
use DataTables;
use Illuminate\Support\Facades\Auth;
use Carbon\Carbon;

class PlanController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        try {
        $plans = Plan::whereNot('name', 'admin')->get();
        $orders = Plan::all()->sortBy('plan_order')->pluck('plan_order')->toArray();

        return response()->json([
            'success' => true,
            'plans' => $plans,
            'orders' => $orders,
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
                ->addColumn('plan_order', function($plan) {
                    return $plan->plan_order;
                })
				->addColumn('name', function($plan) {
					return $plan->name;
				})
				->addColumn('trimestral_price', function($plan) {
					return $plan->trimestral_price;
				})
                ->addColumn('anual_price', function($plan) {
					return $plan->anual_price;
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
            $trimestral_price = sanitize_html($request->input('trimestral_price'));
            $anual_price = sanitize_html($request->input('anual_price'));
            $max_devices = sanitize_html(($request->input('max_devices')));
            $max_streams = sanitize_html(($request->input('max_streams')));
            $ads = $request->input('ads');

            $newOrder = $request->input('plan_order');
            
            // Si el orden ya existe, desplazar los planes existentes
            if (Plan::where('plan_order', $newOrder)->exists()) {
                Plan::where('plan_order', '>=', $newOrder)
                       ->increment('plan_order');
            }
            $plan->plan_order = $newOrder;

            $plan->name = $name;
            $plan->trimestral_price = $trimestral_price;
            $plan->anual_price = $anual_price;
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
            $trimestral_price = sanitize_html($request->input('trimestral_price'));
            $anual_price = sanitize_html($request->input('anual_price'));
            $max_devices = sanitize_html(($request->input('max_devices')));
            $max_streams = sanitize_html(($request->input('max_streams')));
            $ads = $request->input('ads');

            $currentOrder = $plan->plan_order;
            $newOrder = $request->input('plan_order');
            if ($currentOrder != $newOrder) {
                if ($newOrder < $currentOrder) {
                    // Mover hacia arriba (prioridad más alta)
                    Plan::where('plan_order', '>=', $newOrder)
                        ->where('plan_order', '<', $currentOrder)
                        ->increment('plan_order');
                } else {
                    // Mover hacia abajo (prioridad más baja)
                    Plan::where('plan_order', '>', $currentOrder)
                        ->where('plan_order', '<=', $newOrder)
                        ->decrement('plan_order');
                }
                
                $plan->plan_order = $newOrder;
            }

            $plan->name = $name;
            $plan->trimestral_price = $trimestral_price;
            $plan->anual_price = $anual_price;
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

    public function resetFreeExpiration()
    {
        try {
            $user = Auth::user();
            $user->load('plan');
            
            if ($user->plan->trimestral_price == 0) {
                $user->update(['plan_expires_at' => Carbon::now()->addDays(10)]);
            }

            return response()->json([
                'success' => true
            ], 200);

        } catch (\Exception $e) {
            Log::error('Error en resetFreeExpiration: ' . $e->getMessage());

            return response()->json([
                'success' => false,
                'message' => 'Error en resetFreeExpiration: ' . $e->getMessage(),
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
            $deletedOrder = $plan->plan_order;

            $plan->delete();

            // Reordenar los planes restantes si el eliminado no era el último
            $maxOrder = Plan::max('plan_order') ?? 0;           
            if ($deletedOrder < $maxOrder) {
                Plan::where('plan_order', '>', $deletedOrder)
                       ->decrement('plan_order');
            }

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
