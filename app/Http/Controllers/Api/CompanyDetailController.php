<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\CompanyDetail;
//use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;

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
            $phone_number = sanitize_html($request->input('phone_number'));
			$facebook = sanitize_html($request->input('facebook'));
			$instagram = sanitize_html($request->input('instagram'));
			$twitter = sanitize_html($request->input('twitter'));
			$github = sanitize_html($request->input('github'));

            $details->name = $name;
			$details->fiscal_address = $fiscal_address;
			$details->nif_cif = $nif_cif;
			$details->email = $email;
			$details->phone_number = $phone_number;
			$details->facebook = $facebook;
			$details->instagram = $instagram;
			$details->twitter = $twitter;
			$details->github = $github;
			
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
