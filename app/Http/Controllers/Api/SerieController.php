<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Language;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use App\Models\Movie;
use App\Models\Plan;
use App\Models\SeoSetting;
use App\Models\Serie;
use App\Models\Translation;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Carbon;
use DataTables;

class SerieController extends Controller
{
    public function seriesDatatable()
    {
        try {
            $series = Movie::with('genders')
                ->where('serie', 1)
                ->get();
            
            return DataTables::of($series)
                ->addColumn('id', function($serie) {
                    return $serie->id;
                })
				->addColumn('title', function($serie) {
					return $serie->title;
				})
				->addColumn('cover', function($serie) {
					return $serie->cover;
				})
				->addColumn('gender', function($serie) {
					return $serie->genders->pluck('name')->implode(', ');
				})
				->addColumn('type', function($serie) {
					return $serie->type;
				})
				->addColumn('pay_per_view', function($serie) {
					return $serie->pay_per_view;
				})
                ->addColumn('rent', function($serie) {
					return $serie->rent;
				})
                ->addColumn('created_at', function($serie) {
					return Carbon::parse($serie->created_at)->format('d-m-Y');
				})
                ->addColumn('actions', function($serie) {
					return $this->getSerieActionButtons($serie);
				})
				->rawColumns(['actions'])
				->make(true);

        } catch (\Exception $e) {
            Log::error('Error en SerieDatatable: ' . $e->getMessage());

            return response()->json([
                'success' => false,
                'message' => 'Error en SerieDatatable: ' . $e->getMessage(),
            ], 500);
        }
    }

    public function episodesDatatable($serieId)
    {
        try {
            $episodes = Serie::where('movie_id', $serieId)
                ->orderBy('season_number', 'asc')
                ->orderBy('episode_number', 'asc')
                ->get();

			return DataTables::of($episodes)
                ->addColumn('id', function($episode) {
                    return $episode->id;
                })
				->addColumn('title', function($episode) {
					return $episode->title;
				})
				->addColumn('cover', function($episode) {
					return $episode->image_url;
				})
                ->addColumn('season_number', function($episode) {
					return $episode->season_number;
				})
                ->addColumn('episode_number', function($episode) {
					return $episode->episode_number;
				})
                ->addColumn('created_at', function($episode) {
					return Carbon::parse($episode->created_at)->format('d-m-Y');
				})
				->addColumn('actions', function($episode) {
					return $this->getepisodeActionButtons($episode);
				})
				->rawColumns(['actions'])
				->make(true);

        } catch (\Exception $e) {
            Log::error('Error en episodeDatatable: ' . $e->getMessage());

            return response()->json([
                'success' => false,
                'message' => 'Error en episodeDatatable: ' . $e->getMessage(),
            ], 500);
        }
    }

    public function index()
    {
        try {
            $series = Movie::where('serie', 1)
                ->with(['seoSetting', 'categories', 'genders'])
                ->get();
            
            return response()->json([
                'success' => true,
                'series' => $series
            ], 200);

        } catch(\Exception $e) {
            Log::error('Error en index SerieController: ' . $e->getMessage());

			return response()->json([
				'success' => false,
				'message' => 'Error en index SerieController: ' . $e->getMessage(),
			], 500);
        }
    }

    public function show($slug)
    {
        try {
            $serie = Movie::where('slug', $slug)
                ->with('seoSetting', 'genders.seoSetting', 'tags.seoSetting', 'scripts')
                ->first();
            $episodes = Serie::with('seoSetting')
                ->where('movie_id', $serie->id)
                ->orderBy('season_number', 'asc')
                ->orderBy('episode_number', 'asc')
                ->get()
                ->groupBy('season_number');
            $no_seasons = $episodes->has(0);
            
            return response()->json([
                'success' => true,
                'serie' => $serie,
                'no_seasons' => $no_seasons,
                'episodes' => $episodes
            ], 200);

        } catch(\Exception $e) {
            Log::error('Error en show SerieController: ' . $e->getMessage());

			return response()->json([
				'success' => false,
				'message' => 'Error en show SerieController: ' . $e->getMessage(),
			], 500);
        }
    }

