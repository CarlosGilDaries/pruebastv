<?php

namespace App\Http\Controllers\Api;

use Illuminate\Support\Facades\Auth;
use Illuminate\Http\Request;
use App\Http\Controllers\Controller;
use App\Models\Plan;
use App\Models\PlanOrder;
use App\Models\User;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Hash;
use DataTables;

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
            $user = User::where('id', $id)->first();
            $name = sanitize_html($request->input('name'));
            $surnames = sanitize_html($request->input('surnames'));
            $email = sanitize_html($request->input('email'));
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