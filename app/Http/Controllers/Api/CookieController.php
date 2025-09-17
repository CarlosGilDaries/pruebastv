<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Cookie;
use App\Models\Language;
use App\Models\Translation;
use Illuminate\Support\Facades\Log;
use DataTables;
use Illuminate\Support\Facades\DB;

class CookieController extends Controller
{
    public function index()
    {
        try {
        $cookies = cookie::all();

        return response()->json([
            'success' => true,
            'cookies' => $cookies,
            'message' => 'Cookie obtenido con éxito.',
        ], 200);

        } catch (\Exception $e) {
            Log::error('Error: ' . $e->getMessage());

            return response()->json([
                'success' => false,
                'message' => 'Error: ' . $e->getMessage(),
            ], 500);
        }
    }

    public function datatable()
    {
        try {
            $cookies = cookie::all();

			return DataTables::of($cookies)
				->addColumn('id', function($cookie) {
					return $cookie->id;
				})
				->addColumn('title', function($cookie) {
					return $cookie->title;
				})
				->addColumn('actions', function($cookie) {
					return $this->getActionButtons($cookie);
				})
				->rawColumns(['actions'])
				->make(true);

        } catch (\Exception $e) {
            Log::error('Error: ' . $e->getMessage());

            return response()->json([
                'success' => false,
                'message' => 'Error: ' . $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        DB::beginTransaction();

        try {
            $cookie = new cookie();
            $title = $request->input('title');
            $text = $request->input('text');

            $cookie->title = $title;
            $cookie->text = $text;
            $cookie->save();

            $translations = $request->translations ?? [];
            $spanish = Language::where('code','es')->first();
            $spanishId = $spanish->id;

            Translation::updateOrCreate(
                [
                    'language_id' => $spanishId,
                    'key' => "cookie_" . $cookie->id . "_title"
                ],
                ['value' => $title]
            );
            Translation::updateOrCreate(
                [
                    'language_id' => $spanishId,
                    'key' => "cookie_" . $cookie->id . "_text"
                ],
                ['value' => $text]
            );

            foreach ($translations as $languageCode => $translationData) {
                $language = Language::where('code', $languageCode)->first();
                
                if ($language) {
                    foreach (['title', 'text'] as $field) {
                        if (!empty($translationData[$field])) {
                            Translation::updateOrCreate(
                                [
                                    'language_id' => $language->id,
                                    'key' => "cookie_{$cookie->id}_$field",
                                ],
                                ['value' => $translationData[$field]]
                            );
                        }
                    }
                }
            }

            DB::commit();

            return response()->json([
                'success' => true,
                'cookie' => $cookie,
                'message' => 'Cookie creado con éxito'
            ], 200);

        } catch(\Exception $e) {
            Log::error('Error: ' . $e->getMessage());

            DB::rollBack();

            return response()->json([
                'success' => false,
                'message' => 'Error: ' . $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Display the specified resource.
     */
    public function show(string $id)
    {
        try {
            $cookie = cookie::where('id', $id)->first();

            return response()->json([
                'success' => true,
                'cookie' => $cookie,
                'message' => 'Cookie obtenido con éxito.'
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
    public function update(Request $request, string $id)
    {
        DB::beginTransaction();

        try {
            $cookie = cookie::where('id', $id)->first();
            $title = $request->input('title');
            $text = $request->input('text');

            $cookie->title = $title;
            $cookie->text = $text;
            $cookie->save();

            $translations = $request->translations ?? [];
            $spanish = Language::where('code','es')->first();
            $spanishId = $spanish->id;

            Translation::updateOrCreate(
                [
                    'language_id' => $spanishId,
                    'key' => "cookie_" . $cookie->id . "_title"
                ],
                ['value' => $title]
            );
            Translation::updateOrCreate(
                [
                    'language_id' => $spanishId,
                    'key' => "cookie_" . $cookie->id . "_text"
                ],
                ['value' => $text]
            );

            foreach ($translations as $languageCode => $translationData) {
                $language = Language::where('code', $languageCode)->first();
                
                if ($language) {
                    foreach (['title', 'text'] as $field) {
                        if (!empty($translationData[$field])) {
                            Translation::updateOrCreate(
                                [
                                    'language_id' => $language->id,
                                    'key' => "cookie_{$cookie->id}_$field",
                                ],
                                ['value' => $translationData[$field]]
                            );
                        }
                    }
                }
            }

            DB::commit();

            return response()->json([
                'success' => true,
                'cookie' => $cookie,
                'message' => 'Cookie editado con éxito'
            ], 200);

        } catch(\Exception $e) {
            Log::error('Error: ' . $e->getMessage());

            DB::rollBack();

            return response()->json([
                'success' => false,
                'message' => 'Error: ' . $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Request $request)
    {
        try {
            $id = $request->input('content_id');
            $cookie = cookie::where('id', $id)->first();
            $cookie->delete();

            return response()->json([
                'success' => true,
                'message' => 'Cookie eliminado con éxito'
            ], 200);

        } catch(\Exception $e) {
            Log::error('Error al eliminar el Cookie: ' . $e->getMessage());
            
            return response()->json([
                'success' => false,
                'message' => 'Error: ' . $e->getMessage(),
            ], 500);
        }
    }

    private function getActionButtons($cookie)
	{
		$id = $cookie->id;

		return '
			<div class="actions-container">
				<button class="actions-button orders-button">Acciones</button>
				<div class="actions-menu">
					<a href="/admin/edit-cookie.html" class="action-item content-action edit-button" data-id="'.$id.'">Editar</a>
                    <form class="cookie-delete-form" data-id="' . $id . '">
						<input type="hidden" name="content_id" value="' . $id . '">
						<button class="action-item content-action delete-btn" type="submit">Eliminar</button>
					</form>
				</div>
			</div>';
	}
}
