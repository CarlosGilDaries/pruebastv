<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\PlanOrder;
use App\Models\Plan;
use App\Models\PpvOrder;
use App\Models\Movie;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Auth;
use Creagia\Redsys\Enums\PayMethod;

class RedsysController extends Controller
{
	public function selectPlan(Request $request)
    {
        try {
            $user = Auth::user();
            //$planId = $request->plan_id;
            $plan = Plan::find($request->plan_id);

            if ($user->plan_id == $plan->id) {
                return response()->json([
                    'success' => false,
                    'message' => 'No se puede cambiar al plan que ya se tiene.'
                ], 422);
            }

            if ($plan->price == 0) {
                $user->update([
                    'plan_id' => $request->plan_id
                ]);

                return response()->json([
                    'success' => true,
                    'payment_required' => false,
                    'message' => 'Plan registrado con éxito.',
                ], 200);
            }

			$ds_order = $this->uniqueCode();
			
            $order = PlanOrder::create([
                'reference' => $ds_order,
                'amount' => $plan->price,
                'user_id' => $user->id,
                'plan_id' => $plan->id,
                'status' => 'pending',
				'description' => "Suscripción {$plan->name}"
            ]);
			

            $redsysRequest = $order->createRedsysRequest(
                productDescription: "Suscripción {$plan->name}",
                payMethod: PayMethod::Card,
            );

            // Extraer datos necesarios
            $requestParams = $redsysRequest->requestParameters;

            // Crear Ds_MerchantParameters (JSON en Base64)
            $dsMerchantData = [
                'DS_MERCHANT_AMOUNT' => strval($requestParams->amountInCents),
                'DS_MERCHANT_CURRENCY' => strval($requestParams->currency->value),
                'DS_MERCHANT_MERCHANTCODE' => strval($requestParams->merchantCode),
                'DS_MERCHANT_ORDER' => strval($ds_order),
                'DS_MERCHANT_TERMINAL' => strval($requestParams->terminal),
                'DS_MERCHANT_TRANSACTIONTYPE' => strval($requestParams->transactionType->value),
                'DS_MERCHANT_MERCHANTURL' => 'https://eaba-64-225-160-224.ngrok-free.app/api/redsys-plan-resp',
                'DS_MERCHANT_URLKO' =>'https://eaba-64-225-160-224.ngrok-free.app/unsuccessful-payment.html',
                'DS_MERCHANT_URLOK' => 'https://eaba-64-225-160-224.ngrok-free.app/successful-payment.html',
                //https://eaba-64-225-160-224.ngrok-free.app
                /*'DS_MERCHANT_TRANSACTIONTYPE' => strval($requestParams->transactionType->value),
                'DS_MERCHANT_MERCHANTURL' => url('/api/redsys-plan-resp'),
                'DS_MERCHANT_URLKO' => url('/unsuccessful-payment.html'),
                'DS_MERCHANT_URLOK' => url('/successful-payment.html'),*/
            ];
			

            $dsMerchantParameters = base64_encode(json_encode($dsMerchantData));

            // Generar firma
            $secretKey = env('REDSYS_KEY');
            $signature = generateSignature(
                $dsMerchantParameters,
                $ds_order,
                $secretKey
            );

            return response()->json([
                'success' => true,
                'payment_required' => true,
                'sinbase64' => $dsMerchantData,
                'objeto_original' => $requestParams,
                'Ds_MerchantParameters' => $dsMerchantParameters,
                'Ds_Signature' => $signature,
                'Ds_SignatureVersion' => 'HMAC_SHA256_V1', // Versión de firma requerida por Redsys
            ]);
        } catch (\Exception $e) {
            Log::error($e->getMessage());

            return response()->json([
                'success' => false,
                'message' => 'Error: ' . $e->getMessage(),
            ], 500);
        }
    }
	
	public function ppvPayment(Request $request)
    {
        try {
            $user = Auth::user();
            $movie = Movie::find($request->content_id);

			$ds_order = $this->uniqueCode();
			
            $order = PpvOrder::create([
                'reference' => $ds_order,
                'amount' => $movie->pay_per_view_price,
                'user_id' => $user->id,
                'movie_id' => $movie->id,
                'status' => 'pending',
				'description' => "PPV {$movie->title}"
            ]);

            $redsysRequest = $order->createRedsysRequest(
                productDescription: "PPV {$movie->title}",
                payMethod: PayMethod::Card,
            );

            // Extraer datos necesarios
            $requestParams = $redsysRequest->requestParameters;

            // Crear Ds_MerchantParameters (JSON en Base64)
            $dsMerchantData = [
                'DS_MERCHANT_AMOUNT' => strval($requestParams->amountInCents),
                'DS_MERCHANT_CURRENCY' => strval($requestParams->currency->value),
                'DS_MERCHANT_MERCHANTCODE' => strval($requestParams->merchantCode),
                'DS_MERCHANT_ORDER' => strval($ds_order),
                'DS_MERCHANT_TERMINAL' => strval($requestParams->terminal),
                'DS_MERCHANT_TRANSACTIONTYPE' => strval($requestParams->transactionType->value),
                'DS_MERCHANT_MERCHANTURL' => 'https://eaba-64-225-160-224.ngrok-free.app/api/redsys-plan-resp',
                'DS_MERCHANT_URLKO' =>'https://eaba-64-225-160-224.ngrok-free.app/unsuccessful-payment.html',
                'DS_MERCHANT_URLOK' => 'https://eaba-64-225-160-224.ngrok-free.app/successful-payment.html',
                /*'DS_MERCHANT_MERCHANTURL' => url('/api/redsys-plan-resp'),
                'DS_MERCHANT_URLKO' => url('/unsuccessful-payment.html'),
                'DS_MERCHANT_URLOK' => url('/successful-payment.html'),*/
            ];

            $dsMerchantParameters = base64_encode(json_encode($dsMerchantData));

            // Generar firma
            $secretKey = env('REDSYS_KEY');
            $signature = generateSignature(
                $dsMerchantParameters,
                $ds_order,
                $secretKey
            );

            return response()->json([
                'success' => true,
                'payment_required' => true,
                'sinbase64' => $dsMerchantData,
                'objeto_original' => $requestParams,
                'Ds_MerchantParameters' => $dsMerchantParameters,
                'Ds_Signature' => $signature,
                'Ds_SignatureVersion' => 'HMAC_SHA256_V1', // Versión de firma requerida por Redsys
            ]);
        } catch (\Exception $e) {
            Log::error($e->getMessage());

            return response()->json([
                'success' => false,
                'message' => 'Error: ' . $e->getMessage(),
            ], 500);
        }
    }
	
    public function handlePlanRedsysResponse(Request $request) 
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
                    $order = PlanOrder::where('reference', $dsOrder)->first();
                    $user = $order->user;
					if ($order->plan) {
						$plan = $order->plan;
						$plan_id = $plan->id;
						$user->update([
                        'plan_id' => $plan_id
                    	]);
					}
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
	
	public function handlePpvRedsysResponse(Request $request) 
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
                    $order = PpvOrder::where('reference', $dsOrder)->first();
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
	
		private function uniqueCode() 
	{
		do {
			$reference = str_pad(mt_rand(0, 999999999999), 12, '0', STR_PAD_LEFT);
		} while (PlanOrder::where('reference', $reference)->exists() || PpvOrder::where('reference', $reference)->exists());

		return $reference;
	}
}
