<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;
use Illuminate\Support\Facades\Auth;
use App\Models\UserSession;

class EnsureSessionExistsApi
{
    public function handle(Request $request, Closure $next): Response
    {
        $user = Auth::user();
        
        // Permitir acceso a admins
        if ($user->rol === 'admin') {
            return $next($request);
        }

        // Verificar device_id desde headers (no cookies)
        $deviceId = $request->header('X-Device-ID');
        
        if (!$deviceId) {
            return response()->json([
                'success' => false,
                'message' => 'Identificador de dispositivo requerido',
                'error_code' => 'device_id_required'
            ], 400);
        }

        // Verificación más flexible (sin IP/user-agent estrictos)
        $sessionExists = UserSession::where('user_id', $user->id)
                                  ->where('device_id', $deviceId)
                                  ->exists();

        if (!$sessionExists) {
            return response()->json([
                'success' => false,
                'message' => 'Dispositivo no autorizado',
                'error_code' => 'device_not_registered',
                'action_required' => 'register_device'
            ], 403);
        }

        return $next($request);
    }
}
