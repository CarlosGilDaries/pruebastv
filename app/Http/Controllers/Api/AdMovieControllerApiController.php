<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\AdMovieRequest;
use Illuminate\Support\Facades\DB;
use App\Models\Movie;
use App\Models\Ad;
use App\Models\Serie;
use Illuminate\Database\QueryException;
use Illuminate\Support\Facades\Log;
use Illuminate\Http\Request;

class AdMovieControllerApiController extends Controller
{
    public function index()
    {
        try {
            $movies = Movie::withCount('ads')
                ->with('seoSetting')
                ->has('ads')
                ->get();

            return response()->json([
                'success' => true,
                'data' => $movies,
                'message' => 'Contenido con anuncios obtenido exitosamente'
            ]);

        } catch (\Exception $e) {
            Log::error('Error al obtener contenido con anuncios: ' . $e->getMessage());
             return response()->json([
                'success' => false,
                'message' => 'Error: ' . $e->getMessage(),
            ], 500);
        }
    }
    
    public function show($id)
    {
        try {
            $movie = Movie::with(['seoSetting', 'ads' => function($query) {
                $query->select('ads.id', 'ads.title', 'ads.url')
                    ->withPivot('type', 'midroll_time', 'skippable', 'skip_time');
            }])->where('id', $id)->first();

            if (!$movie) {
                return response()->json([
                    'success' => false,
                    'error' => 'Contenido no encontrado'
                ], 404);
            }

            return response()->json([
                'success' => true,
                'data' => [
                    'movie' => $movie,
                    'ads_count' => $movie->ads->count()
                ],
                'message' => 'Información de contenido obtenida con éxito.'
            ]);

        } catch (\Exception $e) {
            Log::error('Error al obtener contenido: ' . $e->getMessage());

            return response()->json([
                'success' => false,
                'message' => 'Error: ' . $e->getMessage(),
            ], 500);
        }
    }

    public function create()
    {
        try {
            $movies = Movie::all();
            $ads = Ad::all();

            return response()->json([
                'success' => true,
                'data' => [
                    'movies' => $movies,
                    'ads' => $ads
                ],
                'message' => 'Datos para creación obtenidos exitosamente'
            ]);

        } catch (\Exception $e) {
            Log::error('Error al obtener datos para creación: ' . $e->getMessage());

            return response()->json([
                'success' => false,
                'message' => 'Error: ' . $e->getMessage(),
            ], 500);
        }     
    }

    public function store(Request $request)
    {
        try {
            /*$prerollCount = 0;
            $postrollCount = 0;

            foreach ($request->ads as $ad) {
                if (!isset($ad['id']) || !isset($ad['type'])) {
                    continue;
                }

                if ($ad['type'] === 'preroll') {
                    $prerollCount++;
                } elseif ($ad['type'] === 'postroll') {
                    $postrollCount++;
                } 
            }

            if ($prerollCount > 1 || $postrollCount > 1) {
                return response()->json([
                    'success' => false,
                    'message' => 'ERROR: Solo se permite un anuncio preroll y un anuncio postroll por contenido.',
                ], 400); 
            }*/

            foreach ($request->ads as $ad) {
                if (!isset($ad['id']) || !isset($ad['type'])) {
                    continue;
                }

                DB::table('ad_movie')->insert([
                    'movie_id' => $request->content_id,
                    'ad_id' => $ad['id'],
                    'type' => $ad['type'],
                    'midroll_time' => ($ad['type'] === 'midroll') ? $ad['midroll_time'] : null,
                    'skippable' => $ad['skippable'],
                    'skip_time' => ($ad['skippable'] == 1) ? $ad['skip_time'] : null,
                    'created_at' => now(),
                    'updated_at' => now(),
                ]);
            }

            return response()->json([
                'success' => true,
                'data' => [
                    'content_id' => $request->content_id,
                    'ads_assigned' => count($request->ads)
                ],
                'message' => '¡Anuncios asignados correctamente!',
            ], 201);            

        } catch (\Exception $e) {
            Log::error('Error: ' . $e->getMessage());

            return response()->json([
                'success' => false,
                'message' => 'Error: ' . $e->getMessage(),
            ], 500);

        } catch (QueryException $e) {
            Log::error('Error: ' . $e->getMessage());

            if ($e->getCode() == 23000) {
                return response()->json([
                    'success' => false,
                    'message' => 'El contenido y el anuncio ya están vinculados.'
                ], 409);
            }

            return response()->json([
                'success' => false,
                'message' => 'Error: ' . $e->getMessage()
            ], 500);
        }
    }

    public function getAds($movieId, $isSerie)
    {
        try {
            if ($isSerie == 'true') {
                $ads = Serie::where('id', $movieId)
                    ->with(['ads' => function ($query) {
                        $query->select('ads.id', 'ads.type', 'ads.url')
                            ->withPivot('type', 'midroll_time','skippable', 'skip_time');
                    }])->first();

                $movie = Serie::where('id', $movieId)
                    ->with('seoSetting')
                    ->first();

            } else {
                $ads = Movie::where('id', $movieId)
                    ->with(['ads' => function ($query) {
                        $query->select('ads.id', 'ads.type', 'ads.url')
                            ->withPivot('type', 'midroll_time','skippable', 'skip_time', 'image', 'description', 'redirect_url');
                    }])->first();

                $movie = Movie::where('id', $movieId)
                    ->with('seoSetting')
                    ->first();
            }
            
            return response()->json([
                'movie' => $movie,
                'ads' => $ads
            ]);

        } catch (\Exception $e) {
            Log::error('Error: ' . $e->getMessage());

            return response()->json([
                'success' => false,
                'message' => 'Error: ' . $e->getMessage(),
            ], 500);
        }
    }

    public function destroy(Request $request)
    {
        try {
            $content_id = $request->input('content_id');
            $ad_id = $request->input('ad_id');

            DB::table('ad_movie')
                ->where('movie_id', $content_id)
                ->where('ad_id', $ad_id)
                ->delete();

            return response()->json([
                'success' => true,
                'message' => 'Anuncio desvinculado correctamente',
            ], 200);

        } catch (\Exception $e) {
            Log::error('Error: ' . $e->getMessage());

            return response()->json([
                'success' => false,
                'message' => 'Error: ' . $e->getMessage(),
            ], 500);
        }
    }
}
