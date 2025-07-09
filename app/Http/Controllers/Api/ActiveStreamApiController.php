<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\ActiveStream;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use App\Models\UserSession;
use Illuminate\Support\Facades\Log;

class ActiveStreamApiController extends Controller
{
 public function startStream(Request $request)
    {
        try {
            $user = Auth::user();
            $plan = $user->plan;


            if ($plan->name == 'Admin') {
                return response()->json(['message' => 'El usuario ya está transmitiendo'], 200);
            } else {
                $maxStreams = $plan->max_streams;
            }

            $deviceId = $request->header('User-Device-Id');

            if (!$user || !$deviceId) {
                return response()->json(['error' => 'Unauthorized'], 401);
            }

            $activeStreams = ActiveStream::where('user_id', $user->id)->count();

            // Verificar si ya existe una instancia de transmisión activa para este usuario y dispositivo
            $existingStream = ActiveStream::where('user_id', $user->id)
                ->where('device_id', $deviceId)
                ->first();

            if ($existingStream) {
                return response()->json([
                    'success' => true,
                    'message' => 'El usuario ya está transmitiendo'
                ], 200);
            }

            if ($activeStreams < $maxStreams) {
                ActiveStream::create([
                    'user_id' => $user->id,
                    'device_id' => $deviceId,
                ]);
                
                return response()->json([
                    'success' => true,
                    'message' => 'Transmisión iniciada correctamente.'
                ], 200);
            }

            return response()->json([
                'success' => false,
                'stream_limit_reached' => true,
                'error' => 'Límite de streams simultáneos alcanzado'
            ], 403);    
        
        } catch (\Exception $e) {
            Log::error('Error: ' . $e->getMessage());

            return response()->json([
                'success' => false,
                'message' => 'Error: ' . $e->getMessage(),
            ], 500);
        }
    }
        

    public function keepAlive(Request $request)
    {
        try {
            $user = Auth::user();
            $deviceId = $request->header('User-Device-Id');

            if (!$user || !$deviceId) {
                return response()->json(['error' => 'Unauthorized'], 401);
            }

            ActiveStream::where('user_id', $user->id)
                ->where('device_id', $deviceId)
                ->update(['last_active_at' => now()]);
            
            UserSession::where('user_id', $user->id)
                ->where('device_id', $deviceId)
                ->update(['last_activity' => now()]);

            return response()->json([
                'success' => true,
                'message' => 'Stream actualizado'
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
