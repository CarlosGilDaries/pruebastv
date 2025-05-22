<?php

namespace App\Http\Controllers;

use App\Models\PlanOrder;
use App\Models\PpvOrder;
use App\Models\Bill;
use Illuminate\Support\Facades\Http;
use Barryvdh\DomPDF\Facade\Pdf;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Log;

class BillPdfController extends Controller
{
	public function returnBillPathFromOrderID($orderId)
	{
		try {
			$bill = Bill::whereHasMorph(
				'billable', 
				[PlanOrder::class, PpvOrder::class],
				function ($query) use ($orderId) {
					$query->where('id', $orderId);
				}
			)->first();
			
			log::debug($bill->url);

			
			return response()->json([
				'success' => true,
				'path' => $bill->url
			], 200);
			
		} catch(\Exception $e) {
			Log::error('Error: ' . $e->getMessage());

			return response()->json([
				'success' => false,
				'message' => 'Error: ' . $e->getMessage(),
			], 500);
		}
	}

	public function returnBillPathFromBillId($billId)
	{
		try {
			$bill = Bill::where('id', $billId)->first();

			return response()->json([
				'success' => true,
				'path' => $bill->url
			], 200);
			
		} catch(\Exception $e) {
			Log::error('Error: ' . $e->getMessage());

			return response()->json([
				'success' => false,
				'message' => 'Error: ' . $e->getMessage(),
			], 500);
		}
	}
	
	public function generatePlanOrderInvoice(PlanOrder $order)
	{
		$companyResponse = Http::get(route('company-details'));
		$orderResponse = Http::get(route('plan-order.show', $order->id));

		$companyDetails = $companyResponse->json()['details'];
		$orderDetails = $orderResponse->json()['order'];

		$bill = $order->bill()->create([
			'user_id' => $order->user_id,
			'url' => ''
		]);

		$invoiceNumber = str_pad($bill->id, 8, '0', STR_PAD_LEFT);

		$pdf = $this->generateInvoicePdf($companyDetails, $orderDetails, $invoiceNumber);

		$filename = 'factura-' . now()->format('dmY') . '-' . str_pad($bill->id, 8, '0', STR_PAD_LEFT) . '.pdf';
		$path = "bills/user_{$order->user_id}/{$filename}";

		Storage::disk('private')->put($path, $pdf->output());
		$bill->update(['url' => $path]);

		return $bill;
	}
	
	public function generatePpvOrderInvoice(PpvOrder $order)
	{
		$companyResponse = Http::get(route('company-details'));
		$orderResponse = Http::get(route('ppv-order.show', $order->id));

		$companyDetails = $companyResponse->json()['details'];
		$orderDetails = $orderResponse->json()['order'];

		$bill = $order->bill()->create([
			'user_id' => $order->user_id,
			'url' => ''
		]);

		$invoiceNumber = str_pad($bill->id, 8, '0', STR_PAD_LEFT);

		$pdf = $this->generateInvoicePdf($companyDetails, $orderDetails, $invoiceNumber);

		$filename = 'factura-' . now()->format('dmY') . '-' . str_pad($bill->id, 8, '0', STR_PAD_LEFT) . '.pdf';
		$path = "bills/user_{$order->user_id}/{$filename}";

		Storage::disk('private')->put($path, $pdf->output());
		$bill->update(['url' => $path]);

		return $bill;
	}

	public function download($id) {
		try {
			$bill = Bill::findOrFail($id);
			$file = Storage::disk('private')->get($bill->url);
			$filename = basename($bill->url);

			$headers = [
				'Content-Type' => 'application/pdf',
				'Content-Disposition' => 'attachment; filename="'.$filename.'"',
			];
	
			return response($file, 200, $headers);
			
		} catch(\Exception $e) {
			Log::error('Error: ' . $e->getMessage());
	
			return response()->json([
				'success' => false,
				'message' => 'Error: ' . $e->getMessage(),
			], 500);
		}
	}

	protected function generateInvoicePdf($companyDetails, $orderDetails, $invoiceNumber)
	{
		$data = [
			'company' => [
				'name' => $companyDetails['name'],
				'address' => $companyDetails['fiscal_address'],
				'cif' => $companyDetails['nif_cif']
			],
			'client' => [
				'name' => $orderDetails['user']['name'] . ' ' . $orderDetails['user']['surnames'],
				'address' => $orderDetails['user']['address'] . ', ' . 
				$orderDetails['user']['city'] . ', ' . 
				$orderDetails['user']['country'],
				'dni' => $orderDetails['user']['dni'],
			],
			'invoice' => [
				'number' => $invoiceNumber,
				'date' => now()->format('d/m/Y'),
				'description' => $orderDetails['description'],
				'amount' => number_format($orderDetails['amount'], 2) . ' €',
				'iva' => number_format($orderDetails['amount'] * 0.21, 2) . ' €',
			]
		];

		return Pdf::loadView('invoices.standard', $data);
	}
}