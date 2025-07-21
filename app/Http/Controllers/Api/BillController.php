<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Bill;
use Illuminate\Support\Facades\Log;
use DataTables;
use Illuminate\Support\Carbon;

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

    public function datatable(Request $request)
    {
        try {
            $query = Bill::with('billable');
			
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
                    0 => 'id',
                    1 => 'bill_number',
                    2 => 'user_dni',
                    3 => 'billable_reference',
                    4 => 'amount',
                    5 => 'payment_method',
                    6 => 'description',
                    7 => 'created_at'
                ];
                
                if (isset($columnsMap[$column])) {
                    if ($column == 6) { // Caso especial para description
                        $query->whereHas('billable', function($q) use ($searchTerm) {
                            $q->where('description', 'LIKE', "%{$searchTerm}%");
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
                    $q->where('id', 'LIKE', "%{$searchTerm}%")
                      ->orWhere('bill_number', 'LIKE', "%{$searchTerm}%")
                      ->orWhere('user_dni', 'LIKE', "%{$searchTerm}%")
                      ->orWhere('billable_reference', 'LIKE', "%{$searchTerm}%")
                      ->orWhere('amount', 'LIKE', "%{$searchTerm}%")
                      ->orWhere('payment_method', 'LIKE', "%{$searchTerm}%")
                      ->orWhereHas('billable', function($q) use ($searchTerm) {
                          $q->where('description', 'LIKE', "%{$searchTerm}%");
                      });
                });
            }   
            
            // Ordenamiento
            if ($request->has('order')) {
                $orderColumnIndex = $request->input('order.0.column');
                $orderDirection = $request->input('order.0.dir');
                $columns = $request->input('columns');

                if (isset($columns[$orderColumnIndex])) {
                    $orderColumnName = $columns[$orderColumnIndex]['data'];

                    if ($orderColumnName === 'billable_description') {
                        // Asegúrate de que la relación y columnas existen
                        $query->join('billables', 'billables.id', '=', 'bills.billable_id')
                            ->orderBy('billables.description', $orderDirection)
                            ->select('bills.*');
                    } elseif (!in_array($orderColumnName, ['actions'])) {
                        $query->orderBy($orderColumnName, $orderDirection);
                    }
                }
            }


			return DataTables::of($query)
				->addColumn('id', function($bill) {
					return $bill->id;
				})
				->addColumn('bill_number', function($bill) {
					return $bill->bill_number;
				})
                ->addColumn('user_dni', function($bill) {
					return $bill->user_dni;
				})
                ->addColumn('order_reference', function($bill) {
					return $bill->billable_reference;
				})
                ->addColumn('amount', function($bill) {
					return $bill->amount;
				})
                ->addColumn('payment_method', function($bill) {
					return $bill->payment_method;
				})
                ->addColumn('description', function($bill) {
					return $bill->billable->description;
				})
                ->addColumn('created_at', function($bill) {
					return Carbon::parse($bill->created_at)->format('d-m-Y');
				})
				->addColumn('actions', function($bill) {
					return $this->getActionButtons($bill);
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

    private function getActionButtons($bill)
	{
		$id = $bill->id;
		$number = $bill->bill_number;

		return '
			<div class="actions-container">
				<button class="actions-button">Acciones</button>
				<div class="actions-menu">
                <button class="action-item bill-button bill-action" data-id="'.$id.'">Ver</button>
                <button class="action-item download-button bill-action" data-id="'.$id.'" data-number="' . $number . '">Descargar</button>
                    <form class="bill-delete-form" data-id="' . $id . '">
						<input type="hidden" name="content_id" value="' . $id . '">
						<button class="action-item content-action delete-btn" type="submit">Eliminar</button>
					</form>
				</div>
			</div>';
	}
}