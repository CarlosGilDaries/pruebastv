<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Order;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

class RedsysController extends Controller
{
    public function handleRedsysResponse(Request $request) 
    {
        try {
            Log::debug("Redsys Callback Received", [
                'full_request' => $request->all(),
                'merchant_parameters' => base64_decode($request->input('Ds_MerchantParameters')),
                'signature' => $request->input('Ds_Signature'),
            ]);

            $dsMerchantParameters = $request->input('Ds_MerchantParameters');
            $dsSignature = $request->input('Ds_Signature');

            $secretKey = env('REDSYS_KEY'); // En base64
            $merchantParamsDecoded = json_decode(base64_decode($dsMerchantParameters), true);

            $dsOrder = $merchantParamsDecoded['Ds_Order'];
            $dsResponse = $merchantParamsDecoded['Ds_Response'];
			$intResponse = intval($dsResponse);

            $mySignature = generateSignature($dsMerchantParameters, $dsOrder, $secretKey);
            $mySignature = strtr($mySignature, '+/', '-_');

            if (hash_equals($mySignature, $dsSignature)) {
                if ($intResponse < 100 && $intResponse >= 0) {
                    $order = Order::where('reference', $dsOrder)->first();
                    $user = $order->user;
                    $plan = $order->plan;
                    $plan_id = $plan->id;

                    $user->update([
                        'plan_id' => $plan_id
                    ]);

                    $order->paidWithRedsys();
					
                } else {
					Log::debug('Response:' . $intResponse);
				}

                Log::debug('Firma válida. Parámetros:', $merchantParamsDecoded);
				
				return response()->json(['success' => true]);
            } else {
                Log::warning('Firma inválida. Firma esperada: ' . $mySignature . ' | Firma recibida: ' . $dsSignature);
            }

        } catch (\Exception $e) {
			Log::error('Error: ' . $e->getMessage());
			
            return response()->json([
                'success' => false,
                'message' => 'Error: ' . $e->getMessage(),
            ], 500);
        }
    }
}
