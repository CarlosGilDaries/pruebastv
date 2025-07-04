<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Auth\Events\Verified;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use App\Models\User;

class VerifyEmailController extends Controller
{
    public function __invoke(Request $request, $id, $hash): RedirectResponse
    {
        $user = User::findOrFail($id);

        // Verifica el hash
        /*if (!hash_equals((string) $hash, sha1($user->getEmailForVerification()))) {
            return redirect()->to(config('app.frontend_url').'/email-verification-error?message=Invalid verification link');
        }

        if ($user->hasVerifiedEmail()) {
            return redirect()->to(config('app.frontend_url').'/email-verification-info?message=Email already verified');
        }*/

        if ($user->markEmailAsVerified()) {
            event(new Verified($user));
        }

        return redirect()->to(config('app.frontend_url').'/email-verification-success.html');
    }
}