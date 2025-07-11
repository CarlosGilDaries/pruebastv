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
            $favicon = sanitize_html($request->input('favicon'));
            $logo = sanitize_html($request->input('logo'));
			$facebook = sanitize_html($request->input('facebook'));
			$instagram = sanitize_html($request->input('instagram'));
			$twitter = sanitize_html($request->input('twitter'));

            $details->name = $name;
			$details->fiscal_address = $fiscal_address;
			$details->nif_cif = $nif_cif;
			$details->email = $email;
            $details->commercial_registry_text = $commercial_registry_text;
			$details->lopd_text = $lopd_text;
            $details->logo = $logo;
            $details->favicon = $favicon;
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

            $favicon = $request->file('favicon');
            if ($favicon) {
                $faviconExtension = $favicon->getClientOriginalExtension();
				$details->favicon = '/file/favicon.' . $faviconExtension;
				$favicon->storeAs('settings/','favicon.' . $faviconExtension, 'private');
            }

            $details->save();

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
}
