<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Gender;
use App\Models\Language;
use App\Models\Translation;
//use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;
use DataTables;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;

class GenderController extends Controller
{
    public function index()
    {
        try {
        $genders = Gender::with('movies.series', 'seoSetting')->get();

        return response()->json([
            'success' => true,
            'genders' => $genders,
            'message' => 'Planes obtenidos con éxito.',
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
            $genders = Gender::all();

			return DataTables::of($genders)
				->addColumn('id', function($gender) {
					return $gender->id;
				})
				->addColumn('name', function($gender) {
					return $gender->name;
				})
                ->addColumn('cover', function($gender) {
					return $gender->cover;
				})
				->addColumn('actions', function($gender) {
					return $this->getActionButtons($gender);
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
            $gender = new Gender();
            $name = sanitize_html($request->input('name'));

            $gender->name = $name;
            $gender->save();

            $cover = $request->file('cover');
            $coverExtension = $cover->getClientOriginalExtension();
            $gender->cover = '/file/gender-' . $gender->id. '/' . $gender->id . '-img.' . $coverExtension;
            $cover->storeAs('genders/gender-' . $gender->id, $gender->id . '-img.' . $coverExtension, 'private');

            $gender->save();

            $translations = $request->translations ?? [];
            $spanish = Language::where('code','es')->first();
            $spanishId = $spanish->id;

            Translation::updateOrCreate(
                [
                    'language_id' => $spanishId,
                    'key' => "gender_" . $gender->id
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
                                    'key' => "gender_" . $gender->id,
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
                'gender' => $gender,
                'message' => 'Género creado con éxito'
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
            $gender = Gender::with([
                'seoSetting', 
                'movies.series' => function($query) {
                    $query->orderBy('season_number', 'asc')
                        ->orderBy('episode_number', 'asc');
                },  
                'movies.genders', 
                'movies.seoSetting', 
                'scripts'
                ])->where('id', $id)->first();

            $gender->movies->each(function ($movie) {
                $movie->series_by_season = $movie->series->groupBy('season_number')->values();
            });

            return response()->json([
                'success' => true,
                'gender' => $gender,
                'message' => 'Género obtenido con éxito.'
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
            $gender = Gender::where('id', $id)->with('scripts')->first();
            $name = sanitize_html($request->input('name'));

            $gender->name = $name;
            $cover = $request->file('cover');
            if ($cover) {
                $coverExtension = $cover->getClientOriginalExtension();
                $gender->cover = '/file/gender-' . $gender->id. '/' . $gender->id . '-img.' . $coverExtension;
                $cover->storeAs('genders/gender-' . $gender->id, $gender->id . '-img.' . $coverExtension, 'private');
            }
            $gender->save();

            $translations = $request->translations ?? [];
            $spanish = Language::where('code','es')->first();
            $spanishId = $spanish->id;

            Translation::updateOrCreate(
                [
                    'language_id' => $spanishId,
                    'key' => "gender_" . $gender->id
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
                                    'key' => "gender_" . $gender->id,
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
                'gender' => $gender,
                'message' => 'Género editado con éxito'
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
            $gender = Gender::where('id', $id)->first();
            $directory = ("genders/gender-{$gender->id}");
			Storage::disk('private')->deleteDirectory($directory, true);
            $gender->delete();

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

    private function getActionButtons($gender)
	{
		$id = $gender->id;

		return '
			<div class="actions-container">
				<button class="actions-button orders-button">Acciones</button>
				<div class="actions-menu">
					<a href="/admin/edit-gender.html" class="action-item content-action edit-button" data-id="'.$id.'">Editar</a>
                    <form class="gender-delete-form" data-id="' . $id . '">
						<input type="hidden" name="content_id" value="' . $id . '">
						<button class="action-item content-action delete-btn" type="submit">Eliminar</button>
					</form>
				</div>
			</div>';
	}
}
