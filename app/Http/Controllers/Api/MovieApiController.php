<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Gender;
use App\Models\Language;
//use App\Http\Requests\ContentRequest;
use App\Models\Movie;
use App\Models\Plan;
use App\Models\SeoSetting;
use App\Models\Serie;
use App\Models\Translation;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Auth;
use GuzzleHttp\Client;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\DB;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\URL;
use Symfony\Component\HttpFoundation\StreamedResponse;
use DataTables;
use Illuminate\Support\Carbon;
use Illuminate\Validation\Rule;
use Illuminate\Support\Facades\Validator;

class MovieApiController extends Controller
{
    public function index()
    {
        try {
            $movies = Movie::with(['series', 'seoSetting', 'categories', 'genders'])->get();
			$genders = Gender::all(['id', 'name']);
            
            return response()->json([
                'success' => true,
                'data' => [
                    'movies' => $movies,
                    'genders' => $genders
                ],
                'message' => 'Películas obtenidas exitosamente'
            ], 200);
            
        } catch (\Exception $e) {
            Log::error('Error al obtener películas: ' . $e->getMessage());
            
            return response()->json([
                'success' => false,
                'message' => 'Error: ' . $e->getMessage()
            ], 500);
        } 
    }

    public function datatable($type)
    {
        try {
            if ($type == 'local') {
                $filter = ['audio/mpeg', 'video/mp4', 'application/vnd.apple.mpegurl'];
            }
            else if ($type == 'external') {
                $filter = ['url_mp3', 'url_mp4', 'url_hls'];
            } else {
                $filter = ['stream'];
            }
            $movies = Movie::with('genders')
                ->whereIn('type', $filter)
                ->where('serie', 0)
                ->get();

			return DataTables::of($movies)
                ->addColumn('id', function($movie) {
                    return $movie->id;
                })
				->addColumn('title', function($movie) {
					return $movie->title;
				})
				->addColumn('cover', function($movie) {
					return $movie->cover;
				})
				->addColumn('gender', function($movie) {
					return $movie->genders->pluck('name')->implode(', ');
				})
				->addColumn('type', function($movie) {
					return $movie->type;
				})
				->addColumn('pay_per_view', function($movie) {
					return $movie->pay_per_view;
				})
                ->addColumn('rent', function($movie) {
					return $movie->rent;
				})
                ->addColumn('created_at', function($movie) {
					return Carbon::parse($movie->created_at)->format('d-m-Y');
				})
				->addColumn('actions', function($movie) use ($type) {
					return $this->getActionButtons($movie, $type);
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

    public function show($slug)
    {
        $movie = Movie::with([
            'series'=> function($query) 
            {
                $query->orderBy('season_number', 'asc')
                    ->orderBy('episode_number', 'asc');
            }, 
            'seoSetting', 
            'genders.seoSetting', 
            'tags.seoSetting', 
            'scripts'
            ])->where('slug', $slug)->first();

        if (!$movie) {
            return response()->json([
                'success' => false,
            ], 404);
        }

        try {
            $user = Auth::user();
            $plans = $movie->plans;
            $ads = DB::table('ad_movie')->where('movie_id', $movie->id)->count();

            $movie->series_by_season = $movie->series()
                ->with('seoSetting')
                ->orderBy('episode_number')
                ->orderBy('season_number')
                ->get()
                ->groupBy('season_number')
                ->values();

            return response()->json([
                'success' => true,
                'data' => [
                    'movie' => $movie,
                    'ads_count' => $ads,
                    'plans' => $plans,
                ],
                'message' => 'Película con sus planes obtenida con éxito'
            ], 200);

        } catch (\Exception $e) {
            Log::error('Error al obtener película: ' . $e->getMessage());

            return response()->json([
                'success' => false,
                'message' => 'Error: ' . $e->getMessage()
            ], 500);
        }
    }

    public function showById($id)
    {
        $movie = Movie::with([
            'series'=> function($query) 
            {
                $query->orderBy('season_number', 'asc')
                    ->orderBy('episode_number', 'asc');
            }, 
            'seoSetting', 
            'genders.seoSetting', 
            'tags.seoSetting', 
            'scripts'
            ])->where('id', $id)->first();

        if (!$movie) {
            return response()->json([
                'success' => false,
            ], 404);
        }

        try {
            $user = Auth::user();
            $plans = $movie->plans;
            $ads = DB::table('ad_movie')->where('movie_id', $movie->id)->count();

            $movie->series_by_season = $movie->series()
                ->with('seoSetting')
                ->orderBy('episode_number')
                ->orderBy('season_number')
                ->get()
                ->groupBy('season_number')
                ->values();

            return response()->json([
                'success' => true,
                'data' => [
                    'movie' => $movie,
                    'ads_count' => $ads,
                    'plans' => $plans,
                ],
                'message' => 'Película con sus planes obtenida con éxito'
            ], 200);

        } catch (\Exception $e) {
            Log::error('Error al obtener película: ' . $e->getMessage());

            return response()->json([
                'success' => false,
                'message' => 'Error: ' . $e->getMessage()
            ], 500);
        }
    }
	
	public function editShow($id)
    {
        try {
            $movie = Movie::where('id', $id)->with('seoSetting', 'plans', 'categories', 'tags', 'genders', 'scripts')->first();
            $plans = Plan::all();

            if (!$movie) {
                return response()->json([
                    'success' => false,
                    'error' => 'Película no encontrada'
                ], 404);
            }

            $ads = DB::table('ad_movie')->where('movie_id', $movie->id)->count();

            return response()->json([
                'success' => true,
                'data' => [
                    'movie' => $movie,
                    'ads_count' => $ads,
                    'plans' => $plans,
                ],
                'message' => 'Película con sus planes obtenida con éxito'
            ], 200);

        } catch (\Exception $e) {
            Log::error('Error al obtener película: ' . $e->getMessage());
            
            return response()->json([
                'success' => false,
                'message' => 'Error: ' . $e->getMessage()
            ], 500);
        }
    }

    public function update(Request $request, $id)
    {

        DB::beginTransaction();

        try {
			$validator = Validator::make($request->all(), [
                'title' => 'required|string|max:100',
                'tagline' => 'required|string|max:500',
                'overview' => 'required|string|max:1000',
                'cover' => 'nullable|image|mimes:jpg,jpeg|dimensions:width=1024,height=768',
				'tall_cover' => 'nullable|image|mimes:jpg,jpeg|dimensions:width=500,height=750',
                'trailer' => 'nullable|file|mimetypes:video/mp4',
                'content' => [
                    'nullable',
                    'file',
                    Rule::requiredIf(function () use ($request) {
                        return $request->input('change_content_file') && $request->input('type') === 'video/mp4';
                    }),
                    'mimetypes:video/mp4'
                ],
                'm3u8' => [
                    'nullable',
                    'file',
                    Rule::requiredIf(function () use ($request) {
                        return $request->input('change_content_file') && $request->input('type') === 'application/vnd.apple.mpegurl';
                    }),
                    'mimetypes:text/plain'
                ],
                'ts1' => [
                    'nullable',
                    'file',
                    Rule::requiredIf(function () use ($request) {
                        return $request->input('change_content_file') && $request->input('type') === 'application/vnd.apple.mpegurl';
                    }),
                    'mimetypes:application/zip,application/x-zip-compressed'
                ],
                'ts2' => [
                    'nullable',
                    'file',
                    Rule::requiredIf(function () use ($request) {
                        return $request->input('change_content_file') && $request->input('type') === 'application/vnd.apple.mpegurl';
                    }),
                    'mimetypes:application/zip,application/x-zip-compressed'
                ],
                'ts3' => [
                    'nullable',
                    'file',
                    Rule::requiredIf(function () use ($request) {
                        return $request->input('change_content_file') && $request->input('type') === 'application/vnd.apple.mpegurl';
                    }),
                    'mimetypes:application/zip,application/x-zip-compressed'
                ],
                'categories' => 'required|array|min:1',
                'categories.*' => 'integer|exists:categories,id',
                'duration' => 'required|date_format:H:i:s',
                'type' => 'nullable|in:stream,video/mp4,application/vnd.apple.mpegurl,url_mp3,url_hls,url_mp4',
                'change_content_file' => 'sometimes|boolean'
            ]);
            
            if ($validator->fails()) {
                return response()->json([
                    'success' => false,
                    'errors' => $validator->errors(),
                    'message' => 'Error en la validación del formulario'
                ], 422);
            } 

            $movie = Movie::where('id', $id)->with('scripts')->first();
            $title = sanitize_html($request->input('title'));
            $overview = sanitize_html($request->input('overview'));
            $tagline = sanitize_html($request->input('tagline'));
            $external_url = sanitize_html($request->input('external_url'));
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
			
			$content = $request->file('content');
            $hls_content = $request->file('m3u8');
			
			if ($content != null) {
				if ($movie->type == 'application/vnd.apple.mpegurl') {
					Storage::disk('private')->delete('content/content-' . $movie->id . '/' . $movie->id  . '.m3u8');
					$basePath = 'content/content-' . $movie->id;
					$subdirectories = Storage::disk('private')->directories($basePath);
					// Eliminar cada subdirectorio (con todo su contenido)
					foreach ($subdirectories as $dir) {
						Storage::disk('private')->deleteDirectory($dir);
					}
				} else {
					Storage::disk('private')->delete('content/content-' . $movie->id . '/' . $movie->id  . '.mp4');
					Storage::disk('private')->delete('content/content-' . $movie->id . '/' . $movie->id  . '.mp3');
				}
				$contentExtension = $content->getClientOriginalExtension();
				$movie->url = '/file/content-' . $movie->id . '/' . $movie->id . '.' . $contentExtension;
				$content->storeAs('content/content-' . $movie->id, $movie->id . '.' . $contentExtension, 'private');
			}

			else if ($hls_content != null) {
				if ($movie->type == 'application/vnd.apple.mpegurl') {
					Storage::disk('private')->delete('content/content-' . $movie->id . '/' . $movie->id  . '.m3u8');
					$basePath = 'content/content-' . $movie->id;
					$subdirectories = Storage::disk('private')->directories($basePath);
					// Eliminar cada subdirectorio (con todo su contenido)
					foreach ($subdirectories as $dir) {
						Storage::disk('private')->deleteDirectory($dir);
					}
				} else {
					Storage::disk('private')->delete('content/content-' . $movie->id . '/' . $movie->id  . '.mp4');
					Storage::disk('private')->delete('content/content-' . $movie->id . '/' . $movie->id  . '.mp3');
				}
				$new_hls_content = $request->file('m3u8');
				$contentExtension = $new_hls_content->getClientOriginalExtension();
				$movie->url = '/file/content-' . $movie->id . '/' . $movie->id . '.' . $contentExtension;
				$new_hls_content->storeAs('content/content-' . $movie->id, $movie->id . '.' . $contentExtension, 'private');
				$zips = ['ts1', 'ts2', 'ts3'];
				$extractPath = storage_path('app/private/content/content-' . $movie->id);

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

			} else if ($external_url != null) {
				Storage::disk('private')->delete('content/content-' . $movie->id . '/' . $movie->id  . '.mp4');
				Storage::disk('private')->delete('content/content-' . $movie->id . '/' . $movie->id  . '.mp3');
				Storage::disk('private')->delete('content/content-' . $movie->id . '/' . $movie->id  . '.m3u8');
					$basePath = 'content/content-' . $movie->id;
					$subdirectories = Storage::disk('private')->directories($basePath);
					// Eliminar cada subdirectorio (con todo su contenido)
					foreach ($subdirectories as $dir) {
						Storage::disk('private')->deleteDirectory($dir);
					}
				$movie->url = $external_url;
			}
			
			if ($request->input('type')) {
				$movie->type = $request->input('type');
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
                'message' => 'Película editada con éxito.'
            ], 200);
            
        } catch (\Exception $e) {
            DB::rollBack();

            Log::error('Error: ' . $e->getMessage());
            
            return response()->json([
                'success' => false,
                'message' => 'Error: ' . $e->getMessage(),
            ], 500);
        }
    }

    public function store(Request $request)
    {
        DB::beginTransaction();

        try {
			$validator = Validator::make($request->all(), [
                'title' => 'required|string|max:100',
                'tagline' => 'required|string|max:500',
                'overview' => 'required|string|max:1000',
                'cover' => 'required|image|mimes:jpg,jpeg|dimensions:width=1024,height=768',
				'tall_cover' => 'required|image|mimes:jpg,jpeg|dimensions:width=500,height=750',
                'trailer' => 'nullable|file|mimetypes:video/mp4',
                'content' => [
                    'nullable',
                    'file',
                    Rule::requiredIf(function () use ($request) {
                        return $request->input('change_content_file') && $request->input('type') === 'video/mp4';
                    }),
                    'mimetypes:video/mp4'
                ],
                'm3u8' => [
                    'nullable',
                    'file',
                    Rule::requiredIf(function () use ($request) {
                        return $request->input('change_content_file') && $request->input('type') === 'application/vnd.apple.mpegurl';
                    }),
                    'mimetypes:text/plain'
                ],
                'ts1' => [
                    'nullable',
                    'file',
                    Rule::requiredIf(function () use ($request) {
                        return $request->input('change_content_file') && $request->input('type') === 'application/vnd.apple.mpegurl';
                    }),
                    'mimetypes:application/zip,application/x-zip-compressed'
                ],
                'ts2' => [
                    'nullable',
                    'file',
                    Rule::requiredIf(function () use ($request) {
                        return $request->input('change_content_file') && $request->input('type') === 'application/vnd.apple.mpegurl';
                    }),
                    'mimetypes:application/zip,application/x-zip-compressed'
                ],
                'ts3' => [
                    'nullable',
                    'file',
                    Rule::requiredIf(function () use ($request) {
                        return $request->input('change_content_file') && $request->input('type') === 'application/vnd.apple.mpegurl';
                    }),
                    'mimetypes:application/zip,application/x-zip-compressed'
                ],
                'categories' => 'required|array|min:1',
                'categories.*' => 'integer|exists:categories,id',
                'duration' => 'required|date_format:H:i:s',
                'type' => 'required|in:stream,video/mp4,application/vnd.apple.mpegurl,url_mp3,url_hls,url_mp4',
                'change_content_file' => 'sometimes|boolean'
            ]);
            
            if ($validator->fails()) {
                return response()->json([
                    'success' => false,
                    'errors' => $validator->errors(),
                    'message' => 'Error en la validación del formulario'
                ], 422);
            } 

            $title = sanitize_html($request->input('title'));
            $overview = sanitize_html($request->input('overview'));
            $tagline = sanitize_html($request->input('tagline'));
            $external_url = sanitize_html($request->input('external_url'));
            $price = sanitize_html($request->input('pay_per_view_price'));
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

            //Para que se puedan generar películas con el mismo título pero cada una tenga un slug único
            $slug = Str::slug($title, '-');
            $counter = 1;
            while (Movie::where('slug', $slug)->exists()) {
                $slug = Str::slug($title, '-') . '-remake-' . $counter;
                $counter++;
            }
            $movie->slug = $slug;
			
			$movie->url = "temp";
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

            if ($request->input('type') != "url_mp4" && $request->input('type') != "url_hls" && $request->input('type') != 'url_mp3' && $request->input('type') != 'stream') {
                if ($request->input('type') != 'application/vnd.apple.mpegurl') {
                    $content = $request->file('content');
                    $contentExtension = $content->getClientOriginalExtension();
					$movie->url = '/file/content-' . $movie->id . '/' . $movie->id . '.' . $contentExtension;
					$content->storeAs('content/content-' . $movie->id, $movie->id . '.' . $contentExtension, 'private');
				} else {
					$content = $request->file('m3u8');
					//$mime = $content->getMimeType();
					//dd($mime);
					$contentExtension = $content->getClientOriginalExtension();
					$movie->url = '/file/content-' . $movie->id . '/' . $movie->id . '.' . $contentExtension;
					$content->storeAs('content/content-' . $movie->id, $movie->id . '.' . $contentExtension, 'private');
				}

				$zips = ['ts1', 'ts2', 'ts3'];
				$extractPath = storage_path('app/private/content/content-' . $movie->id);

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
				$movie->url = $external_url;
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
				'movie' => $movie,
				'message' => $title . ' subido correctamente'
			], 201);

		} catch (\Exception $e) {
			// Limpiar archivos subidos en caso de error
			/*if (isset($slug)) {
                Storage::disk('private')->deleteDirectory('content/' . $slug);
            }*/
            DB::rollBack();

			Log::error('Error al crear contenido: ' . $e->getMessage());

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
			$movie = Movie::where('id', $id)->first();

			if (Auth::check() && Auth::user()->rol == 'admin') {
				$directory = ("content/content-{$movie->id}");
				Storage::disk('private')->deleteDirectory($directory, true);
				Movie::where('id', $id)->delete();

				return response()->json([
					'success' => true,
					'message' => 'Contenido eliminado con éxito'
				], 200);
			}
		} catch (\Exception $e) {
			Log::error('Error al eliminar el archivo: ' . $e->getMessage());

			return response()->json([
				'success' => false,
				'message' => 'Error: ' . $e->getMessage(),
			], 500);
		}
	}



	public function streamSigned(Request $request, $movieId, $userId)
	{
		try {
			if (! $request->hasValidSignature()) {
				return response()->json(['success' => false, 'message' => 'Firma inválida'], 403);
			}

			$movie = Movie::findOrFail($movieId);
			$url = $movie->url;

			// Detectar si es ruta interna (comienza por /file/)
			$isInternal = str_starts_with($url, '/file/');

			if ($isInternal) {
				// Limpiar la ruta (quitar /file/) y redirigir a storage 'private'
				$relativePath = 'content' . substr($url, strlen('/file')); // ejemplo: content/content-22/archivo.mp3

				if (!Storage::disk('private')->exists($relativePath)) {
					return response()->json(['success' => false, 'message' => 'Archivo no encontrado: ' . $relativePath], 404);
				}

				$mime = Storage::disk('private')->mimeType($relativePath);
				$size = Storage::disk('private')->size($relativePath);

				return new StreamedResponse(function () use ($relativePath) {
					$stream = Storage::disk('private')->readStream($relativePath);
					while (!feof($stream)) {
						echo fread($stream, 8192);
						ob_flush();
						flush();
					}
					fclose($stream);
				}, 200, [
					'Content-Type' => $mime ?: 'audio/mpeg',
					'Content-Length' => $size,
					'Accept-Ranges' => 'bytes',
					'Cache-Control' => 'no-store',
					'Pragma' => 'no-cache',
				]);
			}

			// Caso externo (URL directa)
			if ($movie->type == 'url_mp4') {
				$accept = 'video/mp4';
			} elseif ($movie->type == 'url_hls') {
				$accept = 'application/vnd.apple.mpegurl';
			} elseif ($movie->type == 'url_mp3') {
				$accept = 'audio/mpeg';
			} else {
				$accept = $movie->type;
			}

			$client = new Client(['stream' => true]);

			$response = $client->get($url, [
				'headers' => ['Accept' => $accept]
			]);

			return response()->stream(function () use ($response) {
				while (!$response->getBody()->eof()) {
					echo $response->getBody()->read(8192);
					ob_flush();
					flush();
				}
			}, 200, [
				'Content-Type' => $response->getHeaderLine('Content-Type') ?: 'video/mp4',
				'Content-Length' => $response->getHeaderLine('Content-Length'),
				'Accept-Ranges' => 'bytes',
				'Cache-Control' => 'no-store',
				'Pragma' => 'no-cache',
			]);

		} catch (\Exception $e) {
			Log::error('Error en streamSigned: ' . $e->getMessage());

			return response()->json([
				'success' => false,
				'message' => 'Error: ' . $e->getMessage(),
			], 500);
		}
	}

	public function getSignedUrl(Request $request, $movieId, $isSerie)
	{
		try {	
			$user = Auth::user();
            if ($isSerie == 'true') {
                $content = Serie::where('id', $movieId)->first();
            } else {
                $content = Movie::where('id', $movieId)->first();
            }

			if ($content->type == 'url_hls' || $content->type == 'application/vnd.apple.mpegurl' || $content->type == 'stream') {
				$signedUrl = URL::signedRoute('proxy.m3u8', [
					'movieId' => $content->id,
					'userId' => $user->id,
                    'isSerie' => $isSerie
				]);

			} else {
				$signedUrl = URL::signedRoute('secure.stream', [
					'movie' => $content->id,
					'user' => $user->id,
                    'isSerie' => $isSerie
				]);
			}

			return response()->json([
				'success' => true,
				'url' => $signedUrl
			], 200);

		} catch (\Exception $e) {
			Log::error('Error en signedUrl: ' . $e->getMessage());

			return response()->json([
				'success' => false,
				'message' => 'Error en signedUrl: ' . $e->getMessage(),
			], 500);
		}
	}

    private function getActionButtons($movie, $type)
	{
		$id = $movie->id;
        $slug = $movie->slug;
        $title = $movie->title;
        if ($type == 'local') {
            $url = 'edit-content.html';
        }
        else if ($type == 'external') {
            $url = 'edit-external-content.html';
        } else {
            $url = 'edit-stream.html';
        }

        if ($movie->seo_setting_id != null) {
            $seo = SeoSetting::where('id', $movie->seo_setting_id)->first();
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
					<a href="/admin/link-content-with-ads.html" class="action-item content-action link-button" data-type="movie" data-id="'.$id.'" data-title="'.$title.'" data-slug="'.$slug.'">Anuncios</a>
                    <form class="content-delete-form" data-id="' . $id . '">
						<input type="hidden" name="content_id" value="' . $id . '">
						<button class="action-item content-action delete-btn" type="submit">Eliminar</button>
					</form>
				</div>
			</div>';
	}
}

