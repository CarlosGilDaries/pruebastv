<?php

namespace App\Http\Controllers\Api;

use Illuminate\Support\Facades\Auth;
use Illuminate\Http\Request;
use App\Http\Controllers\Controller;
use App\Models\Order;
use App\Models\Plan;
use App\Models\User;
use Creagia\Redsys\Enums\PayMethod;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Hash;

class UserApiController extends Controller
{
	public function index()
	{
	    try {
			$users = User::with('plan')->get();

			return response()->json([
				'success' => true,
				'users' => $users,
				'message' => 'Usuarios obtenidos con éxito.',
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
     * Display the specified resource.
     */
    public function show(string $id)
    {
        try {
            $user = User::with(['plan'])
                ->where('id', $id)->first();
            $plans = Plan::all();

            return response()->json([
                'success' => true,
                'data' => [
                    'user' => $user,
                    'plans' => $plans,
                ],
                'message' => 'Usuario obtenido con éxito.'
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
            $user = User::where('id', $id)->first();
            $name = sanitize_html($request->input('name'));
            $surnames = sanitize_html($request->input('surnames'));
            $email = sanitize_html($request->input('email'));
            $dni = sanitize_html($request->input('dni'));
            $address = sanitize_html($request->input('address'));
            $city = sanitize_html($request->input('city'));
            $country = sanitize_html($request->input('country'));
            $password = sanitize_html($request->input('password'));
			
            $user->name = $name;
            $user->surnames = $surnames;
            $user->email = $email;
            $user->dni = $dni;
            $user->address = $address;
            $user->city = $city;
            $user->country = $country;
            $user->birthday = $request->input('birthday');
			if ($request->input('plan') != 0) {
            	$user->plan_id = $request->input('plan');
			}
            $user->gender = $request->input('gender');
			$user->password = Hash::make($password);
            $user->save();

            return response()->json([
                'success' => true,
                'user' => $user,
                'message' => 'Usuario editado con éxito'
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
            $user = User::where('id', $id)->first();
            $user->delete();

            return response()->json([
                'success' => true,
                'message' => 'Usuario eliminado con éxito'
            ], 200);

        } catch(\Exception $e) {
            Log::error('Error al eliminar el usuario: ' . $e->getMessage());
            
            return response()->json([
                'success' => false,
                'message' => 'Error: ' . $e->getMessage(),
            ], 500);
        }
    }
	
    public function getCurrentUser(Request $request) 
    {
        try {
            $user = Auth::user();

            return response()->json([
                'success' => true,
                'data' => [
                    'user' => $user,
                    'plan' => $user->plan,
                ],
                'message' => 'Usuario obtenido con éxito'
            ], 200);

        } catch (\Exception $e) {
            Log::error('Error: ' . $e->getMessage());

            return response()->json([
                'success' => false,
                'message' => 'Error: ' . $e->getMessage(),
            ], 500);
        }
    }

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
			
            $order = Order::create([
                'reference' => $ds_order,
                'amount' => $plan->price,
                'user_id' => $user->id,
                'plan_id' => $plan->id,
                'status' => 'pending'
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
                'DS_MERCHANT_MERCHANTURL' => "https://pruebastv.kmc.es/api/redsys-resp",
                'DS_MERCHANT_URLKO' => "https://pruebastv.kmc.es/unsuccessful-payment.html",
                'DS_MERCHANT_URLOK' =>"https://pruebastv.kmc.es/successful-payment.html",
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
	
	private function uniqueCode() 
	{
		do {
			$reference = str_pad(mt_rand(0, 999999999999), 12, '0', STR_PAD_LEFT);
		} while (Order::where('reference', $reference)->exists());

		return $reference;
	}
}