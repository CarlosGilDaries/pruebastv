<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Gender;
//use App\Http\Requests\ContentRequest;
use App\Models\Movie;
use App\Models\Plan;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Auth;
use GuzzleHttp\Client;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\DB;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\URL;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Cache;
use Symfony\Component\HttpFoundation\StreamedResponse;
use DataTables;
use Illuminate\Support\Carbon;

class MovieApiController extends Controller
{
    public function index()
    {
        try {
            $movies = Movie::with(['categories', 'gender' => function($query) {
                   			$query->select('id', 'name');
                  		}])->get();;
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

    public function datatable()
    {
        try {
            $movies = Movie::with('gender')->get();

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
					return $movie->gender->name;
				})
				->addColumn('type', function($movie) {
					return $movie->type;
				})
				->addColumn('pay_per_view', function($movie) {
					return $movie->pay_per_view;
				})
                ->addColumn('created_at', function($movie) {
					return Carbon::parse($movie->created_at)->format('d-m-Y');
				})
				->addColumn('actions', function($movie) {
					return $this->getActionButtons($movie);
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
        try {
            $movie = Movie::with('gender')->where('slug', $slug)->first();
			$user = Auth::user();
			
            if (!$movie) {
                return response()->json([
                    'success' => false,
                    'error' => 'Película no encontrada'
                ], 404);
            }
			
            $plans = $movie->plans;

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
	
	public function editShow($id)
    {
        try {
            $movie = Movie::where('id', $id)->with('plans', 'categories')->first();
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
        try {
            $movie = Movie::where('id', $id)->first();
            $title = sanitize_html($request->input('title'));
            $overview = sanitize_html($request->input('overview'));
            $tagline = sanitize_html($request->input('tagline'));
            $external_url = sanitize_html($request->input('external_url'));
            $price = sanitize_html($request->input('pay_per_view_price'));
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
            $movie->gender_id = $request->input('gender_id');
            $movie->pay_per_view = $request->input('pay_per_view');

            if ($price) {
                $movie->pay_per_view_price = $price;
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
				$movie->cover = '/file/content-' . $movie->id. '/' . $movie->slug . '-img.' . $coverExtension;
				$cover->storeAs('content/content-' . $movie->id, $movie->slug . '-img.' . $coverExtension, 'private');
            }

            $trailer = $request->file('trailer');
            if ($trailer) {
                $trailerExtension = $trailer->getClientOriginalExtension();
                $movie->trailer = '/file/content-' . $movie->id . '/' . $movie->slug . '-trailer.' . $trailerExtension;
                $trailer->storeAs('content/content-' . $movie->id, $movie->slug . '-trailer.' . $trailerExtension, 'private');
            }
			
			$content = $request->file('content');
            $hls_content = $request->file('m3u8');

            if ($content != null && $request->input('type') != 'application/vnd.apple.mpegurl') {
                if ($movie->type == 'application/vnd.apple.mpegurl') {
                    Storage::disk('private')->delete('content/content-' . $movie->id . '/' . $movie->slug  . '.m3u8');
                    $basePath = 'content/content-' . $movie->id;
                    $subdirectories = Storage::disk('private')->directories($basePath);
                    // Eliminar cada subdirectorio (con todo su contenido)
                    foreach ($subdirectories as $dir) {
                        Storage::disk('private')->deleteDirectory($dir);
                    }
                } 

				Storage::disk('private')->delete('content/content-' . $movie->id . '/' . $movie->slug  . '.mp3');
                $contentExtension = $content->getClientOriginalExtension();
                $movie->url = '/file/content-' . $movie->id . '/' . $movie->slug . '.' . $contentExtension;
                $content->storeAs('content/content-' . $movie->id, $movie->slug . '.' . $contentExtension, 'private');
            } 
            else if ($hls_content != null && $request->input('type') == 'application/vnd.apple.mpegurl') {
                if ($movie->type != 'application/vnd.apple.mpegurl') {
                    Storage::disk('private')->delete('content/content-' . $movie->id . '/' . $movie->slug  . '.mp4');
					Storage::disk('private')->delete('content/content-' . $movie->id . '/' . $movie->slug  . '.mp3');
                }
                $content = $request->file('m3u8');
                $contentExtension = $content->getClientOriginalExtension();
                $movie->url = '/file/content-' . $movie->id . '/' . $movie->slug . '.' . $contentExtension;
                $content->storeAs('content/content-' . $movie->id, $movie->slug . '.' . $contentExtension, 'private');               
                $basePath = 'content/content-' . $movie->id;
                $subdirectories = Storage::disk('private')->directories($basePath);
                // Eliminar cada subdirectorio (con todo su contenido)
                foreach ($subdirectories as $dir) {
                    Storage::disk('private')->deleteDirectory($dir);
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
			
            } 
			else if ($request->input('type') != 'video/mp4' || $request->input('type') != 'audio/mpeg' || $request->input('type') != 'application/vnd.apple.mpegurl') {
				$movie->url = $external_url;

				Storage::disk('private')->delete('content/content-' . $movie->id . '/' . $movie->slug  . '.mp4');
				Storage::disk('private')->delete('content/content-' . $movie->id . '/' . $movie->slug  . '.mp3');
				$basePath = 'content/content-' . $movie->id;
				$subdirectories = Storage::disk('private')->directories($basePath);
				// Eliminar cada subdirectorio (con todo su contenido)
				foreach ($subdirectories as $dir) {
					Storage::disk('private')->deleteDirectory($dir);
				}
			}
			
			if ($request->input('type')) {
				$movie->type = $request->input('type');
			}

            $movie->save();

            $movie->plans()->sync($request->input('plans'));
            $movie->categories()->sync($request->input('categories'));
			
			$adminPlan = Plan::where('name', 'admin')->first();
			DB::table('movie_plan')->insert([
				'movie_id' => $movie->id,
				'plan_id' => $adminPlan->id,
				'created_at' => now(),
				'updated_at' => now(),
			]);
			
			$movie->save();

            return response()->json([
                'success' => true,
                'new_slug' => $movie->slug,
                'message' => 'Película editada con éxito.'
            ], 200);
            
        } catch (\Exception $e) {
            Log::error('Error: ' . $e->getMessage());
            
            return response()->json([
                'success' => false,
                'message' => 'Error: ' . $e->getMessage(),
            ], 500);
        }
    }

    public function store(Request $request)
    {
        try {
            $title = sanitize_html($request->input('title'));
            $overview = sanitize_html($request->input('overview'));
            $tagline = sanitize_html($request->input('tagline'));
            $external_url = sanitize_html($request->input('external_url'));
            $price = sanitize_html($request->input('pay_per_view_price'));
            $start_time = sanitize_html($request->input('start_time'));
            $end_time = sanitize_html($request->input('end_time'));
            $duration = sanitize_html($request->input('duration'));

            $movie = new Movie();
            $movie->title = $title;
            $movie->type = $request->input('type');
            $movie->overview = $overview;
            $movie->tagline = $tagline;
            $movie->gender_id = $request->input('gender_id');
            $movie->pay_per_view = $request->input('pay_per_view');

            if ($price) {
                $movie->pay_per_view_price = $price;
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
			$movie->save();

            $cover = $request->file('cover');
            $coverExtension = $cover->getClientOriginalExtension();
            $movie->cover = '/file/content-' . $movie->id. '/' . $slug . '-img.' . $coverExtension;
            $cover->storeAs('content/content-' . $movie->id, $slug . '-img.' . $coverExtension, 'private');

            $trailer = $request->file('trailer');

            if ($trailer) {
                $trailerExtension = $trailer->getClientOriginalExtension();
                $movie->trailer = '/file/content-' . $movie->id . '/' . $slug . '-trailer.' . $trailerExtension;
                $trailer->storeAs('content/content-' . $movie->id, $slug . '-trailer.' . $trailerExtension, 'private');
            }

            if ($request->input('type') != "iframe" && $request->input('type') != "url_mp4" && $request->input('type') != "url_hls" && $request->input('type') != "video/youtube" && $request->input('type') != "vimeo" && $request->input('type') != 'url_mp3') {
                if ($request->input('type') != 'application/vnd.apple.mpegurl') {
                    $content = $request->file('content');
                    $contentExtension = $content->getClientOriginalExtension();
					$movie->url = '/file/content-' . $movie->id . '/' . $slug . '.' . $contentExtension;
					$content->storeAs('content/content-' . $movie->id, $slug . '.' . $contentExtension, 'private');
				} else {
					$content = $request->file('m3u8');
					//$mime = $content->getMimeType();
					//dd($mime);
					$contentExtension = $content->getClientOriginalExtension();
					$movie->url = '/file/content-' . $movie->id . '/' . $slug . '.' . $contentExtension;
					$content->storeAs('content/content-' . $movie->id, $slug . '.' . $contentExtension, 'private');
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
			
			$adminPlan = Plan::where('name', 'admin')->first();
			DB::table('movie_plan')->insert([
				'movie_id' => $movie->id,
				'plan_id' => $adminPlan->id,
				'created_at' => now(),
				'updated_at' => now(),
			]);
			
			$plans = $request->input('plans');
            $movie->categories()->sync($request->input('categories'));

			foreach($plans as $plan) {
				DB::table('movie_plan')->insert([
					'movie_id' => $movie->id,
					'plan_id' => $plan,
					'created_at' => now(),
					'updated_at' => now(),
				]);
			}

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

	public function getSignedUrl(Request $request, $movieId)
	{
		try {	
			$user = Auth::user();

			$movie = Movie::where('id', $movieId)->first();

			if ($movie->type == 'url_hls' || $movie->type == 'application/vnd.apple.mpegurl') {
				$signedUrl = URL::signedRoute('proxy.m3u8', [
					'movieId' => $movie->id,
					'userId' => $user->id,
				]);

			} else {
				$signedUrl = URL::signedRoute('secure.stream', [
					'movie' => $movie->id,
					'user' => $user->id,
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
				'message' => 'Error: ' . $e->getMessage(),
			], 500);
		}
	}

    private function getActionButtons($movie)
	{
		$id = $movie->id;
        $slug = $movie->slug;
        $title = $movie->title;

		return '
			<div class="actions-container">
				<button class="actions-button">Acciones</button>
				<div class="actions-menu">
                <a href="/content/' . $slug . '" class="action-item">Ver</a>
					<a href="/admin/edit-content.html" class="action-item content-action edit-button" data-id="'.$id.'" data-slug="'.$slug.'">Editar</a>
					<a href="/admin/link-content-with-ads.html" class="action-item content-action link-button" data-id="'.$id.'" data-title="'.$title.'" data-slug="'.$slug.'">Anuncios</a>
                    <form class="content-delete-form" data-id="' . $id . '">
						<input type="hidden" name="content_id" value="' . $id . '">
						<button class="action-item content-action delete-btn" type="submit">Eliminar</button>
					</form>
				</div>
			</div>';
	}
}
