<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Language;
use Illuminate\Http\Request;
use App\Models\Tag;
use App\Models\Translation;
use Illuminate\Support\Facades\Log;
use DataTables;
use Illuminate\Support\Facades\DB;

class TagController extends Controller
{
    public function index()
    {
        try {
            $tags = Tag::all();

            return response()->json([
                'success' => true,
                'tags' => $tags
            ],200);

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
            $tags = Tag::all();

			return DataTables::of($tags)
				->addColumn('id', function($tag) {
					return $tag->id;
				})
				->addColumn('name', function($tag) {
					return $tag->name;
				})
				->addColumn('actions', function($tag) {
					return $this->getActionButtons($tag);
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
            $tag = new Tag();
            $name = sanitize_html($request->input('name'));

            $tag->name = $name;
            $tag->save();

            $translations = $request->translations ?? [];
            $spanish = Language::where('code','es')->first();
            $spanishId = $spanish->id;

            Translation::updateOrCreate(
                [
                    'language_id' => $spanishId,
                    'key' => "tag_" . $tag->id
                ],
                ['value' => $name]
            );

            foreach ($translations as $languageCode => $translationData) {
                $language = Language::where('code', $languageCode)->first();
                
                if ($language) {
                    foreach (['name'] as $name) {
                        if (!empty($translationData[$name])) {
                            Translation::updateOrCreate(
                                [
                                    'language_id' => $language->id,
                                    'key' => "tag_" . $tag->id,
                                ],
                                ['value' => $translationData[$name]]
                            );
                        }
                    }
                }
            }

            DB::commit();

            return response()->json([
                'success' => true,
                'tag' => $tag,
                'message' => 'Etiqueta creada con éxito'
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
            $tag = Tag::with('movies.gender')->where('id', $id)->first();

            return response()->json([
                'success' => true,
                'tag' => $tag,
                'message' => 'Etiqueta obtenida con éxito.'
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
            $tag = Tag::where('id', $id)->first();
            $name = sanitize_html($request->input('name'));

            $tag->name = $name;
            $tag->save();

             $translations = $request->translations ?? [];
            $spanish = Language::where('code','es')->first();
            $spanishId = $spanish->id;

            Translation::updateOrCreate(
                [
                    'language_id' => $spanishId,
                    'key' => "tag_" . $tag->id
                ],
                ['value' => $name]
            );

            foreach ($translations as $languageCode => $translationData) {
                $language = Language::where('code', $languageCode)->first();
                
                if ($language) {
                    foreach (['name'] as $name) {
                        if (!empty($translationData[$name])) {
                            Translation::updateOrCreate(
                                [
                                    'language_id' => $language->id,
                                    'key' => "tag_" . $tag->id,
                                ],
                                ['value' => $translationData[$name]]
                            );
                        }
                    }
                }
            }

            DB::commit();

            return response()->json([
                'success' => true,
                'tag' => $tag,
                'message' => 'Etiqueta editado con éxito'
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
            $tag = Tag::where('id', $id)->first();
            $tag->delete();

            return response()->json([
                'success' => true,
                'message' => 'Género eliminado con éxito'
            ], 200);

        } catch(\Exception $e) {
            Log::error('Error al eliminar el género: ' . $e->getMessage());
            
            return response()->json([
                'success' => false,
                'message' => 'Error: ' . $e->getMessage(),
            ], 500);
        }
    }

    private function getActionButtons($tag)
	{
		$id = $tag->id;

		return '
			<div class="actions-container">
				<button class="actions-button orders-button">Acciones</button>
				<div class="actions-menu">
					<a href="/admin/edit-tag.html" class="action-item content-action edit-button" data-id="'.$id.'">Editar</a>
                    <form class="tag-delete-form" data-id="' . $id . '">
						<input type="hidden" name="content_id" value="' . $id . '">
						<button class="action-item content-action delete-btn" type="submit">Eliminar</button>
					</form>
				</div>
			</div>';
	}
}
