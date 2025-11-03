<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Action;
use App\Models\Category;
use App\Models\Gender;
use App\Models\Movie;
use App\Models\SeoSetting;
use App\Models\Tag;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

class SeoSettingController extends Controller
{
    public function index()
    {
        try {
            $settings = SeoSetting::all();

            return response()->json([
                'success' => true,
                'settings' => $settings
            ], 200);

        } catch (\Exception $e) {
            Log::error('Error en genericPageShow SeoSettingController: ' . $e->getMessage());

			return response()->json([
				'success' => false,
				'message' => 'Error en genericPageShow SeoSettingController: ' . $e->getMessage(),
			], 500);
        }
    }

    public function genericPageShow($key)
    {
        try {
            $settings = SeoSetting::where('key', $key)->first();

            return response()->json([
                'success' => true,
                'settings' => $settings
            ], 200);

        } catch (\Exception $e) {
            Log::error('Error en genericPageShow SeoSettingController: ' . $e->getMessage());

			return response()->json([
				'success' => false,
				'message' => 'Error en genericPageShow SeoSettingController: ' . $e->getMessage(),
			], 500);
        }
    }

    public function store(Request $request, $id)
    {
        try {
            $settings = new SeoSetting();
            $settings->key = sanitize_html($request->key);
            $settings->title = sanitize_html($request->title);
            $settings->description = sanitize_html($request->description);
            $settings->keywords = sanitize_html($request->keywords);
            $settings->robots = sanitize_html($request->robots);
            $settings->url = sanitize_html($request->url);
            $settings->alias = sanitize_html($request->alias);
            $settings->save();

            if ($settings->key == 'movie') {
                $movie = Movie::where('id', $id)->first();
                $movie->seo_setting_id = $settings->id;
                $movie->save();
            } 
            else if ($settings->key == 'category') {
                $category = Category::where('id', $id)->first();
                $category->seo_setting_id = $settings->id;
                $category->save();
            } 
            else if ($settings->key == 'gender') {
                $gender = Gender::where('id', $id)->first();
                $gender->seo_setting_id = $settings->id;
                $gender->save();
            } 
            else if ($settings->key == 'tag') {
                $tag = Tag::where('id', $id)->first();
                $tag->seo_setting_id = $settings->id;
                $tag->save();
            } 
            else if ($settings->key == 'action') {
                $action = Action::where('id', $id)->first();
                $action->seo_setting_id = $settings->id;
                $action->save();
            }

            return response()->json([
                'success' => true,
                'settings' => $settings
            ], 200);

        } catch (\Exception $e) {
            Log::error('Error en store SeoSettingController: ' . $e->getMessage());

			return response()->json([
				'success' => false,
				'message' => 'Error en store SeoSettingController: ' . $e->getMessage(),
			], 500);
        }
    }

    public function genericPageStore(Request $request)
    {
        try {
            $settings = new SeoSetting();
            $settings->key = sanitize_html($request->key);
            $settings->title = sanitize_html($request->title);
            $settings->description = sanitize_html($request->description);
            $settings->keywords = sanitize_html($request->keywords);
            $settings->robots = sanitize_html($request->robots);
            $settings->url = sanitize_html($request->url);
            $settings->alias = sanitize_html($request->alias);
            $settings->save();

            return response()->json([
                'success' => true,
                'settings' => $settings
            ], 200);

        } catch (\Exception $e) {
            Log::error('Error en genericPageStore SeoSettingController: ' . $e->getMessage());

			return response()->json([
				'success' => false,
				'message' => 'Error en genericPageStore SeoSettingController: ' . $e->getMessage(),
			], 500);
        }
    }

