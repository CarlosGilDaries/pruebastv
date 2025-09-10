<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Mail;
use App\Mail\ContactFormMail;
use App\Models\CompanyDetail;
use Illuminate\Support\Facades\Log;
use App\Rules\ReCaptcha;

class ContactController extends Controller
{
    public function sendEmail(Request $request)
    {
        try {

            $request->validate([
                'email' => 'required|email',
                'subject' => 'required|string|max:255',
                'message' => 'required|string',
                'g-recaptcha-response' => [new ReCaptcha()]
            ]);

            $email = sanitize_html($request->email);
            $subject = sanitize_html($request->subject);
            $message = sanitize_html($request->message);

            // Obtener el email de la empresa
            $companyDetails = CompanyDetail::first();
            $companyEmail = $companyDetails->email; 

            // Enviar el email
            Mail::to($companyEmail)->send(new ContactFormMail(
                $email,
                $subject,
                $message
            ));

            return response()->json([
                'success' => true,
                'message' => 'Email enviado con éxito'
            ]);

        } catch (\Exception $e) {
            Log::error('Error en sendEmail de ContactController: ' . $e->getMessage());

            return response()->json([
                'success' => false,
                'message' => 'Error en sendEmail de ContactController: ' . $e->getMessage(),
            ], 500);
        }
    }
}
