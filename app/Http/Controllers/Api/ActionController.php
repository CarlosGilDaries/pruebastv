<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Action;
use App\Models\Language;
use App\Models\Translation;
use Illuminate\Support\Facades\Log;
use DataTables;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\DB;

class ActionController extends Controller
{
    public function index()
    {
        try {
            $actions = Action::orderBy('order')->get();
            $positions = Action::all()->sortBy('order')->pluck('order')->toArray();

            return response()->json([
                'success' => true,
                'actions' => $actions,
                'positions' => $positions
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
            $actions = Action::all();

			return DataTables::of($actions)
				->addColumn('id', function($action) {
					return $action->id;
				})
                ->addColumn('order', function($action) {
					return $action->order;
				})
                ->addColumn('name', function($action) {
					return $action->name;
				})
				->addColumn('picture', function($action) {
					return $action->picture;
				})
				->addColumn('actions', function($action) {
					return $this->getActionButtons($action);
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
            $action = Action::where('id', $id)
                ->with('seoSetting', 'scripts')
                ->first();

            return response()->json([
                'success' => true,
                'action' => $action,
                'message' => 'Acción obtenida con éxito.'
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
            $action = new Action();

            $name = sanitize_html($request->input('name'));
            $text = sanitize_html($request->input('text'));
            $subtext = sanitize_html($request->input('subtext'));
            $button = sanitize_html($request->input('button_text'));
            $url = sanitize_html($request->input('url'));

            $action->name = $name;
            $action->text = $text;
            if ($subtext) {
                $action->subtext = $subtext;
            }
            $action->button_text = $button;
            $action->url = $url;

            $newPosition = $request->input('order');
            
            // Si la prioridad ya existe, desplazar las categorías existentes
            if (Action::where('order', $newPosition)->exists()) {
                Action::where('order', '>=', $newPosition)
                       ->increment('order');
            }
            $action->order = $newPosition;

            $action->picture = "temp";
            $action->save();

            $picture = $request->file('picture');
            if ($picture) {
                $pictureExtension = $picture->getClientOriginalExtension();
				$action->picture = '/file/action-' . $action->id. '/' . $action->id . '-img.' . $pictureExtension;
				$picture->storeAs('actions/action-' . $action->id, $action->id . '-img.' . $pictureExtension, 'private');
            }

            $action->save();

            $translations = $request->translations ?? [];
            $spanish = Language::where('code','es')->first();
            $spanishId = $spanish->id;

            Translation::updateOrCreate(
                [
                    'language_id' => $spanishId,
                    'key' => "action_" . $action->id . "_button"
                ],
                ['value' => $button]
            );
            if ($subtext) {
                Translation::updateOrCreate(
                    [
                        'language_id' => $spanishId,
                        'key' => "action_" . $action->id . "_subtext"
                    ],
                    ['value' => $subtext]
                );
            }
            Translation::updateOrCreate(
                [
                    'language_id' => $spanishId,
                    'key' => "action_" . $action->id . "_text"
                ],
                ['value' => $text]
            );

            foreach ($translations as $languageCode => $translationData) {
                $language = Language::where('code', $languageCode)->first();
                
                if ($language) {
                    foreach (['button', 'text', 'subtext'] as $field) {
                        if (!empty($translationData[$field])) {
                            Translation::updateOrCreate(
                                [
                                    'language_id' => $language->id,
                                    'key' => "action_{$action->id}_$field",
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
                'action' => $action
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

    public function update(Request $request, string $id)
    {
        DB::beginTransaction();

        try {
            $action = Action::where('id', $id)->with('scripts')->first();

            $name = sanitize_html($request->input('name'));
            $text = sanitize_html($request->input('text'));
            $subtext = sanitize_html($request->input('subtext'));
            $button = sanitize_html($request->input('button_text'));
            $url = sanitize_html($request->input('url'));

            $action->name = $name;
            $action->text = $text;
            if ($subtext) {
                $action->subtext = $subtext;
            }
            $action->button_text = $button;
            $action->url = $url;

            $picture = $request->file('picture');
            if ($picture) {
                $pictureExtension = $picture->getClientOriginalExtension();
				$action->picture = '/file/action-' . $action->id. '/' . $action->id . '-img.' . $pictureExtension;
				$picture->storeAs('actions/action-' . $action->id, $action->id . '-img.' . $pictureExtension, 'private');
            }

            $currentPosition = $action->order;
            $newPosition = $request->input('order');
            
            if ($currentPosition != $newPosition) {
                if ($newPosition < $currentPosition) {
                    // Mover hacia arriba (prioridad más alta)
                    Action::where('order', '>=', $newPosition)
                        ->where('order', '<', $currentPosition)
                        ->increment('order');
                } else {
                    // Mover hacia abajo (prioridad más baja)
                    Action::where('order', '>', $currentPosition)
                        ->where('order', '<=', $newPosition)
                        ->decrement('order');
                }
                
                $action->order = $newPosition;
            }

            $action->save();

            $translations = $request->translations ?? [];
            $spanish = Language::where('code','es')->first();
            $spanishId = $spanish->id;

            Translation::updateOrCreate(
                [
                    'language_id' => $spanishId,
                    'key' => "action_" . $action->id . "_button"
                ],
                ['value' => $button]
            );
            if ($subtext) {
                Translation::updateOrCreate(
                    [
                        'language_id' => $spanishId,
                        'key' => "action_" . $action->id . "_subtext"
                    ],
                    ['value' => $subtext]
                );
            }
            Translation::updateOrCreate(
                [
                    'language_id' => $spanishId,
                    'key' => "action_" . $action->id . "_text"
                ],
                ['value' => $text]
            );

            foreach ($translations as $languageCode => $translationData) {
                $language = Language::where('code', $languageCode)->first();
                
                if ($language) {
                    foreach (['button', 'text', 'subtext'] as $field) {
                        if (!empty($translationData[$field])) {
                            Translation::updateOrCreate(
                                [
                                    'language_id' => $language->id,
                                    'key' => "action_{$action->id}_$field",
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
                'action' => $action,
                'message' => 'Acción editada con éxito'
            ], 200);

        } catch(\Exception $e) {
            Log::error('Error en update ActionController: ' . $e->getMessage());

            DB::rollBack();

            return response()->json([
                'success' => false,
                'message' => 'Error en update ActionController: ' . $e->getMessage(),
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
            $action = Action::where('id', $id)->first();
            $deletedPosition  = $action->order;
            
            $action->delete();
            $directory = ("actions/action-{$action->id}");
            Storage::disk('private')->deleteDirectory($directory, true);
            
            // Reordenar las acciones restantes si la eliminada no era la última
            $maxPosition = Action::max('order') ?? 0;           
            if ($deletedPosition < $maxPosition) {
                Action::where('order', '>', $deletedPosition)
                       ->decrement('order');
            }

            return response()->json([
                'success' => true,
                'message' => 'Acción eliminada con éxito'
            ], 200);

        } catch(\Exception $e) {
            Log::error('Error al eliminar el género: ' . $e->getMessage());
            
            return response()->json([
                'success' => false,
                'message' => 'Error: ' . $e->getMessage(),
            ], 500);
        }
    }

    private function getActionButtons($action)
	{
		$id = $action->id;

		return '
			<div class="actions-container">
				<button class="actions-button orders-button">Acciones</button>
				<div class="actions-menu">
					<a href="/admin/edit-action.html" class="action-item content-action edit-button" data-id="'.$id.'">Editar</a>
                    <form class="action-delete-form" data-id="' . $id . '">
						<input type="hidden" name="content_id" value="' . $id . '">
						<button class="action-item content-action delete-btn" type="submit">Eliminar</button>
					</form>
				</div>
			</div>';
	}
}
