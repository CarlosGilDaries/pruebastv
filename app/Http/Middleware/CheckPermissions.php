<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;

class CheckPermissions
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next, $basePermission): Response
    {
        $user = Auth::user();
        $type = $request->route('type');

        if ($type) {
            if ($type == 'local') {
                $permission = 'contenido_local';
            } else if ($type == 'external') {
                $permission = 'contenido_externo';
            } else {
                $permission = 'streams';
            }
        } else {
            $permission = $basePermission;
        }

        if (!$user || !$user->role || !$user->role->permissions->contains('name', $permission)) {
            return response()->json([
                'error' => 'No tienes el permiso necesario',
                'redirect_url' => config('app.frontend_url').'/'
            ], 403);
        }

        return $next($request);
    }
}
