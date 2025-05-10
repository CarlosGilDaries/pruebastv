<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;
use Illuminate\Support\Facades\Auth;
use App\Models\UserSession;

class EnsureDeviceSessionExists
{
    /**
     * Handle an incoming request.
     */
    public function handle(Request $request, Closure $next): Response
    {
        $user = Auth::user();
        if ($user->rol != 'admin') {
            $userId = Auth::id();
            $device_id = $request->cookie('device_id');
            $ip = getClientIp();
            $userAgent = $request->header('User-Agent');

            // Verificar si el dispositivo está registrado en user_sessions
            $sessionExists = UserSession::where('user_id', $userId)
                                        ->where('device_id', $device_id)
                                        ->where('ip_address', $ip)
                                        ->where('user_agent', $userAgent)
                                        ->exists();

            if (!$sessionExists) {
                return redirect()->route('logout');
            }
            
            return $next($request);
        }

        return $next($request);
    }
}
