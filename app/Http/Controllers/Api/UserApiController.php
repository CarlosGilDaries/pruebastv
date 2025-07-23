<?php

namespace App\Http\Controllers\Api;

use Illuminate\Support\Facades\Auth;
use Illuminate\Http\Request;
use App\Http\Controllers\Controller;
use App\Models\Bill;
use Illuminate\Support\Facades\Validator;
use Illuminate\Validation\Rule;
use App\Models\Plan;
use App\Models\PlanOrder;
use App\Models\UnifiedOrder;
use App\Models\User;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Hash;
use DataTables;
use Illuminate\Auth\Events\Registered;

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

    public function datatable()
    {
        try {
            $users = User::with('plan', 'role')->get();

			return DataTables::of($users)
				->addColumn('id', function($user) {
					return $user->id;
				})
				->addColumn('full_name', function($user) {
					return $user->name . ' ' . $user->surnames;
				})
				->addColumn('email', function($user) {
					return $user->email;
				})
                ->addColumn('age', function($user) {
					return $user->birth_year;
				})
                ->addColumn('gender', function($user) {
					return $user->gender;
				})
                ->addColumn('rol', function($user) {
					return $user->rol;
				})
                ->addColumn('role', function($user) {
                    if ($user->role) {
                        return $user->role->name;
                    } else {
                        return 'N/A';
                    }		
				})
                ->addColumn('plan', function($user) {
                    if ($user->plan) {
						return $user->plan->name;
					} else {
						return 'Sin plan';
					}
				})
				->addColumn('actions', function($user) {
					return $this->getActionButtons($user);
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
     * Display the specified resource.
     */
    public function show(string $id)
    {
        try {
            $user = User::with(['plan', 'role'])
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
            $validator = Validator::make($request->all(), [
                'name' => ['required', 'string', 'max:50'],
                'surnames' => ['required', 'string', 'max:100'],
                'email' => ['required', 'string', 'email', 'max:100', 'unique:users,email'],
                'dni' => [
                    Rule::requiredIf(fn () => $request->plan_type !== 'free'),
                    'nullable',
                    'regex:/^\d{8}[A-Za-z]$/',
                    'unique:users,dni',
                    function ($attribute, $value, $fail) {
                        if ($value) {
                            if (!preg_match('/^(\d{8})([A-Za-z])$/', $value, $matches)) {
                                return; // ya lo manejará la regex
                            }

                            $numero = (int) $matches[1];
                            $letraIngresada = strtoupper($matches[2]);
                            $letras = 'TRWAGMYFPDXBNJZSQVHLCKE';
                            $letraCorrecta = $letras[$numero % 23];

                            if ($letraIngresada !== $letraCorrecta) {
                                $fail("La letra del DNI no es válida.");
                            }
                        }
                    }
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

            $user = User::where('id', $id)->first();
            $name = sanitize_html($request->input('name'));
            $surnames = sanitize_html($request->input('surnames'));
            $email = sanitize_html($request->input('email'));
            $phone = sanitize_html($request->input('phone'));
            $phone_code = sanitize_html($request->input('phone_code'));
            $dni = sanitize_html($request->input('dni'));
            $address = sanitize_html($request->input('address'));
            $city = sanitize_html($request->input('city'));
            $country = sanitize_html($request->input('country'));
            if ($request->input('password')) {
            $password = sanitize_html($request->input('password'));
            }
			
            $user->name = $name;
            $user->surnames = $surnames;
            $user->email = $email;
            $user->dni = $dni;
            $user->address = $address;
            $user->phone = $phone;
            $user->phone_code = $phone_code;
            $user->city = $city;
            $user->country = $country;
            $user->birth_year = $request->input('birth_year');
			if ($request->input('plan') != 0) {
            	$user->plan_id = $request->input('plan');
			} 
            if ($request->input('role') != 0) {
            	$user->role_id = $request->input('role');
                $user->rol = 'admin';
			} else {
                $user->role_id = null;
                $user->rol = 'user';
            }
            $user->gender = $request->input('gender');
            if ($request->input('password')) {
			    $user->password = Hash::make($password);
            }
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

    public function currentUserChange(Request $request)
    {
        try {
            $validator = Validator::make($request->all(), [
                'email' => ['string', 'email', 'max:100', 'unique:users,email'],
                'address' => [
                    'string',
                    'max:200',
                ],
                'city' => [
                    'string',
                    'max:50',
                ],
                'country' => [
                    'string',
                    'max:50',
                ],
                'phone' => ['string', 'max:15'],
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

            $user = Auth::user();
            if (!$user || !Hash::check($request->input('password'), $user->password)) {
                return response()->json([
                    'success' => false,
                    'message' => 'Credenciales incorrectas'
                ], 401);
            }

            $email = sanitize_html($request->input('email'));
            $address = sanitize_html($request->input('address'));
            $city = sanitize_html($request->input('city'));
            $country = sanitize_html($request->input('country'));
            $new_password = sanitize_html($request->input('new_password'));
            $phone = sanitize_html($request->input('phone'));
            $phone_code = sanitize_html($request->input('phone_code'));

            if ($email) {
                $user->email = $email;
                $user->email_verified_at = null;
                $user->save(); 
                $user->sendEmailVerificationNotification();
            }
            if ($address) $user->address = $address;
            if ($city) $user->city = $city;
            if ($country) $user->country = $country;

            if ($phone) $user->phone = $phone;
            if ($phone_code) $user->phone_code = $phone_code;

            if ($new_password) $user->password = Hash::make($new_password);

            $user->save();

            return response()->json([
                'success' => true,
                'user' => $user,
                'message' => 'Usuario editado con éxito'
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
            $user = Auth::user()->load('role');
            $suscription = PlanOrder::where('user_id', $user->id)
                ->where('status', 'paid')
                ->orderBy('created_at', 'desc')
                ->first();

            if ($user->role) {
                $permissions = $user->role->permissions->pluck('name');
            } else {
                $permissions = 'none';
            }

            if ($suscription) {
                return response()->json([
                    'success' => true,
                    'data' => [
                        'user' => $user,
                        'plan' => $user->plan,
                        'suscription' => $suscription->months,
                        'permissions' => $permissions
                    ],
                    'message' => 'Usuario obtenido con éxito'
                ], 200);
            } else {
                return response()->json([
                    'success' => true,
                    'data' => [
                        'user' => $user,
                        'plan' => $user->plan,
                        'permissions' => $permissions
                    ],
                    'message' => 'Usuario obtenido con éxito'
                ], 200);
            }

        } catch (\Exception $e) {
            Log::error('Error: ' . $e->getMessage());

            return response()->json([
                'success' => false,
                'message' => 'Error: ' . $e->getMessage(),
            ], 500);
        }
    }

    public function getOrders()
    {
        try {
            $user = Auth::user();
            $orders = UnifiedOrder::where('user_id', $user->id)
                ->where('status', 'paid')
                ->orderBy('created_at', 'desc')
                ->get();

            return response()->json([
                'success' => true,
                'orders' => $orders,
            ], 200);

        } catch (\Exception $e) {
            Log::error('Error: ' . $e->getMessage());

            return response()->json([
                'success' => false,
                'message' => 'Error: ' . $e->getMessage(),
            ], 500);
        }
    }

    public function getBill(string $id)
    {
        try {
            $user = Auth::user();
            $bill = Bill::where('user_id', $user->id)
                ->where('billable_id', $id)
                ->first();

            return response()->json([
                'success' => true,
                'bill' => $bill,
            ], 200);

        } catch (\Exception $e) {
            Log::error('Error: ' . $e->getMessage());

            return response()->json([
                'success' => false,
                'message' => 'Error: ' . $e->getMessage(),
            ], 500);
        }
    }

    public function setRole(Request $request, $userId)
    {
        try {
            $user = User::where('id', $userId)->first();
            $user->role_id = $request->input('role_id');

            return response()->json([
                'success' => true,
                'message' => 'Rol asignado con éxito',
            ], 200);

        } catch (\exception $e) {
            Log::error('Error: ' . $e->getMessage());

            return response()->json([
                'success' => false,
                'message' => 'Error: ' . $e->getMessage(),
            ], 500);
        }
    }

    private function getActionButtons($user)
	{
		$id = $user->id;

		return '
			<div class="actions-container">
				<button class="actions-button">Acciones</button>
				<div class="actions-menu">
					<a href="/admin/edit-user.html" class="action-item content-action edit-button" data-id="'.$id.'">Editar</a>
                    <form class="users-delete-form" data-id="' . $id . '">
						<input type="hidden" name="content_id" value="' . $id . '">
						<button class="action-item content-action delete-btn" type="submit">Eliminar</button>
					</form>
				</div>
			</div>';
	}
}