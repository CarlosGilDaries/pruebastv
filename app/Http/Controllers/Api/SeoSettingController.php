<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\SeoSetting;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

class SeoSettingController extends Controller
{
    public function genericPageShow($key)
    {
        try {
            $settings = SeoSetting::where('key', $key)->first();

            return response()->json([
                'success' => true,
                'settings' => $settings
            ], 200);

        } catch (\Exception $e) {
            Log::error('Error en genericPageShow SeoSettingController: ' . $e->getMessage());

			return response()->json([
				'success' => false,
				'message' => 'Error en genericPageShow SeoSettingController: ' . $e->getMessage(),
			], 500);
        }
    }
}