    public function showEdit($id)
    {
        try {
            $serie = Movie::where('id', $id)
                ->with('seoSetting', 'genders', 'tags', 'scripts', 'plans', 'categories')
                ->first();
            
            return response()->json([
                'success' => true,
                'serie' => $serie
            ], 200);

        } catch(\Exception $e) {
            Log::error('Error en show SerieController: ' . $e->getMessage());

			return response()->json([
				'success' => false,
				'message' => 'Error en show SerieController: ' . $e->getMessage(),
			], 500);
        }
    }

    public function episodeEditShow($id)
    {
        try {
            $episode = Serie::where('id', $id)
                ->with('scripts', 'seoSetting', 'movie.scripts', 'movie.seoSetting')
                ->first();

            return response()->json([
                'success' => true,
                'episode' => $episode
            ], 200);
        } catch(\Exception $e) {
            Log::error('Error en episodeEditShow SerieController: ' . $e->getMessage());

			return response()->json([
				'success' => false,
				'message' => 'Error en episodeEditShow SerieController: ' . $e->getMessage(),
			], 500);
        }
    }

    public function serieStore(Request $request)
    {
        DB::beginTransaction();

        try {
            $title = sanitize_html($request->input('title'));
            $overview = sanitize_html($request->input('overview'));
            $tagline = sanitize_html($request->input('tagline'));
            $ppv_price = sanitize_html($request->input('pay_per_view_price'));
            $rent_price = sanitize_html($request->input('rent_price'));
            $rent_days = sanitize_html($request->input('rent_days'));
            $start_time = sanitize_html($request->input('start_time'));
            $end_time = sanitize_html($request->input('end_time'));
            $duration = sanitize_html($request->input('duration'));

            $movie = new Movie();
            $movie->title = $title;
            $movie->type = $request->input('type');
            $movie->overview = $overview;
            $movie->tagline = $tagline;
            $movie->pay_per_view = $request->input('pay_per_view');
            $movie->rent = $request->input('rent');
            $movie->serie = 1;

            if ($ppv_price) {
                $movie->pay_per_view_price = $ppv_price;
            }

            if ($rent_price) {
                $movie->rent_price = $rent_price;
                $movie->rent_days = $rent_days;
            }

            if ($start_time) {
                $movie->start_time = $start_time;
            }

            if ($end_time) {
                $movie->end_time = $end_time;
            }

            if ($duration) {
                $movie->duration = $duration;
            }

            //Para que se puedan generar series con el mismo título pero cada una tenga un slug único
            $slug = Str::slug($title, '-');
            $counter = 1;
            while (Movie::where('slug', $slug)->exists()) {
                $slug = Str::slug($title, '-') . '-remake-' . $counter;
                $counter++;
            }
            $movie->slug = $slug;

			$movie->cover = "temp";
			$movie->tall_cover = "temp";
			$movie->save();

            $cover = $request->file('cover');
            $coverExtension = $cover->getClientOriginalExtension();
            $movie->cover = '/file/content-' . $movie->id. '/' . $movie->id . '-img.' . $coverExtension;
            $cover->storeAs('content/content-' . $movie->id, $movie->id . '-img.' . $coverExtension, 'private');

			$tall_cover = $request->file('tall_cover');
            $tallCoverExtension = $tall_cover->getClientOriginalExtension();
            $movie->tall_cover = '/file/content-' . $movie->id. '/' . $movie->id . '-tall-img.' . $tallCoverExtension;
            $tall_cover->storeAs('content/content-' . $movie->id, $movie->id . '-tall-img.' . $tallCoverExtension, 'private');

            $trailer = $request->file('trailer');

            if ($trailer) {
                $trailerExtension = $trailer->getClientOriginalExtension();
                $movie->trailer = '/file/content-' . $movie->id . '/' . $movie->id . '-trailer.' . $trailerExtension;
                $trailer->storeAs('content/content-' . $movie->id, $movie->id . '-trailer.' . $trailerExtension, 'private');
            }

			$movie->save();

            $translations = $request->translations ?? [];
            $spanish = Language::where('code','es')->first();
            $spanishId = $spanish->id;

            Translation::updateOrCreate(
                [
                    'language_id' => $spanishId,
                    'key' => "content_{$movie->id}_title"
                ],
                ['value' => $title]
            );

            Translation::updateOrCreate(
                [
                    'language_id' => $spanishId,
                    'key' => "content_{$movie->id}_tagline"
                ],
                ['value' => $tagline]
            );

            Translation::updateOrCreate(
                [
                    'language_id' => $spanishId,
                    'key' => "content_{$movie->id}_overview"
                ],
                ['value' => $overview]
            );

            foreach ($translations as $languageCode => $translationData) {
                $language = Language::where('code', $languageCode)->first();
                
                if ($language) {
                    foreach (['title', 'tagline', 'overview'] as $field) {
                        if (!empty($translationData[$field])) {
                            Translation::updateOrCreate(
                                [
                                    'language_id' => $language->id,
                                    'key' => "content_{$movie->id}_{$field}"
                                ],
                                ['value' => $translationData[$field]]
                            );
                        }
                    }
                }
            }

			
			$adminPlan = Plan::where('name', 'admin')->first();
			DB::table('movie_plan')->insert([
				'movie_id' => $movie->id,
				'plan_id' => $adminPlan->id,
				'created_at' => now(),
				'updated_at' => now(),
			]);
			
			$plans = $request->input('plans');
            $movie->categories()->sync($request->input('categories'));
            $movie->tags()->sync($request->input('tags'));
            $movie->genders()->sync($request->input('genders'));

			foreach($plans as $plan) {
				DB::table('movie_plan')->insert([
					'movie_id' => $movie->id,
					'plan_id' => $plan,
					'created_at' => now(),
					'updated_at' => now(),
				]);
			}

            DB::commit();

			return response()->json([
				'success' => true,
				'serie' => $movie,
				'message' => $title . ' subida correctamente'
			], 201);

		} catch (\Exception $e) {
            DB::rollBack();

			Log::error('Error al crear serie: ' . $e->getMessage());

			return response()->json([
				'success' => false,
				'message' => 'Error al crear serie: ' . $e->getMessage(),
			], 500);
		}
    }

