<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Movie;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;

class FavoritesController extends Controller
{
    public function addFavorite(string $id)
    {
        try {
            $user = Auth::user();
            $content = Movie::where('id', $id)->first();

            $user->favorites()->syncWithoutDetaching($content->id);

            return response()->json([
                'success' => true,
                'message' => 'Película añadida a favoritos.',
            ], 200);

        } catch (\Exception $e) {
            Log::error('Error: ' . $e->getMessage());

            return response()->json([
                'success' => false,
                'message' => 'Error: ' . $e->getMessage(),
            ], 500);
        }
    }

    public function quitFavorite(string $id)
    {
        try {
            $user = Auth::user();
            Log::debug($id);
            $content = Movie::where('id', $id)->first();

            $user->favorites()->detach($content->id);

            return response()->json([
                'success' => true,
                'message' => 'Película quitada de favoritos.',
            ], 200);

        } catch (\Exception $e) {
            Log::error('Error: ' . $e->getMessage());

            return response()->json([
                'success' => false,
                'message' => 'Error: ' . $e->getMessage(),
            ], 500);
        }
    }

    public function getFavorites() 
    {
        try {
            $user = Auth::user();
            $favorites = $user->favorites()->with('gender')->get();

            return response()->json([
                'success' => true,
                'favorites' => $favorites,
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
