<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;
use Illuminate\Support\Facades\Redirect;

class EnsureEmailIsVerified
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
{
    if (!$request->user() || !$request->user()->hasVerifiedEmail()) {
        // Si es una petición API/AJAX (con header Accept: application/json)
        if ($request->expectsJson() || $request->is('api/*')) {
            return response()->json([
                'error' => 'Email no verificado',
                'redirect_url' => config('app.frontend_url').'/verificar-email'
            ], 403);
        }
        
        // Si es navegación normal (desde el navegador)
        return redirect()->to(config('app.frontend_url').'/verificar-email');
    }

    return $next($request);
}
}
