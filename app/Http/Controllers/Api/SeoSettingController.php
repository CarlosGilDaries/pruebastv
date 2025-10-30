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
}
