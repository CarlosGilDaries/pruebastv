<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;
use App\Models\User;
use App\Models\Role;
use App\Models\UserSession;
use Carbon\Carbon;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\Log;
use Illuminate\Auth\Events\Registered;
use Illuminate\Support\Facades\Auth;
use Illuminate\Validation\Rule;
use App\Notifications\FreeFirstWarningNotification;

class LoginApiController extends Controller
{
    public function register(Request $request)
    {
        try {
            $validator = Validator::make($request->all(), [
                'name' => ['required', 'string', 'max:50'],
                'surnames' => ['required', 'string', 'max:100'],
                'email' => ['required', 'string', 'email', 'max:100', 'unique:users,email'],
                'dni' => [
                    Rule::requiredIf(fn () => $request->plan_type !== 'free'),
                    'nullable',
                ],

                'address' => [
                    Rule::requiredIf(fn () => $request->plan_type !== 'free'),
                    'nullable',
                    'string',
                    'max:200',
                ],
                'city' => [
                    'required',
                    'string',
                    'max:50',
                ],
                'country' => [
                    'required',
                    'string',
                    'max:50',
                ],
                'phone' => ['nullable', 'string', 'max:15'],
                'birth_year' => [
                    'required',
                    'integer',
                    'digits:4',
                    'between:1950,' . now()->year
                ],

                'gender' => [
                    'required',
                    Rule::in(['man', 'woman', 'other']),
                ],

                'password' => ['required', 'string', 'min:6', 'same:password_confirmation'],
                'password_confirmation' => ['required', 'string', 'min:6'],
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'success' => false,
                    'errors' => $validator->errors(),
                    'message' => 'Error en la validación del formulario'
                ], 422);
            } 

            $name = sanitize_html($request->name);
            $surnames = sanitize_html($request->surnames);
            $email = sanitize_html($request->email);
            if ($request->dni != null) {
                $dni = sanitize_html($request->dni);
            } else {
                $dni = null;
            }
            $address = sanitize_html($request->address);
            $city = sanitize_html($request->city);
            $country = sanitize_html($request->country);
            if ($request->phone != null) {
                $phone = sanitize_html($request->phone);
                $phone_code = sanitize_html(($request->phone_code));
            } else {
                $phone = null;
            }
            $gender = sanitize_html($request->gender);
            $birth_year = sanitize_html($request->birth_year);
            $plan_type = sanitize_html($request->plan_type);
            $role = sanitize_html($request->role);
            if ($role == 'web') {
                $new_role = Role::where('name', $role)
                    ->first();
            } else {
                $new_role = Role::where('id', $role)
                    ->first();
            }
            if ($new_role && $new_role->name == 'web') {
                $rol = 'user';
            } else {
                $rol = 'admin';
            }
            $plan = sanitize_html($request->plan);
            if ($plan) {
                $planId = $plan;
            } else {
                $planId = null;
            }
            $plan_time = sanitize_html($request->plan_time);
            if ($plan_time) {
                if ($plan_time == 'trimestral') {
                    $plan_expires_at = Carbon::now()->addMonths(3);
                } else if ($plan_time == 'annual') {
                    $plan_expires_at = Carbon::now()->addMonths(12);
                } else {
                    $plan_expires_at = null;
                }
            } else {
                $plan_expires_at = null;
            }

            $user = User::create([
                'name' => $name,
                'email' => $email,
                'surnames' => $surnames,
                'dni' => $dni,
                'address' => $address,
                'city' => $city,
                'country' => $country,
                'birth_year' => $birth_year,
                'phone' => $phone,
                'phone_code' => $phone_code,
                'gender' => $gender,
                'rol' => $rol,
                'free_available' => 1,
                'plan_id' => $planId,
                'password' => Hash::make($request->password),
                'role_id' => $new_role->id,
                'plan_expires_at' => $plan_expires_at
            ]);

            event(new Registered($user));

            $token = $user->createToken($name . '/' . $email)->plainTextToken;

            if ($plan_type != 'free') {
                return response()->json([
                    'success' => true,
                    'data' => [
                        'auth_token' => $token,
                        'user' => $user->email,
                        'require_payment' => true,
                        ],
                    'message' => 'Usuario registrado exitosamente'
                ], 200);
            } else {
                $user->update(['plan_expires_at' => Carbon::now()->addDays(10)]);
                $user->save();
                $user->notify(new FreeFirstWarningNotification());
                
                return response()->json([
                    'success' => true,
                    'data' => [
                        'auth_token' => $token,
                        'user' => $user->email,
                        'require_device_registration' => true,
                        ],
                    'message' => 'Usuario registrado exitosamente'
                ], 201);
            }

        } catch (\Exception $e) {
            Log::error('Error: ' . $e->getMessage());

            return response()->json([
                'success' => false,
                'message' => 'Error: ' . $e->getMessage(),
            ], 500);
        }
    }

    public function login(Request $request)
    {
        try {
            //Artisan::call('create:default-user');

            $validator = Validator::make($request->all(), [
                'email' => 'required|email',
                'password' => 'required',
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'success' => false,
                    'errors' => $validator->errors()
                ], 422);
            }

            $email = sanitize_html($request->email);
            $password = sanitize_html($request->password);

            $user = User::where('email', $email)->first();
            $plan = $user->plan;

            if (!$user || !Hash::check($password, $user->password)) {
                return response()->json([
                    'success' => false,
                    'message' => 'Credenciales incorrectas'
                ], 401);
            }

            $device_id = $request->header('User-Device-ID');
            $ip = $request->header('User-IP');
            $userAgent = $request->header('User-Agent');

            $session = UserSession::where('user_id', $user->id)
                ->where('device_id', $device_id)
                ->where('ip_address', $ip)
                ->where('user_agent', $userAgent)
                ->first();

            if ($user->rol == 'admin') {
                $session = UserSession::where('user_id', $user->id)->first();

                if (!$session) {
                    $deviceId = Str::uuid();

                    $newSession = UserSession::create([
                        'user_id' => $user->id,
                        'device_name' => 'admin',
                        'device_id' => $deviceId,
                        'ip_address' => $ip,
                        'user_agent' => $userAgent
                    ]);

                    $token = $user->createToken($user->name . '/' . $user->email)->plainTextToken;

                    return response()->json([
                        'success' => true,
                        'data' => [
                            'user' => $user->email,
                            'auth_token' => $token,
                            'session' => $newSession
                        ],
                        'message' => 'Inicio de sesión exitoso'
                    ], 200);
                }

                $token = $user->createToken($user->name . '/' . $user->email)->plainTextToken;

                return response()->json([
                    'success' => true,
                    'data' => [
                        'user' => $user,
                        'auth_token' => $token,
                        'session' => $session
                    ],
                    'message' => 'Inicio de sesión exitoso'
                ], 200);
            }

            // Verificar límite de dispositivos según plan
			if ($plan) {
            	$maxDevices = $plan->max_devices;
			} else {
				$maxDevices = 1;
			}
            $deviceCount = UserSession::where('user_id', $user->id)->count();

            // Verificar si ya existe una sesión para este dispositivo
            $session = UserSession::where('user_id', $user->id)
                ->where('device_id', $device_id)
                ->where('ip_address', $ip)
                ->where('user_agent', $userAgent)
                ->first();
			
			// Si se ha superado el límite de dispositivos
            if (!$session && $deviceCount >= $maxDevices) {
                return response()->json([
                    'success' => false,
                    'message' => 'Has alcanzado el límite de dispositivos permitidos',
                    'device_limit_reached' => true,
                    'current_devices' => UserSession::where('user_id', $user->id)->get(),
                    'max_devices' => $maxDevices,
                    'data' => [
                        'auth_token' => $user->createToken($user->name . '/' . $user->email)->plainTextToken,
                        'user' => $user->email,
                    ],
					'session_data' => [
						'device_id' => $device_id,
						'ip' => $ip,
						'userAgent' => $userAgent,
					],
                ], 403);
            }
			
			// Crear nueva sesión si no existe
            if (!$session || (!$session && !$plan)) {
                return response()->json([
                    'success' => true,
                    'data' => [
                        'require_device_registration' => true,
                        'user' => $user->email,
                        'auth_token' => $user->createToken($user->name . '/' . $user->email)->plainTextToken
                    ],
                    'message' => 'Por favor registre este dispositivo'
                ], 200);
            }

            // Si existe sesión, actualizar y generar token
            $session->update(['last_activity' => now()]);
            $token = $user->createToken($device_id)->plainTextToken;

            return response()->json([
                'success' => true,
                'data' => [
                    'user' => $email,
                    'auth_token' => $token,
                    'session' => $session
                ],
                'message' => 'Inicio de sesión exitoso'
            ], 200);

        } catch (\Exception $e) {
            Log::error('Error: ' . $e->getMessage());

            return response()->json([
                'success' => false,
                'message' => 'Error: ' . $e->getMessage(),
            ], 500);
        }
        
    }

    public function logout(Request $request)
    {
        try {
            $request->user()->currentAccessToken()->delete();

            return response()->json([
                'success' => true,
                'message' => 'Sesión cerrada exitosamente'
            ], 200);
            
        } catch (\Exception $e) {
            Log::error('Error: ' . $e->getMessage());

            return response()->json([
                'success' => false,
                'message' => 'Error: ' . $e->getMessage(),
            ], 500);
        }
    }

    public function checkEmail($email)
    {
        try {
            $emailSanitized = sanitize_html($email);
            $exists = User::where('email', $emailSanitized)->exists();
            $user = Auth::user();

            if ($user && $email == $user->email) {
                return response()->json([
                    'success' => false,
                    'message' => 'El email no ha cambiado.'
                ]);
            }

            if ($exists) {
                return response()->json([
                    'success' => false,
                    'message' => 'El email ya existe en la Base de Datos.'
                ]);
            } else {
                return response()->json([
                    'success' => true,
                    'message' => 'El email no existe en la Base de Datos.'
                ]);
            }

        } catch (\Exception $e) {
            Log::error('Error: ' . $e->getMessage());

            return response()->json([
                'success' => false,
                'message' => 'Error: ' . $e->getMessage(),
            ], 500);
        }
    }

    public function checkDni($dni)
    {
        try {
            $dniSanitized = sanitize_html($dni);
            $exists = User::where('dni', $dniSanitized)->exists();

            if ($exists) {
                return response()->json([
                    'success' => false,
                    'message' => 'El dni ya existe en la Base de Datos.'
                ]);
            } else {
                return response()->json([
                    'success' => true,
                    'message' => 'El dni no existe en la Base de Datos.'
                ]);
            }

        } catch (\Exception $e) {
            Log::error('Error: ' . $e->getMessage());

            return response()->json([
                'success' => false,
                'message' => 'Error: ' . $e->getMessage(),
            ], 500);
        }
    }

    public function checkAuth(Request $request)
    {
        return response()->json([
            'success' => true,
            'user' => $request->user(),
            'active_sessions' => UserSession::where('user_id', $request->user()->id)->get()
        ], 200);
    }
}
