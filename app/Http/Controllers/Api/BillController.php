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

    public function datatable()
    {
        try {
            $bills = Bill::with('billable')->get();

			return DataTables::of($bills)
				->addColumn('id', function($bill) {
					return $bill->id;
				})
				->addColumn('bill_number', function($bill) {
					return $bill->bill_number;
				})
                ->addColumn('user_id', function($bill) {
					return $bill->user_id;
				})
                ->addColumn('order_id', function($bill) {
					return $bill->billable_id;
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