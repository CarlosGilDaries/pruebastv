<?php

namespace App\Http\Controllers\Api;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;
use App\Http\Controllers\Controller;
use App\Models\Movie;
use App\Models\Plan;
use App\Models\PlanOrder;
use App\Models\PpvOrder;
use App\Models\User;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;
use Carbon\Carbon;

class PayPalController extends Controller
{
    public function paypalCreatePlanOrder(Request $request)
    {
        try {
            $clientId = env('PAYPAL_CLIENT_ID');
            $clientSecret = env('PAYPAL_CLIENT_SECRET');

            $user = Auth::user();
            $plan = Plan::find($request->input('data.planId'));
            $register = $request->input('data.register', false);
            $months = $request->input('data.months', '0');

            if ($months == 3) {
                $price = $plan->trimestral_price;
                $info = 'trimestral';        
            } else if ($months == 12) {
                $price = $plan->anual_price;
                $info = 'anual';
            }
            $description = 'Suscripción ' . $plan->name . ' ' . $info;

            if ($plan->trimestral_price == 0) {
                $user->update([
                    'plan_id' => $request->plan_id
                ]);

                if ($register) {
                    return response()->json([
                        'success' => true,
                        'payment_required' => false,
                        'approval_url' => 'https://2591dce456a7.ngrok-free.app/need-device-payment.html',
                        'message' => 'Plan registrado con éxito.',
                    ], 200);
                } else {
                    return response()->json([
                        'success' => true,
                        'payment_required' => false,
                        'approval_url' => 'https://2591dce456a7.ngrok-free.app/successful-payment.html',
                        'message' => 'Plan registrado con éxito.',
                    ], 200);
                }
            }

            // Obtener token de acceso
            $authResponse = Http::withBasicAuth($clientId, $clientSecret)
                ->asForm()
                ->post('https://api-m.sandbox.paypal.com/v1/oauth2/token', [
                    'grant_type' => 'client_credentials',
                ]);
    
            if (!$authResponse->successful()) {
                return response()->json(['error' => 'Failed to get access token'], 500);
            }
    
            $accessToken = $authResponse->json()['access_token'];
            $paypalRequestId = uniqid(); // ID único
            $reference = $this->uniqueCode();
    
            $invoiceId = uniqid();
            $currency = 'EUR';
            $value = $price;
    
            // Convertir los items en formato PayPal
            $paypalItems = [
                    "name" => $description,
                    "description" => $description ?? '',
                    "unit_amount" => [
                        "currency_code" => $currency,
                        "value" => number_format((float) $value, 2, '.', '')
                    ],
                    "quantity" => '1',
                    "category" => "DIGITAL_GOODS"
                ];
    
            // Construir payload
            $payload = [
                "intent" => "CAPTURE",
                "purchase_units" => [[
                    "invoice_id" => $invoiceId,
                    "amount" => [
                        "currency_code" => $currency,
                        "value" => number_format((float) $value, 2, '.', ''),
                        "breakdown" => [
                            "item_total" => [
                                "currency_code" => $currency,
                                "value" => number_format((float) $value, 2, '.', '')
                            ]
                        ]
                    ],
                    "items" => [$paypalItems]
                ]],
                "application_context" => [
                    "return_url" => route('paypal.capture', [
                        'paypalRequestId' => $paypalRequestId,
                        'reference' => $reference,
                        'register' => $register,
                        'user_id' => $user->id,
                        'plan_id' => $plan->id
                    ]),
                    "cancel_url" => route('paypal.cancel'),
                    "brand_name" => env('APP_NAME'),
                    "landing_page" => "LOGIN",
                    "user_action" => "PAY_NOW"
                ]
            ];            
    
            // Crear orden en PayPal
            $orderResponse = Http::withToken($accessToken)
                ->withHeaders([
                    'PayPal-Request-Id' => $paypalRequestId,
                ])
                ->post('https://api-m.sandbox.paypal.com/v2/checkout/orders', $payload);
    
            if ($orderResponse->successful()) {
                $links = $orderResponse->json()['links'];
                $approvalUrl = collect($links)->firstWhere('rel', 'approve')['href'];

                $order = PlanOrder::create([
                    'reference' => $reference,
                    'months' => $info,
                    'amount' => $payload['purchase_units'][0]['amount']['value'],
                    'user_id' => $user->id,
                    'plan_id' => $plan->id,
                    'status' => 'pending',
                    'description' => $description
                ]);
    
                return response()->json([
                    'status' => 'success',
                    'approval_url' => $approvalUrl
                ]);
            }
    
            return response()->json([
                'status' => 'error',
                'details' => $orderResponse->body()
            ], $orderResponse->status());

        } catch (\Exception $e) {
            Log::error('Error: ' . $e->getMessage());

            return response()->json([
                'success' => false,
                'message' => 'Error: ' . $e->getMessage(),
            ], 500);
        }

    }