    public function update(Request $request, $settingId, $id)
    {
        try {
            $settings = SeoSetting::where('id', $settingId)->first();
            $settings->key = sanitize_html($request->key);
            $settings->title = sanitize_html($request->title);
            $settings->description = sanitize_html($request->description);
            $settings->keywords = sanitize_html($request->keywords);
            $settings->robots = sanitize_html($request->robots);
            $settings->url = sanitize_html($request->url);
            $settings->alias = sanitize_html($request->alias);
            $settings->save();

            if ($settings->key == 'movie') {
                $movie = Movie::where('id', $id)->first();
                $movie->seo_setting_id = $settings->id;
                $movie->save();
            } 
            else if ($settings->key == 'category') {
                $category = Category::where('id', $id)->first();
                $category->seo_setting_id = $settings->id;
                $category->save();
            } 
            else if ($settings->key == 'gender') {
                $gender = Gender::where('id', $id)->first();
                $gender->seo_setting_id = $settings->id;
                $gender->save();
            } 
            else if ($settings->key == 'tag') {
                $tag = Tag::where('id', $id)->first();
                $tag->seo_setting_id = $settings->id;
                $tag->save();
            } 
            else if ($settings->key == 'action') {
                $action = Action::where('id', $id)->first();
                $action->seo_setting_id = $settings->id;
                $action->save();
            }

            return response()->json([
                'success' => true,
                'settings' => $settings
            ], 200);

        } catch (\Exception $e) {
            Log::error('Error en update SeoSettingController: ' . $e->getMessage());

			return response()->json([
				'success' => false,
				'message' => 'Error en update SeoSettingController: ' . $e->getMessage(),
			], 500);
        }
    }

    public function genericPageUpdate(Request $request, $key)
    {
        try {
            $settings = SeoSetting::updateOrCreate(
                ['key' => $key],
                [
                    'key' => $key,
                    'title' => sanitize_html($request->title),
                    'description' => sanitize_html($request->description),
                    'keywords' => sanitize_html($request->keywords),
                    'robots' => sanitize_html($request->robots),
                    'url' => sanitize_html($request->url),
                    'alias' => sanitize_html($request->alias),
                ]
            );

            return response()->json([
                'success' => true,
                'settings' => $settings
            ], 200);

        } catch (\Exception $e) {
            Log::error('Error en genericPageUpdate SeoSettingController: ' . $e->getMessage());

			return response()->json([
				'success' => false,
				'message' => 'Error en genericPageUpdate SeoSettingController: ' . $e->getMessage(),
			], 500);
        }
    }

    public function resolve(Request $request)
    {
        try {
            $path = '/' . trim($request->path(), '/'); // ejemplo: /generos/accion

            Log::debug('Petición capturada: ' . $request->path(), [
                'referer' => $request->header('referer'),
                'user-agent' => $request->header('user-agent')
            ]);

            $seo = SeoSetting::where('url', $path)
                ->with('movie', 'gender', 'action', 'tag', 'category')
                ->first();

            if (!$seo) {
                return response()->view('errors.404', [], 404);
            }

            switch ($seo->key) {
                case 'gender':
                    $file = public_path("gender-show.html");
                    break;
                case 'movie':
                    $file = public_path("show.html");
                    break;
                case 'category':
                    $file = public_path("category-show.html");
                    break;
                case 'tag':
                    $file = public_path("tag-show.html");
                    break;
                /*case 'action':
                    $file = public_path("action-show.html");
                    break;*/
                default:
                    return response()->view('errors.404', [], 404);
            }

            // ⚡ Devolver el contenido del archivo físico
            if (file_exists($file)) {
                // Leemos el HTML del archivo y lo devolvemos sin cambiar la URL
                $html = file_get_contents($file);

                // Inyectar dinámicamente el ID dentro del HTML
                switch ($seo->key) {
                    case 'gender':
                        $id = $seo->gender->id;
                        break;
                    case 'movie':
                        $id = $seo->movie->id;
                        break;
                    case 'category':
                        $id = $seo->category->id;
                        break;
                    case 'tag':
                        $id = $seo->tag->id;
                        break;
                    case 'action':
                        $id = $seo->action->id;
                        break;
                    default:
                        $id = null;
                        break;
                }

                // ⚡ Inserta el ID dentro de una variable JS global
                $html = str_replace(
                    '</head>', // justo antes de cerrar <head>
                    "<script>window.PAGE_ID = {$id}; window.PAGE_TYPE = '{$seo->key}';</script>\n</head>",
                    $html
                );

                return response($html, 200)
                    ->header('Content-Type', 'text/html');
            } else {
                return response()->view('errors.404', [], 404);
            }
        
        } catch (\Exception $e) {
            Log::error('Error en resolve SeoSettingController: ' . $e->getMessage());

			return response()->json([
				'success' => false,
				'message' => 'Error en resolve SeoSettingController: ' . $e->getMessage(),
			], 500);
        }
    }
}
