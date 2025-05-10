<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use App\Models\ActiveStream;
use Symfony\Component\HttpFoundation\Response;
use Illuminate\Support\Facades\Auth;

class CheckActiveStreams
{
    public function handle(Request $request, Closure $next): Response
    {
        $user = Auth::user();
        $deviceId = $request->header('User-Device-Id'); // Se envía desde JS

        if (!$user || !$deviceId) {
            return response()->json(['error' => 'Unauthorized'], 401);
        }

        $maxStreams = 2; // Límite de reproducciones simultáneas

        $activeStreams = ActiveStream::where('user_id', $user->id)->count();

        if ($activeStreams >= $maxStreams) {
            return response()->json(['error' => 'Máximo de reproducciones alcanzado'], 403);
        }

        return $next($request);
    }
}