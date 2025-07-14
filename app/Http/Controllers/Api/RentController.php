<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Movie;
use Illuminate\Http\Request;
use App\Models\Rent;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Carbon;

class RentController extends Controller
{
    public function show(string $id)
    {
        try {
            $user = Auth::user();
            $rent = Rent::where('user_id', $user->id)
                ->where('movie_id', $id)
                ->first();
            
            return response()->json([
                'success' => true,
                'rent' => $rent
            ], 200);

        } catch (\Exception $e) {
			Log::error('Error en el método show de RentController: ' . $e->getMessage());
			
            return response()->json([
                'success' => false,
                'message' => 'Error en el método show de RentController:: ' . $e->getMessage(),
            ], 500);
        }
    }

    public function store(string $id)
    {
        try {
            $user = Auth::user();
            $movie = Movie::where('id', $id)->first();
            $rent_days = $movie->rent_days;
            $rent = new Rent();

            $rent->user_id = $user->id;
            $rent->movie_id = $id;
            $rent->expires_at = Carbon::now()->addDays($rent_days); 

        } catch (\Exception $e) {
			Log::error('Error en el método store de RentController: ' . $e->getMessage());
			
            return response()->json([
                'success' => false,
                'message' => 'Error en el método store de RentController:: ' . $e->getMessage(),
            ], 500);
        }
    }

    public function destroy($userId, $movieId)
    {
        try {
            Rent::where('user_id', $userId)
                ->where('movie_id', $movieId)
                ->first()
                ->delete();

            return response()->json([
                'success' => true,
                'message' => 'Alquiler eliminado correctamente.',
            ], 200);

        } catch (\Exception $e) {
			Log::error('Error en el método destroy de RentController: ' . $e->getMessage());
			
            return response()->json([
                'success' => false,
                'message' => 'Error en el método destroy de RentController:: ' . $e->getMessage(),
            ], 500);
        }
    }
}
