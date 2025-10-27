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

    public function update(Request $request, $id)
    {
        try {
            $template = EmailTemplate::where('id', $id)->first();
            $template->update($request->all());

            return response()->json([
                'success' => true,
                'message' => 'Plantilla actualizada con éxito.'
            ], 200);

        } catch(\Exception $e) {
            Log::error('Error en update EmailTemplateController: ' . $e->getMessage());

            return response()->json([
                'success' => false,
                'message' => 'Error en update EmailTemplateController: ' . $e->getMessage(),
            ], 500);
        }
    }
}
