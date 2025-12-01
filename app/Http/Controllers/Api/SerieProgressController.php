<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\UserSerieProgress;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;

class SerieProgressController extends Controller
{
    public function index()
    {
        try {
            $user = Auth::user();
            
            $progress = UserSerieProgress::with(['episode.movie.series', 'episode.movie.genders', 'episode.episodeProgress', 'episode.seoSetting'])
                ->where('user_id', $user->id)
                ->orderBy('updated_at', 'desc')
                ->get();
    
            if ($progress->isEmpty()) {
                return response()->json([
                    'success' => false,
                    'message' => 'No hay películas para seguir viendo.'
                ], 200);
            }
    
            return response()->json([
                'success' => true,
                'movies' => $progress
            ], 200);
    
        } catch (\Exception $e) {
            Log::error('Error: ' . $e->getMessage());
    
            return response()->json([
                'success' => false,
                'message' => 'Error: ' . $e->getMessage(),
            ], 500);
        }
    }

    public function store(Request $request)
    {
        try {
            $user = Auth::user();
            $validated = $request->validate([
                'movie_id' => 'required|exists:series,id',
                'progress_seconds' => 'required|integer|min:0'
            ]);
            
            $progress = UserSerieProgress::updateOrCreate(
                [
                    'user_id' => $user->id,
                    'serie_id' => $validated['movie_id']
                ],
                [
                    'progress_seconds' => $validated['progress_seconds']
                ]
            );
            
            return response()->json($progress);

        } catch (\Exception $e) {
            Log::error('Error: ' . $e->getMessage());

            return response()->json([
                'success' => false,
                'message' => 'Error: ' . $e->getMessage(),
            ], 500);
        }
    }
    
    public function show($movieId)
    {
        try {
            $user = Auth::user();
            $progress = UserSerieProgress::where('user_id', $user->id)
                ->where('serie_id', $movieId)
                ->first();
                
            return response()->json($progress ? $progress->progress_seconds : 0);

        } catch (\Exception $e) {
            Log::error('Error: ' . $e->getMessage());

            return response()->json([
                'success' => false,
                'message' => 'Error: ' . $e->getMessage(),
            ], 500);
        }
    }

    public function destroy($movieId)
    {
        try {
            $user = Auth::user();
            $deleted = UserSerieProgress::where('user_id', $user->id)
                ->where('serie_id', $movieId)
                ->delete();
                
            return response()->json(['success' => $deleted > 0]);

        } catch (\Exception $e) {
            Log::error('Error: ' . $e->getMessage());

            return response()->json([
                'success' => false,
                'message' => 'Error: ' . $e->getMessage(),
            ], 500);
        }
    }

    private function timeToSeconds($time)
    {
        if (empty($time)) return 0;
        
        $parts = explode(':', $time);
        $seconds = 0;
        
        if (count($parts) === 3) {
            $seconds += (int)$parts[0] * 3600; 
            $seconds += (int)$parts[1] * 60;  
            $seconds += (int)$parts[2];       
        } elseif (count($parts) === 2) {
            $seconds += (int)$parts[0] * 60; 
            $seconds += (int)$parts[1];        
        }
        
        return $seconds;
    }
}
