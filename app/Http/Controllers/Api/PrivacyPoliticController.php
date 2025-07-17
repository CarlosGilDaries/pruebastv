<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\PrivacyPolitic;
use Illuminate\Support\Facades\Log;
use DataTables;

class PrivacyPoliticController extends Controller
{
    public function index()
    {
        try {
        $privacyPolitics = PrivacyPolitic::all();

        return response()->json([
            'success' => true,
            'privacyPolitics' => $privacyPolitics,
            'message' => 'Política de privacidad obtenido con éxito.',
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
            $privacyPolitics = PrivacyPolitic::all();

			return DataTables::of($privacyPolitics)
				->addColumn('id', function($privacyPolitic) {
					return $privacyPolitic->id;
				})
				->addColumn('title', function($privacyPolitic) {
					return $privacyPolitic->title;
				})
				->addColumn('actions', function($privacyPolitic) {
					return $this->getActionButtons($privacyPolitic);
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
        try {
            $privacyPolitic = new PrivacyPolitic();
            $title = $request->input('title');
            $text = $request->input('text');

            $privacyPolitic->title = $title;
            $privacyPolitic->text = $text;
            $privacyPolitic->save();

            return response()->json([
                'success' => true,
                'privacyPolitic' => $privacyPolitic,
                'message' => 'Política de privacidad creado con éxito'
            ], 200);

        } catch(\Exception $e) {
            Log::error('Error: ' . $e->getMessage());

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
            $privacyPolitic = PrivacyPolitic::where('id', $id)->first();

            return response()->json([
                'success' => true,
                'privacyPolitic' => $privacyPolitic,
                'message' => 'Política de privacidad obtenido con éxito.'
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
        try {
            $privacyPolitic = PrivacyPolitic::where('id', $id)->first();
            $title = $request->input('title');
            $text = $request->input('text');

            $privacyPolitic->title = $title;
            $privacyPolitic->text = $text;
            $privacyPolitic->save();

            return response()->json([
                'success' => true,
                'privacyPolitic' => $privacyPolitic,
                'message' => 'Política de privacidad editado con éxito'
            ], 200);

        } catch(\Exception $e) {
            Log::error('Error: ' . $e->getMessage());

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
            $privacyPolitic = PrivacyPolitic::where('id', $id)->first();
            $privacyPolitic->delete();

            return response()->json([
                'success' => true,
                'message' => 'Política de privacidad eliminado con éxito'
            ], 200);

        } catch(\Exception $e) {
            Log::error('Error al eliminar el Política de privacidad: ' . $e->getMessage());
            
            return response()->json([
                'success' => false,
                'message' => 'Error: ' . $e->getMessage(),
            ], 500);
        }
    }

    private function getActionButtons($privacyPolitic)
	{
		$id = $privacyPolitic->id;

		return '
			<div class="actions-container">
				<button class="actions-button orders-button">Acciones</button>
				<div class="actions-menu">
					<a href="/admin/edit-privacy-politic.html" class="action-item content-action edit-button" data-id="'.$id.'">Editar</a>
                    <form class="privacy-politic-delete-form" data-id="' . $id . '">
						<input type="hidden" name="content_id" value="' . $id . '">
						<button class="action-item content-action delete-btn" type="submit">Eliminar</button>
					</form>
				</div>
			</div>';
	}
}