    public function serieUpdate(Request $request, $id)
    {

        DB::beginTransaction();

        try {
            $movie = Movie::where('id', $id)->with('scripts')->first();
            $title = sanitize_html($request->input('title'));
            $overview = sanitize_html($request->input('overview'));
            $tagline = sanitize_html($request->input('tagline'));
            $price = sanitize_html($request->input('pay_per_view_price'));
            $rent_price = sanitize_html($request->input('rent_price'));
            $rent_days = sanitize_html($request->input('rent_days'));
            $start_time = sanitize_html($request->input('start_time'));
            $end_time = sanitize_html($request->input('end_time'));
            $duration = sanitize_html($request->input('duration'));

            // El slug sólo cambia si ha cambiado el título
            if ($movie->title !== $title) {
                $slug = Str::slug($title, '-');
                $counter = 1;
                while (Movie::where('slug', $slug)->exists()) {
                    $slug = Str::slug($title, '-') . '-remake-' . $counter;
                    $counter++;
                }
                $movie->slug = $slug;
            }

            $movie->title = $title;
            $movie->overview = $overview;
            $movie->tagline = $tagline;
            $movie->rent = $request->input('rent');

            if ($price) {
                $movie->pay_per_view_price = $price;
            }

            if ($rent_price) {
                $movie->rent_price = $rent_price;
                $movie->rent_days = $rent_days;
            }

            if ($start_time) {
                $movie->start_time = $start_time;
            }

            if ($end_time) {
                $movie->end_time = $end_time;
            }

            if ($duration) {
                $movie->duration = $duration;
            }

            $cover = $request->file('cover');
            if ($cover) {
                $coverExtension = $cover->getClientOriginalExtension();
				$movie->cover = '/file/content-' . $movie->id. '/' . $movie->id . '-img.' . $coverExtension;
				$cover->storeAs('content/content-' . $movie->id, $movie->id . '-img.' . $coverExtension, 'private');
            }

			$tall_cover = $request->file('tall_cover');
            if ($tall_cover) {
                $tallCoverExtension = $tall_cover->getClientOriginalExtension();
				$movie->tall_cover = '/file/content-' . $movie->id. '/' . $movie->id . '-tall-img.' . $tallCoverExtension;
				$tall_cover->storeAs('content/content-' . $movie->id, $movie->id . '-tall-img.' . $tallCoverExtension, 'private');
            }

            $trailer = $request->file('trailer');
            if ($trailer) {
                $trailerExtension = $trailer->getClientOriginalExtension();
                $movie->trailer = '/file/content-' . $movie->id . '/' . $movie->id . '-trailer.' . $trailerExtension;
                $trailer->storeAs('content/content-' . $movie->id, $movie->id . '-trailer.' . $trailerExtension, 'private');
            }

            $movie->save();

            $movie->plans()->sync($request->input('plans'));
            $movie->categories()->sync($request->input('categories'));
            $movie->tags()->sync($request->input('tags'));
            $movie->genders()->sync($request->input('genders'));
			
			$adminPlan = Plan::where('name', 'admin')->first();
			DB::table('movie_plan')->insert([
				'movie_id' => $movie->id,
				'plan_id' => $adminPlan->id,
				'created_at' => now(),
				'updated_at' => now(),
			]);

            $translations = $request->translations ?? [];
            $spanish = Language::where('code','es')->first();
            $spanishId = $spanish->id;

            Translation::updateOrCreate(
                [
                    'language_id' => $spanishId,
                    'key' => "content_{$movie->id}_title"
                ],
                ['value' => $title]
            );

            Translation::updateOrCreate(
                [
                    'language_id' => $spanishId,
                    'key' => "content_{$movie->id}_tagline"
                ],
                ['value' => $tagline]
            );

            Translation::updateOrCreate(
                [
                    'language_id' => $spanishId,
                    'key' => "content_{$movie->id}_overview"
                ],
                ['value' => $overview]
            );

            foreach ($translations as $languageCode => $translationData) {
                $language = Language::where('code', $languageCode)->first();
                
                if ($language) {
                    foreach (['title', 'tagline', 'overview'] as $field) {
                        if (!empty($translationData[$field])) {
                            Translation::updateOrCreate(
                                [
                                    'language_id' => $language->id,
                                    'key' => "content_{$movie->id}_{$field}"
                                ],
                                ['value' => $translationData[$field]]
                            );
                        }
                    }
                }
            }
			
			$movie->save();

            DB::commit();

            return response()->json([
                'success' => true,
                'movie' => $movie,
                'new_slug' => $movie->slug,
                'message' => 'Serie editada con éxito.'
            ], 200);
            
        } catch (\Exception $e) {
            DB::rollBack();

            Log::error('Error en serieUpdate: ' . $e->getMessage());
            
            return response()->json([
                'success' => false,
                'message' => 'Error en serieUpdate: ' . $e->getMessage(),
            ], 500);
        }
    }

