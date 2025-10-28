<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\EmailTemplate;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

class EmailTemplateController extends Controller
{
    public function index()
    {
        try {
            $templates = EmailTemplate::all();

            return response()->json([
                'success' => true,
                'templates' => $templates
            ], 200);

        } catch(\Exception $e) {
            Log::error('Error en index EmailTemplateController: ' . $e->getMessage());

            return response()->json([
                'success' => false,
                'message' => 'Error en index EmailTemplateController: ' . $e->getMessage(),
            ], 500);
        }
    }

    public function update(Request $request)
    {
        try {
            $requestData = $request->all();
            
            $emailPrefixes = [
                'verify_email', 'reset_password', 'free_one_day_left', 'free_two_days_left',
                'expired_plan', 'free_first_warning', 'plan_one_day_left', 'plan_seven_days_left'
            ];

            $templateFields = [
                'subject', 'body_spanish', 'body_english', 'button_text_spanish', 'button_text_english'
            ];

            $updates = [];

            foreach ($emailPrefixes as $prefix) {
                $templateData = [];
                
                foreach ($templateFields as $field) {
                    $fieldName = "{$prefix}_{$field}";
                    if (array_key_exists($fieldName, $requestData)) {
                        $templateData[$field] = $requestData[$fieldName];
                    }
                }
                
                if (!empty($templateData)) {
                    $updates[] = [
                        'key' => $prefix,
                        'data' => $templateData
                    ];
                }
            }

            // Actualizar usando una sola consulta por plantilla
            foreach ($updates as $update) {
                EmailTemplate::where('key', $update['key'])->update($update['data']);
            }

            return response()->json([
                'success' => true,
                'message' => 'Todas las plantillas actualizadas con éxito.'
            ], 200);

        } catch(\Exception $e) {
            Log::error('Error en updateAll EmailTemplateController: ' . $e->getMessage());

            return response()->json([
                'success' => false,
                'message' => 'Error al actualizar las plantillas: ' . $e->getMessage(),
            ], 500);
        }
    }
}