    public function paypalCapturePlanOrder(Request $request)
    {
        try {
            $orderId = $request->query('token');
            $reference = $request->query('reference');
            $order = PlanOrder::where('reference', $reference)->first();
            $userId = $request->query('user_id');
            $user = User::where('id', $userId)->first();
            
            if (empty($orderId)) {
                return redirect()->away('https://2591dce456a7.ngrok-free.app/unsuccessful-payment.html?status=error');
            }

            $clientId = env('PAYPAL_CLIENT_ID');
            $clientSecret = env('PAYPAL_CLIENT_SECRET');

            // Obtener token de acceso
            $authResponse = Http::withBasicAuth($clientId, $clientSecret)
                ->asForm()
                ->post('https://api-m.sandbox.paypal.com/v1/oauth2/token', [
                    'grant_type' => 'client_credentials',
                ]);

            if (!$authResponse->successful()) {
                Log::error('PayPal auth failed on capture: ' . $authResponse->body());
                $order->update([
                    'status' => 'error'
                ]);
                return redirect()->away('https://2591dce456a7.ngrok-free.app/unsuccessful-payment.html?status=auth_error');
            }

            $accessToken = $authResponse->json()['access_token'];

            // Capturar el pago - FORMA CORRECTA de enviar body vacío
            $captureResponse = Http::withToken($accessToken)
                ->withHeaders([
                    'Content-Type' => 'application/json',
                    'PayPal-Request-Id' => uniqid(),
                    'Prefer' => 'return=representation',
                ])
                ->withBody('{}', 'application/json')
                ->post("https://api-m.sandbox.paypal.com/v2/checkout/orders/{$orderId}/capture");

            if ($captureResponse->successful()) {
                $order->update([
                    'status' => 'paid'
                ]);

                $user->plan_id = $request->query('plan_id');
                $user->plan_expires_at = Carbon::now()->addMonths($order->months == 'trimestral' ? 3 : 12);
                $user->save();
                //app(\App\Http\Controllers\BillPdfController::class)->generatePlanOrderInvoice($order);
                return redirect()->away('https://2591dce456a7.ngrok-free.app/successful-payment.html?status=success&order_id=' . $orderId);
            }
            
            Log::error('PayPal capture failed: ' . $captureResponse->body());
            return redirect()->away('https://2591dce456a7.ngrok-free.app/unsuccessful-payment.html?status=capture_error');
            
        } catch (\Exception $e) {
            Log::error('PayPal Capture Error: ' . $e->getMessage());
            return redirect()->away('https://2591dce456a7.ngrok-free.app/unsuccessful-payment.html?status=exception');
        }
    }

    public function paypalCreatePpvOrder(Request $request)
    {
        try {
            $clientId = env('PAYPAL_CLIENT_ID');
            $clientSecret = env('PAYPAL_CLIENT_SECRET');

            $user = Auth::user();
            $movie = Movie::find($request->input('data.movieId'));
            $description = 'Pago PPV ' . $movie->title;

            // Obtener token de acceso
            $authResponse = Http::withBasicAuth($clientId, $clientSecret)
                ->asForm()
                ->post('https://api-m.sandbox.paypal.com/v1/oauth2/token', [
                    'grant_type' => 'client_credentials',
                ]);
    
            if (!$authResponse->successful()) {
                return response()->json(['error' => 'Failed to get access token'], 500);
            }
    
            $accessToken = $authResponse->json()['access_token'];
            $paypalRequestId = uniqid(); // ID único
            $reference = $this->uniqueCode();
    
            $invoiceId = uniqid();
            $currency = 'EUR';
            $value = $movie->pay_per_view_price;
    
            // Convertir los items en formato PayPal
            $paypalItems = [
                    "name" => $description,
                    "description" => $description ?? '',
                    "unit_amount" => [
                        "currency_code" => $currency,
                        "value" => number_format((float) $value, 2, '.', '')
                    ],
                    "quantity" => '1',
                    "category" => "DIGITAL_GOODS"
                ];
    
            // Construir payload
            $payload = [
                "intent" => "CAPTURE",
                "purchase_units" => [[
                    "invoice_id" => $invoiceId,
                    "amount" => [
                        "currency_code" => $currency,
                        "value" => number_format((float) $value, 2, '.', ''),
                        "breakdown" => [
                            "item_total" => [
                                "currency_code" => $currency,
                                "value" => number_format((float) $value, 2, '.', '')
                            ]
                        ]
                    ],
                    "items" => [$paypalItems]
                ]],
                "application_context" => [
                    "return_url" => route('paypal.ppv.capture', [
                        'paypalRequestId' => $paypalRequestId,
                        'reference' => $reference,
                        'user_id' => $user->id,
                        'movie_id' => $movie->id
                    ]),
                    "cancel_url" => route('paypal.cancel'),
                    "brand_name" => env('APP_NAME'),
                    "landing_page" => "LOGIN",
                    "user_action" => "PAY_NOW"
                ]
            ];            
    
            // Crear orden en PayPal
            $orderResponse = Http::withToken($accessToken)
                ->withHeaders([
                    'PayPal-Request-Id' => $paypalRequestId,
                ])
                ->post('https://api-m.sandbox.paypal.com/v2/checkout/orders', $payload);
    
            if ($orderResponse->successful()) {
                $links = $orderResponse->json()['links'];
                $approvalUrl = collect($links)->firstWhere('rel', 'approve')['href'];

                $order = PpvOrder::create([
                    'reference' => $reference,
                    'amount' => $movie->pay_per_view_price,
                    'user_id' => $user->id,
                    'movie_id' => $movie->id,
                    'status' => 'pending',
                    'description' => $description
                ]);
    
                return response()->json([
                    'status' => 'success',
                    'approval_url' => $approvalUrl
                ]);
            }
    
            return response()->json([
                'status' => 'error',
                'details' => $orderResponse->body()
            ], $orderResponse->status());

        } catch (\Exception $e) {
            Log::error('Error: ' . $e->getMessage());

            return response()->json([
                'success' => false,
                'message' => 'Error: ' . $e->getMessage(),
            ], 500);
        }

    }