    public function episodeStore(Request $request, $serieId)
    {
        DB::beginTransaction();

        try {
            $episode = new Serie();
            $serie = Movie::where('id', $serieId)->first();
            $episode->title = sanitize_html($request->title);
            $episode->movie_id = $serieId;
            $episode->type = $serie->type;
            $episode->season_number = sanitize_html($request->season_number);
            //$episode->episode_number = sanitize_html($request->episode_number);
            $external_url = sanitize_html($request->input('external_url'));

            $newEpisodeNumber = $request->episode_number;
            
            // Si el número de capítulo para esa temporada ya existe, desplazar los capítulos existentes
            if (Serie::where('movie_id', $serieId)
                ->where('season_number', $request->season_number)
                ->where('episode_number', $newEpisodeNumber)->exists()) {

                    Serie::where('movie_id', $serieId)
                        ->where('season_number', $request->season_number)
                        ->where('episode_number', '>=', $newEpisodeNumber)
                        ->increment('episode_number');
            }
            $episode->episode_number = $newEpisodeNumber;

            //Para que se puedan generar series con el mismo título pero cada una tenga un slug único
            $slug = Str::slug($episode->title, '-');
            $counter = 1;
            while (Movie::where('slug', $slug)->exists()) {
                $slug = Str::slug($episode->title, '-') . '-remake-' . $counter;
                $counter++;
            }
            $episode->slug = $slug;

            $episode->url = 'temp';

            $episode->save();

            $cover = $request->file('cover');
            if ($cover != null) {
                $coverExtension = $cover->getClientOriginalExtension();
                $episode->image_url = '/file/content-' . $serie->id. '/' . $episode->id . '-img.' . $coverExtension;
                $cover->storeAs('content/content-' . $serie->id, $episode->id . '-img.' . $coverExtension, 'private');
            }

            if (($request->file('content') != null) || $request->file('m3u8') != null || $request->file('external_url') != null) {
                if ($serie->type != "url_mp4" && $serie->type != "url_hls" && $serie->type != 'url_mp3' && $serie->type != 'stream') {
                    if ($serie->type != 'application/vnd.apple.mpegurl') {
                        $content = $request->file('content');
                        $contentExtension = $content->getClientOriginalExtension();
                        $episode->url = '/file/content-' . $serie->id . '/' . $episode->id . '.' . $contentExtension;
                        $content->storeAs('content/content-' . $serie->id, $episode->id . '.' . $contentExtension, 'private');
                    } else {
                        $content = $request->file('m3u8');
                        //$mime = $content->getMimeType();
                        //dd($mime);
                        $contentExtension = $content->getClientOriginalExtension();
                        $episode->url = '/file/content-' . $serie->id . '/' . $episode->id . '.' . $contentExtension;
                        $content->storeAs('content/content-' . $serie->id, $episode->id . '.' . $contentExtension, 'private');
                    }

                    $zips = ['ts1', 'ts2', 'ts3'];
                    $extractPath = storage_path('app/private/content/content-' . $serie->id);

                    if (!file_exists($extractPath)) {
                        mkdir($extractPath, 0777, true);
                    }

                    foreach ($zips as $zipKey) {
                        $zipFile = $request->file($zipKey);
                        if ($zipFile) {
                            $zip = new \ZipArchive;
                            if ($zip->open($zipFile->getRealPath()) === true) {
                                $zip->extractTo($extractPath);
                                $zip->close();
                            }
                        }
                    }
                } else {
                    $episode->url = $external_url;
                }
            }
            
			$episode->save();

            $translations = $request->translations ?? [];
            $spanish = Language::where('code','es')->first();
            $spanishId = $spanish->id;

            Translation::updateOrCreate(
                [
                    'language_id' => $spanishId,
                    'key' => "episode_{$episode->id}_title"
                ],
                ['value' => $episode->title]
            );

            foreach ($translations as $languageCode => $translationData) {
                $language = Language::where('code', $languageCode)->first();
                
                if ($language) {
                    foreach (['title'] as $field) {
                        if (!empty($translationData[$field])) {
                            Translation::updateOrCreate(
                                [
                                    'language_id' => $language->id,
                                    'key' => "episode_{$episode->id}_{$field}"
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
                'episode' => $episode
            ], 200);

        } catch(\Exception $e) {
            DB::rollBack();

            Log::error('Error en episodeStore SerieController: ' . $e->getMessage());

			return response()->json([
				'success' => false,
				'message' => 'Error en episodeStore SerieController: ' . $e->getMessage(),
			], 500);
        }
    }

    public function episodeUpdate(Request $request, $serieId, $episodeId)
    {
        DB::beginTransaction();

        try {
            $episode = Serie::where('id', $episodeId)
                ->with('scripts', 'seoSetting')
                ->first();
            $serie = Movie::where('id', $serieId)->first();
            $episode->movie_id = $serieId;
            $episode->season_number = sanitize_html($request->season_number);
            $external_url = sanitize_html($request->input('external_url'));

            $currentEpisodeNumber = $episode->episode_number;
            $newEpisodeNumber = $request->episode_number;

            if ($currentEpisodeNumber != $newEpisodeNumber) {
                if ($newEpisodeNumber < $currentEpisodeNumber) {
                    Serie::where('movie_id', $serieId)
                        ->where('season_number', $request->season_number)
                        ->where('episode_number', '>=', $newEpisodeNumber)
                        ->where('episode_number', '<', $currentEpisodeNumber)
                        ->increment('episode_number');
                } else {
                    Serie::where('movie_id', $serieId)
                        ->where('season_number', $request->season_number)
                        ->where('episode_number', '<=', $newEpisodeNumber)
                        ->decrement('episode_number');
                }
            }

            $episode->episode_number = $newEpisodeNumber;

            $episode->url = 'temp';

            // El slug sólo cambia si ha cambiado el título
            if ($episode->title !== sanitize_html($request->input('title'))) {
                $slug = Str::slug(sanitize_html($request->input('title')), '-');
                $counter = 1;
                while (Movie::where('slug', $slug)->exists()) {
                    $slug = Str::slug(sanitize_html($request->input('title')), '-') . '-remake-' . $counter;
                    $counter++;
                }
                $episode->slug = $slug;
            }
            $episode->title = sanitize_html($request->input('title'));

            $episode->save();

            $cover = $request->file('cover');
            if ($request->hasFile('cover')) {
                $coverExtension = $cover->getClientOriginalExtension();
                $episode->image_url = '/file/content-' . $serie->id. '/' . $episode->id . '-img.' . $coverExtension;
                $cover->storeAs('content/content-' . $serie->id, $episode->id . '-img.' . $coverExtension, 'private');
            }
            

            if ($request->hasFile('content') || $request->hasFile('m3u8') || $request->external_url != null) {
                if ($serie->type != "url_mp4" && $serie->type != "url_hls" && $serie->type != 'url_mp3' && $serie->type != 'stream') {
                    if ($serie->type != 'application/vnd.apple.mpegurl') {
                        $content = $request->file('content');
                        $contentExtension = $content->getClientOriginalExtension();
                        $episode->url = '/file/content-' . $serie->id . '/' . $episode->id . '.' . $contentExtension;
                        $content->storeAs('content/content-' . $serie->id, $episode->id . '.' . $contentExtension, 'private');
                    } else {
                        $content = $request->file('m3u8');
                        //$mime = $content->getMimeType();
                        //dd($mime);
                        $contentExtension = $content->getClientOriginalExtension();
                        $episode->url = '/file/content-' . $serie->id . '/' . $episode->id . '.' . $contentExtension;
                        $content->storeAs('content/content-' . $serie->id, $episode->id . '.' . $contentExtension, 'private');
                    }

                    $zips = ['ts1', 'ts2', 'ts3'];
                    $extractPath = storage_path('app/private/content/content-' . $serie->id);

                    if (!file_exists($extractPath)) {
                        mkdir($extractPath, 0777, true);
                    }

                    foreach ($zips as $zipKey) {
                        $zipFile = $request->file($zipKey);
                        if ($zipFile) {
                            $zip = new \ZipArchive;
                            if ($zip->open($zipFile->getRealPath()) === true) {
                                $zip->extractTo($extractPath);
                                $zip->close();
                            }
                        }
                    }
                } else {
                    $episode->url = $external_url;
                }
            }
			
			$episode->save();

            $translations = $request->translations ?? [];
            $spanish = Language::where('code','es')->first();
            $spanishId = $spanish->id;

            Translation::updateOrCreate(
                [
                    'language_id' => $spanishId,
                    'key' => "episode_{$episode->id}_title"
                ],
                ['value' => $episode->title]
            );

            foreach ($translations as $languageCode => $translationData) {
                $language = Language::where('code', $languageCode)->first();
                
                if ($language) {
                    foreach (['title'] as $field) {
                        if (!empty($translationData[$field])) {
                            Translation::updateOrCreate(
                                [
                                    'language_id' => $language->id,
                                    'key' => "episode_{$episode->id}_{$field}"
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
                'episode' => $episode
            ], 200);

        } catch(\Exception $e) {
            DB::rollBack();

            Log::error('Error en episodeUpdate SerieController: ' . $e->getMessage());

			return response()->json([
				'success' => false,
				'message' => 'Error en episodeUpdate SerieController: ' . $e->getMessage(),
			], 500);
        }
    }

    public function destroy(Request $request)
	{
		try {
			$id = $request->input('content_id');
			$serie = Movie::where('id', $id)->first();

			if (Auth::check() && Auth::user()->rol == 'admin') {
				$directory = ("content/content-{$serie->id}");
				Storage::disk('private')->deleteDirectory($directory, true);
				Movie::where('id', $id)->delete();

				return response()->json([
					'success' => true,
					'message' => 'Contenido eliminado con éxito'
				], 200);
			}
		} catch (\Exception $e) {
			Log::error('Error en destroy SerieController al eliminar el contenido: ' . $e->getMessage());

			return response()->json([
				'success' => false,
				'message' => 'Error en destroy SerieController: ' . $e->getMessage(),
			], 500);
		}
	}

    private function getSerieActionButtons($serie)
	{
		$id = $serie->id;
        $slug = $serie->slug;
        $title = $serie->title;
        $url = 'edit-serie.html';

        if ($serie->seo_setting_id != null) {
            $seo = SeoSetting::where('id', $serie->seo_setting_id)->first();
            if ($seo->url != null) {
                $location = $seo->url;
            } else {
                $location = '/contenido/' . $slug;
            }
        } else {
            $location = '/contenido/' . $slug;
        }

		return '
			<div class="actions-container">
				<button class="actions-button">Acciones</button>
				<div class="actions-menu">
                <a href="' . $location . '" class="action-item">Ver</a>
					<a href="/admin/' . $url . '" class="action-item content-action edit-button" data-id="'.$id.'" data-slug="'.$slug.'">Editar</a>
					<a href="/admin/list-episodes.html" class="action-item content-action list-button" data-serie-id="'.$id.'" data-title="'.$title.'" data-serie-slug="'.$slug.'">Capítulos</a>
                    <form class="content-delete-form" data-id="' . $id . '">
						<input type="hidden" name="content_id" value="' . $id . '">
						<button class="action-item content-action delete-btn" type="submit">Eliminar</button>
					</form>
				</div>
			</div>';
	}

    private function getEpisodeActionButtons($episode)
	{
		$id = $episode->id;
        $title = $episode->title;
        $url = 'edit-episode.html';
        $slug = $episode->slug;

        if ($episode->seo_setting_id != null) {
            $seo = SeoSetting::where('id', $episode->seo_setting_id)->first();
            if ($seo->url != null) {
                $location = $seo->url;
            } else {
                $location = '/contenido/' . $slug;
            }
        } else {
            $location = '/contenido/' . $slug;
        }

		return '
			<div class="actions-container">
				<button class="actions-button">Acciones</button>
				<div class="actions-menu">
                <a href="' . $location . '" class="action-item">Ver</a>
					<a href="/admin/' . $url . '" class="action-item content-action edit-button" data-id="'.$id.'" data-title="'.$title.'" data-slug="'.$slug.'">Editar</a>
                    <a href="/admin/link-content-with-ads.html" class="action-item content-action edit-button" data-type="episode" data-id="'.$id.'" data-title="'.$title.'" data-slug="'.$slug.'">Anuncios</a>
                    <form class="content-delete-form" data-id="' . $id . '">
						<input type="hidden" name="content_id" value="' . $id . '">
						<button class="action-item content-action delete-btn" type="submit">Eliminar</button>
					</form>
				</div>
			</div>';
	}
}
