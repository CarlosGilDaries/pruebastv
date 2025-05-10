<?php

namespace App\Http\Controllers\Api;

use App\Models\Ad;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Auth;
use App\Http\Requests\AdRequest;
use Illuminate\Support\Facades\Storage;
use App\Http\Controllers\Controller;
use Illuminate\Http\Request;

class AdApiController extends Controller
{
    public function index()
    {
        try {
            $ads = Ad::all();

            return response()->json([
                'success' => true,
                'data' => $ads,
                'message' => 'Anuncios obtenidos exitosamente'
            ], 200);

        } catch (\Exception $e) {
            Log::error('Error al obtener anuncios: ' . $e->getMessage());
            
            return response()->json([
                'success' => false,
                'message' => 'Error: ' . $e->getMessage(),
            ], 500);
        }
    }

        public function adminList()
    {
        try {
            $ads = Ad::select('id', 'title', 'brand', 'type', 'url', 'duration', 'slug')->get();           
            
            return response()->json([
                'success' => true,
                'data' => $ads,
                'message' => 'Anuncios obtenidos con éxito.'
            ], 200);
            
        } catch (\Exception $e) {
            Log::error('Error al obtener anuncios: ' . $e->getMessage());
            
            return response()->json([
                'success' => false,
                'message' => 'Error: ' . $e->getMessage()
            ], 500);
        }
    }

    public function show(string $slug)
    {
        try {
            $ad = Ad::where('slug', $slug)->first();

            return response()->json([
                'success' => true,
                'data' => $ad,
                'message' => 'Anuncio obtenido exitosamente'
            ], 200);
        } catch (\Exception $e) {
            Log::error('Error al obtener anuncio: ' . $e->getMessage());
            
            return response()->json([
                'success' => false,
                'message' => 'Error: ' . $e->getMessage(),
            ], 500);
        }
    }
	
	    public function editShow(string $id)
    {
        try {
            $ad = Ad::where('id', $id)->first();

            return response()->json([
                'success' => true,
                'data' => $ad,
                'message' => 'Anuncio obtenido exitosamente'
            ], 200);
        } catch (\Exception $e) {
            Log::error('Error al obtener anuncio: ' . $e->getMessage());
            
            return response()->json([
                'success' => false,
                'message' => 'Error: ' . $e->getMessage(),
            ], 500);
        }
    }

        public function create()
    {
        try {
            $ads = Ad::all();

            return response()->json([
                'success' => true,
                'data' => $ads,
                'message' => 'Listado de anuncios obtenido para creación'
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
            $ad = new Ad();
            $ad->title = $request->input('title');
            $ad->type = $request->input('type');
            $ad->brand = $request->input('brand');

            // Generar slug único
            $slug = Str::slug($request->input('title'), '-');
            $counter = 2;
            while (Ad::where('slug', $slug)->exists()) {
                $slug = Str::slug($request->input('title'), '-') . '-' . $counter;
                $counter++;
            }
            $ad->slug = $slug;

            if ($request->input('type') !== 'application/vnd.apple.mpegurl') {
                $adFile = $request->file('content');
                if ($adFile) {
                    $contentExtension = $adFile->getClientOriginalExtension();
                    $ad->url = '/file/' . $ad->brand . '/' . $slug . '.' . $contentExtension;
                    $adFile->storeAs('ads/' . $ad->brand, $slug . '.' . $contentExtension, 'private');
                }
            } else {
                $adFile = $request->file('m3u8');
                if ($adFile) {
                    $contentExtension = $adFile->getClientOriginalExtension();
                    $ad->url = '/file/' . $ad->brand . '/' . $slug . '/' . $slug . '.' . $contentExtension;
                    $adFile->storeAs('ads/' . $ad->brand . '/' . $slug, $slug . '.' . $contentExtension, 'private');

                    // Extraer archivos ZIP
                    $zips = ['ts1', 'ts2', 'ts3'];
                    $extractPath = storage_path('app/private/ads/' . $ad->brand . '/' . $slug);
                    if (!file_exists($extractPath)) mkdir($extractPath, 0777, true);

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
            }

            $ad->save();

            return response()->json([
                'success' => true,
                'data' => $ad,
                'message' => 'Anuncio creado satisfactoriamente.'
            ], 201);
        } catch (\Exception $e) {
            Log::error('Error al subir el archivo: ' . $e->getMessage());

            return response()->json([
                'success' => false,
                'message' => 'Error: ' . $e->getMessage(),
            ], 500);
        }
    }

    public function update(Request $request, $id)
    {
        try {
            $ad = Ad::where('id', $id)->first();
            $title = $request->input('title');
            $ad->brand = $request->input('brand');

            if ($ad->title !== $title) {
                $slug = Str::slug($title, '-');
                $counter = 1;
                while (Ad::where('slug', $slug)->exists()) {
                    $slug = Str::slug($title, '-') . '-remake-' . $counter;
                    $counter++;
                }
                $ad->slug = $slug;
            }
            $ad->title = $title;
            $ad->save();

            return response()->json([
                'success' => true,
                'new_slug' => $ad->slug,
                'message' => 'Anuncio actualizado con éxito.'
            ], 200);
        
        } catch (\Exception $e) {
            Log::error('Error al actualizar anuncio: ' . $e->getMessage());

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
            $ad = Ad::where('id', $id)->findOrFail($id);
            $directory = ('ads/' . $ad->brand);
            if ($ad->type == "video/mp4") {
                $extension = ".mp4";
            }
            else if ($ad->type == "audio/mp3") {
                $extension = ".mp3";
            } else {
                $extension = ".m3u8";
            }

            if (Auth::check() && Auth::user()->rol == 'admin') {
                Storage::disk('private')->delete($directory . '/' . $ad->slug . $extension);
                Ad::where('id', $id)->delete();

                $files = Storage::disk('private')->files($directory);
                if (count($files) == 0) {
                    Storage::disk('private')->deleteDirectory($directory);
                }

                return response()->json([
                    'success' => true,
                    'message' => 'Anuncio eliminado con éxito'
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
}
