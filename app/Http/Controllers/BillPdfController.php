<?php

namespace App\Http\Controllers;

use App\Models\PlanOrder;
use App\Models\PpvOrder;
use App\Models\Bill;
use App\Models\RentOrder;
use App\Models\User;
use Illuminate\Support\Facades\Http;
use Barryvdh\DomPDF\Facade\Pdf;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Log;

class BillPdfController extends Controller
{
	public function returnBillPathFromReference($reference)
	{
		try {
			$bill = Bill::where('billable_reference', $reference)->first();
					
			return response()->json([
				'success' => true,
				'path' => $bill->url,
				'id' => $bill->id,
				'number' => $bill->bill_number
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
		/*$companyResponse = Http::withOptions([
			'verify' => false
			])->get(route('company-details'));
		$orderResponse = Http::withOptions([
    		'verify' => false
			])->get(route('plan-order.show', $order->id));*/

		$companyDetails = $companyResponse->json()['details'];
		$orderDetails = $orderResponse->json()['order'];

		$user = User::where('id', $order->user_id)->first();

		$bill = $order->bill()->create([
			'user_dni' => $user->dni,
			'url' => '',
			'amount' => $order->amount,
			'payment_method' => $order->payment_method,
			'bill_number' => ''
		]);

		$invoiceNumber = str_pad($bill->id, 8, '0', STR_PAD_LEFT);

		$pdf = $this->generateInvoicePdf($companyDetails, $orderDetails, $invoiceNumber, $bill->id, 'plan');

		$filename = 'factura-' . now()->format('dmY') . '-' . str_pad($bill->id, 8, '0', STR_PAD_LEFT) . '.pdf';
		$path = "bills/user_{$order->user_id}/{$filename}";

		Storage::disk('private')->put($path, $pdf->output());
		
		$bill->update([
			'url' => $path,
			'bill_number' => $invoiceNumber
		]);

		return $bill;
	}
	
	public function generatePpvOrderInvoice(PpvOrder $order)
	{
		$companyResponse = Http::get(route('company-details'));
		$orderResponse = Http::get(route('ppv-order.show', $order->id));

		$companyDetails = $companyResponse->json()['details'];
		$orderDetails = $orderResponse->json()['order'];
		
		$user = User::where('id', $order->user_id)->first();

		$bill = $order->bill()->create([
			'user_dni' => $user->dni,
			'url' => '',
			'amount' => $order->amount,
			'payment_method' => $order->payment_method,
			'bill_number' => ''
		]);

		$invoiceNumber = str_pad($bill->id, 8, '0', STR_PAD_LEFT);

		$pdf = $this->generateInvoicePdf($companyDetails, $orderDetails, $invoiceNumber, $bill->id, 'ppv');

		$filename = 'factura-' . now()->format('dmY') . '-' . str_pad($bill->id, 8, '0', STR_PAD_LEFT) . '.pdf';
		$path = "bills/user_{$order->user_id}/{$filename}";

		Storage::disk('private')->put($path, $pdf->output());
		$bill->update([
			'url' => $path,
			'bill_number' => $invoiceNumber
		]);


		return $bill;
	}

	public function generateRentOrderInvoice(RentOrder $order)
	{
		$companyResponse = Http::get(route('company-details'));
		$orderResponse = Http::get(route('rent-order.show', $order->id));
		/*$companyResponse = Http::withOptions([
			'verify' => false
			])->get(route('company-details'));
		$orderResponse = Http::withOptions([
    		'verify' => false
			])->get(route('rent-order.show', $order->id));*/

		$companyDetails = $companyResponse->json()['details'];
		$orderDetails = $orderResponse->json()['order'];

		$user = User::where('id', $order->user_id)->first();

		$bill = $order->bill()->create([
			'user_dni' => $user->dni,
			'url' => '',
			'amount' => $order->amount,
			'payment_method' => $order->payment_method,
			'bill_number' => ''
		]);

		$invoiceNumber = str_pad($bill->id, 8, '0', STR_PAD_LEFT);

		$pdf = $this->generateInvoicePdf($companyDetails, $orderDetails, $invoiceNumber, $bill->id, 'rent');

		$filename = 'factura-' . now()->format('dmY') . '-' . str_pad($bill->id, 8, '0', STR_PAD_LEFT) . '.pdf';
		$path = "bills/user_{$order->user_id}/{$filename}";

		Storage::disk('private')->put($path, $pdf->output());
		$bill->update([
			'url' => $path,
			'bill_number' => $invoiceNumber
		]);


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

	protected function generateInvoicePdf($companyDetails, $orderDetails, $invoiceNumber, $billId, $type)
	{
		if ($type == 'plan') {
			$expires = $orderDetails['user']['plan_expires_at'];
		} else if ($type == 'rent') {
			$expires = $orderDetails['expires_at'];
		} else if ($type == 'ppv') {
			$expires = $orderDetails['movie']['end_time'];
		}

		$data = [
			'company' => [
				'name' => $companyDetails['name'],
				'address' => $companyDetails['fiscal_address'],
				'cif' => $companyDetails['nif_cif'],
				'lopd' => $companyDetails['lopd_text'],
				'commercial_registry_text' => $companyDetails['commercial_registry_text'],
				'logo' => storage_path('app/private/settings/invoice_logo.png'),
			],
			'client' => [
				'name' => $orderDetails['user']['name'] . ' ' . $orderDetails['user']['surnames'],
				'address' => $orderDetails['user']['address'] . ', ' . 
				$orderDetails['user']['city'] . ', ' . 
				$orderDetails['user']['country'],
				'dni' => $orderDetails['user']['dni'],
				'expires_at' => $expires,
			],
			'invoice' => [
				'id' => $billId,
				'number' => $invoiceNumber,
				'date' => now()->format('d/m/Y'),
				'description' => $orderDetails['description'],
				'amount' => number_format($orderDetails['amount'], 2) . ' €',
				'iva' => number_format($orderDetails['amount'] * 0.21, 2) . ' €',
				'iva_percentage' => '21 %',
				'payment_method' => $orderDetails['payment_method'],
			],
			'type' => $type,
		];

		return Pdf::loadView('invoices.standard', $data);
	}

	public function basicInvoice()
	{
		return Pdf::loadView('invoices.test')->download('invoice.pdf');;
	}
}