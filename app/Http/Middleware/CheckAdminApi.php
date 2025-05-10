<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;
use Illuminate\Support\Facades\Auth;

class CheckAdminApi
{
    public function handle(Request $request, Closure $next): Response
    {
        // 2. Verificar rol de admin
        if (Auth::user()->rol != 'admin') {
            return response()->json([
                'success' => false,
                'message' => 'Acceso no autorizado',
                'error_code' => 'admin_required'
            ], 403);
        }

        // 3. Pasar al controlador si todo está bien
        return $next($request);
    }
}
