<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Movie;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;

class ViewedContentController extends Controller
{
    public function viewed(string $id)
    {
        try {
            $user = Auth::user();
            $content = Movie::where('id', $id)->first();

            $user->viewed()->syncWithoutDetaching($content->id);

            return response()->json([
                'success' => true,
                'message' => 'Contenido añadido a vistos',
            ], 200);

        } catch (\Exception $e) {
            Log::error('Error: ' . $e->getMessage());

            return response()->json([
                'success' => false,
                'message' => 'Error: ' . $e->getMessage(),
            ], 500);
        }
    }

    public function getViewedContent()
    {
        try {
            $user = Auth::user();
            $viewed = $user->viewed()->with('genders')->get();

            return response()->json([
                'success' => true,
                'viewed' => $viewed,
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
