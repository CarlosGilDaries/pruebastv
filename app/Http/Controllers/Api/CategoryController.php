<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Category;
use App\Models\Language;
use App\Models\SeoSetting;
use App\Models\Translation;
use Illuminate\Support\Facades\Log;
use DataTables;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;

class CategoryController extends Controller
{
    public function index()
    {
        try {
			$categories = Category::with(['seoSetting', 'movies' => function ($query) {
				$query->orderBy('created_at', 'desc')
                ->with('gender')
                ->with('seoSetting');
			}])
            ->where('render_at_index', 1)
            ->orderBy('priority')
            ->get();
            $priorities = Category::all()->sortBy('priority')->pluck('priority')->toArray();

            return response()->json([
                'success' => true,
                'categories' => $categories,
                'priorities' => $priorities
            ], 200);

        } catch (\Exception $e) {
            Log::error('Error: ' . $e->getMessage());

            return response()->json([
                'success' => false,
                'message' => 'Error: ' . $e->getMessage(),
            ], 500);
        }
    }

    public function dropDownMenu()
	{
		try {
			$categories = Category::orderBy('priority')->with('movies.gender', 'seoSetting')->get();

			return response()->json([
				'success' => true,
				'categories' => $categories,
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
            $categories = Category::all();

			return DataTables::of($categories)
				->addColumn('id', function($category) {
					return $category->id;
				})
                ->addColumn('priority', function($category) {
					return $category->priority;
				})
				->addColumn('name', function($category) {
					return $category->name;
				})
                ->addColumn('cover', function($category) {
					return $category->cover;
				})
                ->addColumn('render', function($category) {
					return $category->render_at_index;
				})
				->addColumn('actions', function($category) {
					return $this->getActionButtons($category);
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

    public function show(string $id)
    {
        try {
            $category = Category::with('seoSetting', 'movies.gender', 'movies.SeoSetting', 'scripts')->where('id', $id)->first();

            return response()->json([
                'success' => true,
                'category' => $category,
                'message' => 'Categoría obtenida con éxito.'
            ]);

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
        DB::beginTransaction();

        try {
            $category = new Category();

            $name = sanitize_html($request->input('name'));
            $category->name = $name;
            $newPriority = $request->input('priority');
            
            // Si la prioridad ya existe, desplazar las categorías existentes
            if (Category::where('priority', $newPriority)->exists()) {
                Category::where('priority', '>=', $newPriority)
                       ->increment('priority');
            }
            $category->priority = $newPriority;
            $category->render_at_index = $request->input('render_at_index');
    
            $category->save();

            $cover = $request->file('cover');
            $coverExtension = $cover->getClientOriginalExtension();
            $category->cover = '/file/category-' . $category->id. '/' . $category->id . '-img.' . $coverExtension;
            $cover->storeAs('categories/category-' . $category->id, $category->id . '-img.' . $coverExtension, 'private');

            $category->save();

            $translations = $request->translations ?? [];
            $spanish = Language::where('code','es')->first();
            $spanishId = $spanish->id;

            Translation::updateOrCreate(
                [
                    'language_id' => $spanishId,
                    'key' => "category_" . $category->id
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
                                    'key' => "category_" . $category->id,
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
                'category' => $category
            ], 200);

        } catch (\Exception $e) {
            Log::error('Error: ' . $e->getMessage());

            DB::rollBack();

            return response()->json([
                'success' => false,
                'message' => 'Error: ' . $e->getMessage(),
            ], 500);
        }
    }


    public function update(Request $request, $id)
    {
        DB::beginTransaction();

        try {
            $category = Category::where('id', $id)->with('scripts')->first();
            $name = sanitize_html($request->input('name'));
            $category->name = $name;
            $cover = $request->file('cover');
            if ($cover) {
                $coverExtension = $cover->getClientOriginalExtension();
                $category->cover = '/file/category-' . $category->id. '/' . $category->id . '-img.' . $coverExtension;
                $cover->storeAs('categories/category-' . $category->id, $category->id . '-img.' . $coverExtension, 'private');
            }
            $category->render_at_index = $request->input('render_at_index');
            $currentPriority = $category->priority;
            $newPriority = $request->input('priority');
            
            if ($currentPriority != $newPriority) {
                if ($newPriority < $currentPriority) {
                    // Mover hacia arriba (prioridad más alta)
                    Category::where('priority', '>=', $newPriority)
                        ->where('priority', '<', $currentPriority)
                        ->increment('priority');
                } else {
                    // Mover hacia abajo (prioridad más baja)
                    Category::where('priority', '>', $currentPriority)
                        ->where('priority', '<=', $newPriority)
                        ->decrement('priority');
                }
                
                $category->priority = $newPriority;
            }
    
            $category->save();

            $translations = $request->translations ?? [];
            $spanish = Language::where('code','es')->first();
            $spanishId = $spanish->id;

            Translation::updateOrCreate(
                [
                    'language_id' => $spanishId,
                    'key' => "category_" . $category->id
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
                                    'key' => "category_" . $category->id,
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
                'category' => $category
            ], 200);

        } catch (\Exception $e) {
            Log::error('Error: ' . $e->getMessage());

            DB::rollBack();

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
            $category = Category::findOrFail($id);
            $deletedPriority = $category->priority;
            $directory = ("categories/category-{$category->id}");
			Storage::disk('private')->deleteDirectory($directory, true);
            $category->delete();
            
            // Reordenar las categorías restantes si la eliminada no era la última
            $maxPriority = Category::max('priority') ?? 0;           
            if ($deletedPriority < $maxPriority) {
                Category::where('priority', '>', $deletedPriority)
                       ->decrement('priority');
            }

            return response()->json([
                'success' => true,
                'message' => 'Categoría eliminada con éxito'
            ], 200);

        } catch(\Exception $e) {
            Log::error('Error al eliminar categoría: ' . $e->getMessage());
            
            return response()->json([
                'success' => false,
                'message' => 'Error: ' . $e->getMessage(),
            ], 500);
        }
    }

    private function getActionButtons($category)
	{
		$id = $category->id;

		return '
			<div class="actions-container">
				<button class="actions-button orders-button">Acciones</button>
				<div class="actions-menu">
					<a href="/admin/edit-category.html" class="action-item content-action edit-button" data-id="'.$id.'">Editar</a>
                    <form class="category-delete-form" data-id="' . $id . '">
						<input type="hidden" name="content_id" value="' . $id . '">
						<button class="action-item content-action delete-btn" type="submit">Eliminar</button>
					</form>
				</div>
			</div>';
	}
}
