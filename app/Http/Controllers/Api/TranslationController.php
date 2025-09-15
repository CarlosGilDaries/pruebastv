<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Language;
use App\Models\Translation;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

class TranslationController extends Controller
{
    public function index($locale)
    {
        try {
            $language = Language::where('code', $locale)->firstOrFail();
        
            $translations = Translation::where('language_id', $language->id)
                ->get()
                ->map(function ($items) {
                    return $items->pluck('value', 'key');
                });
                
            return response()->json([
                'success' => true,
                'translations' => $translations
            ], 200);

        } catch (\Exception $e) {
            Log::error('Error en index translations: ' . $e->getMessage());

            return response()->json([
                'success' => false,
                'message' => 'Error: ' . $e->getMessage(),
            ], 500);
        }
    }

    public function update(Request $request, $locale)
    {
        try {
            $language = Language::where('code', $locale)->firstOrFail();
        
            $translation = Translation::updateOrCreate(
                [
                    'language_id' => $language->id,
                    'key' => $request->key
                ],
                ['value' => $request->value]
            );

            return response()->json([
                'success' => true,
                'translation' => $translation
            ], 200);
        } catch (\Exception $e) {
            Log::error('Error en update translations: ' . $e->getMessage());

            return response()->json([
                'success' => false,
                'message' => 'Error: ' . $e->getMessage(),
            ], 500);
        }
    }
}
