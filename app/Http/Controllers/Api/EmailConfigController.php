<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Artisan;

class EmailConfigController extends Controller
{
    public function index()
    {
        try {
            $mail_mailer = env('MAIL_MAILER');
            $mail_host = env('MAIL_HOST');
            $mail_port = env('MAIL_PORT');
            $mail_username = env('MAIL_USERNAME');
            $mail_encryption = env('MAIL_ENCRYPTION');

            return response()->json([
                'success' => true,
                'config' => [
                    'mail_mailer' => $mail_mailer,
                    'mail_host' => $mail_host,
                    'mail_port' => $mail_port,
                    'mail_username' => $mail_username,
                    'mail_encryption' => $mail_encryption
                ]
            ], 200);

        } catch (\Exception $e) {
            Log::error('Error en index EmailConfigController: ' . $e->getMessage());

            return response()->json([
                'success' => false,
                'message' => 'Error en index EmailConfigController: ' . $e->getMessage(),
            ], 500);
        }
    }

    public function update(Request $request)
    {
        try {
            $mail_mailer = sanitize_html($request->mail_mailer);
            $mail_encryption = sanitize_html($request->mail_encryption);
            $mail_host = sanitize_html($request->mail_host);
            $mail_port = sanitize_html($request->mail_port);
            $mail_username = sanitize_html($request->mail_username);
            $mail_password = sanitize_html($request->mail_password);

            $this->setEnvValue('MAIL_USERNAME', $mail_username);
            $this->setEnvValue('MAIL_FROM_ADDRESS', $mail_username);
            $this->setEnvValue('MAIL_ENCRYPTION', $mail_encryption);
            $this->setEnvValue('MAIL_HOST', $mail_host);
            $this->setEnvValue('MAIL_MAILER', $mail_mailer);
            $this->setEnvValue('MAIL_PORT', $mail_port);
            if ($mail_password) {
                $this->setEnvValue('MAIL_PASSWORD', $mail_password);
            }

            // limpiar cache de configuración
            Artisan::call('config:clear');
            Artisan::call('cache:clear');

            return response()->json([
                'success' => true,
                'message' => 'Configuración mail actualizada con éxito.'
            ], 200);

        } catch(\Exception $e) {
            Log::error('Error en update EmailConfigController: ' . $e->getMessage());

            return response()->json([
                'success' => false,
                'message' => 'Error en update EmailConfigController: ' . $e->getMessage(),
            ], 500);
        }
    }

    /*
    $appNameValue = '"' . $name . '"';
    $mailUsernameValue = '"' . $email . '"';

    $this->setEnvValue($appNameKey, $appNameValue);
    $this->setEnvValue($mailUsernameKey, $mailUsernameValue);

    // limpiar cache de configuración
    Artisan::call('config:clear');
    Artisan::call('cache:clear');
    */

    private function setEnvValue($key, $value)
    {
        $path = base_path('.env');

        if (!file_exists($path)) {
            return false;
        }

        $content = file_get_contents($path);

        // si la clave existe, reemplazarla
        if (preg_match("/^{$key}=.*/m", $content)) {
            $content = preg_replace("/^{$key}=.*/m", "{$key}={$value}", $content);
        } else {
            // si no existe, añadirla al final
            $content .= "\n{$key}={$value}";
        }

        file_put_contents($path, $content);

        return true;
    }
}
