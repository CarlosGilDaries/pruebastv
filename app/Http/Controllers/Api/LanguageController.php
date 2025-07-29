<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Language;
use App\Models\Translation;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use DataTables;

class LanguageController extends Controller
{
    public function index()
    {
        try {
            $languages = Language::with('translations')
                ->where('is_active', 1)->get();

            return response()->json([
                'success' => true,
                'languages' => $languages
            ], 200);

        } catch (\Exception $e) {
            Log::error('Error en index de LanguageController: ' . $e->getMessage());

            return response()->json([
                'success' => false,
                'message' => 'Error en index de LanguageController: ' . $e->getMessage(),
            ], 500);
        }
    }

    public function show($code)
    {
        try {
            $language = Language::with('translations')
                ->where('code', $code)->first();

            return response()->json([
                'success' => true,
                'language' => $language
            ], 200);

        } catch (\Exception $e) {
            Log::error('Error en show Language: ' . $e->getMessage());

            return response()->json([
                'success' => false,
                'message' => 'Error: ' . $e->getMessage(),
            ], 500);    
        }
    }

    public function datatable()
    {
        try {
            $languages = Language::all();
        
            return DataTables::of($languages)
                    ->addColumn('id', function($language) {
                        return $language->id;
                    })
                    ->addColumn('code', function($language) {
                        return $language->code;
                    })
                    ->addColumn('name', function($language) {
                        return $language->name;
                    })
                    ->addColumn('is_active', function($language) {
                        return $language->is_active;
                    })
                    ->addColumn('actions', function($language) {
                        return $this->getActionButtons($language);
                    })
                    ->rawColumns(['actions'])
                    ->make(true);

        } catch (\Exception $e) {
            Log::error('Error en datatable Language: ' . $e->getMessage());

            return response()->json([
                'success' => false,
                'message' => 'Error: ' . $e->getMessage(),
            ], 500);
        }
    }

    public function store(Request $request)
    {
        try {
            $language = new Language();

            $language->code = sanitize_html($request->code);
            $language->name = sanitize_html($request->name);
            $language->is_active = sanitize_html($request->is_active);

            $language->save();

            // Iterar dinámicamente sobre las traducciones recibidas
            foreach ($request->translations as $key => $value) {
                Translation::updateOrCreate(
                    [
                        'language_id' => $language->id,
                        'key' => $key
                    ],
                    [
                        'value' => $value
                    ]
                );
            }

            return response()->json([
                'success' => true,
                'message' => 'Idioma ' . $language->name . ' creado con éxito.'
            ], 200);
        } catch (\Exception $e) {
            Log::error('Error en store Language: ' . $e->getMessage());

            return response()->json([
                'success' => false,
                'message' => 'Error: ' . $e->getMessage(),
            ], 500);
        }
    }

    public function update(Request $request, string $code)
    {
        try {
            $language = Language::where('code', $code)->firstOrFail();

            $language->code = sanitize_html($request->code);
            $language->name = sanitize_html($request->name);
            $language->is_active = sanitize_html($request->is_active);
            $language->save();

            // Iterar dinámicamente sobre las traducciones recibidas
            foreach ($request->translations as $key => $value) {
                Translation::updateOrCreate(
                    [
                        'language_id' => $language->id,
                        'key' => $key
                    ],
                    [
                        'value' => $value
                    ]
                );
            }

            return response()->json([
                'success' => true,
                'message' => 'Idioma ' . $language->name . ' editado con éxito.'
            ], 200);
        } catch (\Exception $e) {
            Log::error('Error en update Language: ' . $e->getMessage());

            return response()->json([
                'success' => false,
                'message' => 'Error: ' . $e->getMessage(),
            ], 500);
        }
    }


    public function destroy(Request $request)
    {
        try {
            $id = $request->input('content_id');
            $language = Language::where('id', $id)->first();
            $translations = Translation::where('language_id', $id)->get();
            foreach ($translations as $translation) {
                $translation->delete();
            }
            $language->delete();


            return response()->json([
                'success' => true,
                'message' => 'Idioma eliminado con éxito'
            ], 200);

        } catch(\Exception $e) {
            Log::error('Error al eliminar el idioma: ' . $e->getMessage());
            
            return response()->json([
                'success' => false,
                'message' => 'Error: ' . $e->getMessage(),
            ], 500);
        }
    }

    private function getActionButtons($language)
	{
        $code = $language->code;
		$id = $language->id;

		return '
			<div class="actions-container">
				<button class="actions-button orders-button">Acciones</button>
				<div class="actions-menu">
					<a href="/admin/edit-language.html" class="action-item content-action edit-button" data-id="'.$code.'">Editar</a>
                    <form class="language-delete-form" data-id="' . $id . '">
						<input type="hidden" name="content_id" value="' . $id . '">
						<button class="action-item content-action delete-btn" type="submit">Eliminar</button>
					</form>
				</div>
			</div>';
	}
}
