<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\PlanOrder;
use App\Models\PpvOrder;
use Illuminate\Support\Facades\Log;
use DataTables;
use Illuminate\Support\Carbon;
use App\Models\UnifiedOrder;
use Yajra\DataTables\Html\Builder;
use Yajra\DataTables\Html\Button;
use Yajra\DataTables\Html\Column;

class PlanOrderController extends Controller
{
	public function index()
	{
		try {
			$planOrders = PlanOrder::with(['user', 'plan', 'bill'])->get();
			$ppvOrders = PpvOrder::with(['user', 'movie', 'bill'])->get();
			
			return response()->json([
				'success' => true,
				'orders' => [
					'planOrder' => $planOrders,
					'ppvOrder' => $ppvOrders,
				],
			], 200);

		} catch (\Exception $e) {
			Log::error('Error: ' . $e->getMessage());

			return response()->json([
				'success' => false,
				'message' => 'Error: ' . $e->getMessage(),
			], 500);
		}
	}
	
    public function datatable(Request $request)
    {
        try {
            $query = UnifiedOrder::with('user')->orderBy('created_at', 'asc');
                    
            // Filtrado por fecha
            if ($request->filled('min_date')) {
                $min = Carbon::createFromFormat('d-m-Y', $request->input('min_date'))->startOfDay();
                $query->where('created_at', '>=', $min);
            }
    
            if ($request->filled('max_date')) {
                $max = Carbon::createFromFormat('d-m-Y', $request->input('max_date'))->endOfDay();
                $query->where('created_at', '<=', $max);
            }
    
            // Filtrado por columna específica
            if ($request->filled('column_filter') && $request->filled('search_term')) {
                $column = $request->input('column_filter');
                $searchTerm = $request->input('search_term');
                
                // Mapear índice de columna a nombre de campo
                $columnsMap = [
                    0 => 'reference',
                    1 => 'amount',
                    2 => 'status',
                    3 => 'user_dni',
                    4 => 'description',
                    5 => 'created_at'
                ];
                
                if (isset($columnsMap[$column])) {
                    if ($column == 3) { // Caso especial para user_dni
                        $query->whereHas('user', function($q) use ($searchTerm) {
                            $q->where('dni', 'LIKE', "%{$searchTerm}%");
                        });
                     } else {
                        $query->where($columnsMap[$column], 'LIKE', "%{$searchTerm}%");
                    }
                }
            }
            // Búsqueda global
            elseif ($request->filled('search_term')) {
                $searchTerm = $request->input('search_term');
                $query->where(function($q) use ($searchTerm) {
                    $q->where('reference', 'LIKE', "%{$searchTerm}%")
                      ->orWhere('amount', 'LIKE', "%{$searchTerm}%")
                      ->orWhere('status', 'LIKE', "%{$searchTerm}%")
                      ->orWhere('description', 'LIKE', "%{$searchTerm}%")
                      ->orWhereHas('user', function($q) use ($searchTerm) {
                          $q->where('dni', 'LIKE', "%{$searchTerm}%");
                      });
                });
            }    

			return DataTables::of($query)
				->addColumn('reference', function($order) {
					return $order->reference;
				})
				->addColumn('amount', function($order) {
					return $order->amount.' €';
				})
				->addColumn('status', function($order) {
					return $this->getStatusText($order->status);
				})
				->addColumn('user_dni', function($order) {
					return $order->user->dni;
				})
				->addColumn('description', function($order) {
					return $order->description;
				})
				->addColumn('created_at', function($order) {
					return Carbon::parse($order->created_at)->format('d-m-Y');
				})
				->addColumn('actions', function($order) {
					return $this->getActionButtons($order);
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

	private function getStatusText($status)
	{
		switch ($status) {
			case 'pending': return 'Pendiente';
			case 'paid': return 'Pagado';
			default: return 'Error';
		}
	}

	private function getActionButtons($order)
	{
		if ($order instanceof PlanOrder) {
            $type = 'plan';
        } else if ($order instanceof PpvOrder) {
            $type = 'ppv';
        } else {
            $type = 'rent';
        }
		$id = $order->id;
				
		return '
			<div class="actions-container">
				<button class="actions-button orders-button">Acciones</button>
				<div class="actions-menu">
					<button class="action-item bill-button plan-action" data-id="'.$id.'">Factura</button>
					<button class="action-item download-btn plan-action" data-id="'.$id.'">Descargar factura</button>
					<form class="'.$type.'-order-delete-form" data-id="'.$id.'">
						<input type="hidden" name="plan_id" value="'.$id.'">
						<button class="action-item content-action delete-btn" type="submit">Eliminar</button>
					</form>
				</div>
			</div>';
	}
}