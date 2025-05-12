<?php

namespace App\Http\Controllers\Api;

use Illuminate\Support\Facades\Auth;
use Illuminate\Http\Request;
use App\Http\Controllers\Controller;
use App\Models\Order;
use App\Models\Plan;
use App\Models\User;
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
}