    public function paypalCapturePpvOrder(Request $request)
    {
        try {
            $orderId = $request->query('token');
            $reference = $request->query('reference');
            Log::debug($reference);
            $order = PpvOrder::where('reference', $reference)->first();
            $userId = $request->query('user_id');
            $user = User::where('id', $userId)->first();
            
            if (empty($orderId)) {
                return redirect()->away('https://2591dce456a7.ngrok-free.app/unsuccessful-payment.html?status=error');
            }

            $clientId = env('PAYPAL_CLIENT_ID');
            $clientSecret = env('PAYPAL_CLIENT_SECRET');

            // Obtener token de acceso
            $authResponse = Http::withBasicAuth($clientId, $clientSecret)
                ->asForm()
                ->post('https://api-m.sandbox.paypal.com/v1/oauth2/token', [
                    'grant_type' => 'client_credentials',
                ]);

            if (!$authResponse->successful()) {
                Log::error('PayPal auth failed on capture: ' . $authResponse->body());
                $order->update([
                    'status' => 'error'
                ]);
                return redirect()->away('https://2591dce456a7.ngrok-free.app/unsuccessful-payment.html?status=auth_error');
            }

            $accessToken = $authResponse->json()['access_token'];

            // Capturar el pago - FORMA CORRECTA de enviar body vacío
            $captureResponse = Http::withToken($accessToken)
                ->withHeaders([
                    'Content-Type' => 'application/json',
                    'PayPal-Request-Id' => uniqid(),
                    'Prefer' => 'return=representation',
                ])
                ->withBody('{}', 'application/json')
                ->post("https://api-m.sandbox.paypal.com/v2/checkout/orders/{$orderId}/capture");

            if ($captureResponse->successful()) {
                $order->update([
                    'status' => 'paid'
                ]);

                //app(\App\Http\Controllers\BillPdfController::class)->generatePlanOrderInvoice($order);
                return redirect()->away('https://2591dce456a7.ngrok-free.app/successful-payment.html?status=success&order_id=' . $orderId);
            }
            
            Log::error('PayPal capture failed: ' . $captureResponse->body());
            return redirect()->away('https://2591dce456a7.ngrok-free.app/unsuccessful-payment.html?status=capture_error');
            
        } catch (\Exception $e) {
            Log::error('PayPal Capture Error: ' . $e->getMessage());
            return redirect()->away('https://2591dce456a7.ngrok-free.app/unsuccessful-payment.html?status=exception');
        }
    }

    public function paypalCancel()
    {
        return redirect()->away('https://2591dce456a7.ngrok-free.app/unsuccessful-payment.html?status=cancel');
    }

    private function uniqueCode() 
	{
		do {
			$reference = str_pad(mt_rand(0, 999999999999), 12, '0', STR_PAD_LEFT);
		} while (PlanOrder::where('reference', $reference)->exists() || PpvOrder::where('reference', $reference)->exists());

		return $reference;
	}
    
}

