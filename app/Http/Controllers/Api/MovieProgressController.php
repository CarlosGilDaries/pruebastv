<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\UserMovieProgress;
use Illuminate\Support\Facades\Auth;

class MovieProgressController extends Controller
{
    public function store(Request $request)
    {
        $user = Auth::user();
        $validated = $request->validate([
            'movie_id' => 'required|exists:movies,id',
            'progress_seconds' => 'required|integer|min:0'
        ]);
        
        $progress = UserMovieProgress::updateOrCreate(
            [
                'user_id' => $user->id,
                'movie_id' => $validated['movie_id']
            ],
            [
                'progress_seconds' => $validated['progress_seconds']
            ]
        );
        
        return response()->json($progress);
    }
    
    public function show($movieId)
    {
        $user = Auth::user();
        $progress = UserMovieProgress::where('user_id', $user->id)
            ->where('movie_id', $movieId)
            ->first();
            
        return response()->json($progress ? $progress->progress_seconds : 0);
    }

    // Añade este método al controlador
    public function destroy($movieId)
    {
        $user = Auth::user();
        $deleted = UserMovieProgress::where('user_id', $user->id)
            ->where('movie_id', $movieId)
            ->delete();
            
        return response()->json(['success' => $deleted > 0]);
    }
}
