<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\CompanyDetail;
//use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Artisan;

class CompanyDetailController extends Controller
{
    /**
     * Display the specified resource.
     */
    public function show()
    {
        try {
            $details = CompanyDetail::first();

            return response()->json([
                'success' => true,
                'details' => $details,
                'message' => 'Detalles obtenidos con éxito.'
            ]);

        } catch (\Exception $e) {
            Log::error('Error: ' . $e->getMessage());

            return response()->json([
                'success' => false,
                'message' => 'Error: ' . $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request)
    {
        try {
            $details = CompanyDetail::first();
            $name = sanitize_html($request->input('name'));
            $fiscal_address = sanitize_html($request->input('fiscal_address'));
            $nif_cif = sanitize_html($request->input('nif_cif'));
            $email = sanitize_html($request->input('email'));
            $lopd_text = sanitize_html($request->input('lopd_text'));
            $commercial_registry_text = sanitize_html($request->input('commercial_registry_text'));
			$facebook = sanitize_html($request->input('facebook'));
			$instagram = sanitize_html($request->input('instagram'));
			$twitter = sanitize_html($request->input('twitter'));

            $details->name = $name;
			$details->fiscal_address = $fiscal_address;
			$details->nif_cif = $nif_cif;
			$details->email = $email;
            $details->commercial_registry_text = $commercial_registry_text;
			$details->lopd_text = $lopd_text;
			$details->facebook = $facebook;
			$details->instagram = $instagram;
			$details->twitter = $twitter;
			
			$details->save();

            $logo = $request->file('logo');
            if ($logo) {
                $logoExtension = $logo->getClientOriginalExtension();
				$details->logo = '/file/logo.' . $logoExtension;
				$logo->storeAs('settings/','logo.' . $logoExtension, 'private');
            }

            $invoice_logo = $request->file('invoice_logo');
            if ($invoice_logo) {
                $invoiceLogoExtension = $invoice_logo->getClientOriginalExtension();
                $details->invoice_logo = '/file/invoice_logo.' . $invoiceLogoExtension;
				$invoice_logo->storeAs('settings/','invoice_logo.' . $invoiceLogoExtension, 'private');
            }

            $favicon = $request->file('favicon');
            if ($favicon) {
                $faviconExtension = $favicon->getClientOriginalExtension();
				$details->favicon = '/file/favicon.' . $faviconExtension;
				$favicon->storeAs('settings/','favicon.' . $faviconExtension, 'private');
            }

            $details->save();

            $appNameKey = 'APP_NAME';
            $mailUsernameKey = 'MAIL_USERNAME';
            $appNameValue = '"' . $name . '"';
            $mailUsernameValue = '"' . $email . '"';

            $this->setEnvValue($appNameKey, $appNameValue);
            $this->setEnvValue($mailUsernameKey, $mailUsernameValue);
            $this->setEnvValue('MAIL_FROM_ADDRESS', $mailUsernameValue);

            // limpiar cache de configuración
            Artisan::call('config:clear');
            Artisan::call('cache:clear');

            return response()->json([
                'success' => true,
                'details' => $details,
                'message' => 'Detalles editados con éxito'
            ], 200);

        } catch(\Exception $e) {
                        Log::error('Error: ' . $e->getMessage());

            return response()->json([
                'success' => false,
                'message' => 'Error: ' . $e->getMessage(),
            ], 500);
        }
    }

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
