<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\LegalNotice;
use Illuminate\Support\Facades\Log;
use DataTables;

class LegalNoticeController extends Controller
{
    public function index()
    {
        try {
        $legalNotices = LegalNotice::all();

        return response()->json([
            'success' => true,
            'legalNotices' => $legalNotices,
            'message' => 'Aviso Legal obtenido con éxito.',
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
            $legalNotices = LegalNotice::all();

			return DataTables::of($legalNotices)
				->addColumn('id', function($legalNotice) {
					return $legalNotice->id;
				})
				->addColumn('title', function($legalNotice) {
					return $legalNotice->title;
				})
				->addColumn('actions', function($legalNotice) {
					return $this->getActionButtons($legalNotice);
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
            $legalNotice = new LegalNotice();
            $title = $request->input('title');
            $text = $request->input('text');

            $legalNotice->title = $title;
            $legalNotice->text = $text;
            $legalNotice->save();

            return response()->json([
                'success' => true,
                'legalNotice' => $legalNotice,
                'message' => 'Aviso Legal creado con éxito'
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
            $legalNotice = LegalNotice::where('id', $id)->first();

            return response()->json([
                'success' => true,
                'legalNotice' => $legalNotice,
                'message' => 'Aviso Legal obtenido con éxito.'
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
            $legalNotice = LegalNotice::where('id', $id)->first();
            $title = $request->input('title');
            $text = $request->input('text');

            $legalNotice->title = $title;
            $legalNotice->text = $text;
            $legalNotice->save();

            return response()->json([
                'success' => true,
                'legalNotice' => $legalNotice,
                'message' => 'Aviso Legal editado con éxito'
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
            $legalNotice = LegalNotice::where('id', $id)->first();
            $legalNotice->delete();

            return response()->json([
                'success' => true,
                'message' => 'Aviso Legal eliminado con éxito'
            ], 200);

        } catch(\Exception $e) {
            Log::error('Error al eliminar el Aviso Legal: ' . $e->getMessage());
            
            return response()->json([
                'success' => false,
                'message' => 'Error: ' . $e->getMessage(),
            ], 500);
        }
    }

    private function getActionButtons($legalNotice)
	{
		$id = $legalNotice->id;

		return '
			<div class="actions-container">
				<button class="actions-button orders-button">Acciones</button>
				<div class="actions-menu">
					<a href="/admin/edit-legal-notice.html" class="action-item content-action edit-button" data-id="'.$id.'">Editar</a>
                    <form class="legal-notice-delete-form" data-id="' . $id . '">
						<input type="hidden" name="content_id" value="' . $id . '">
						<button class="action-item content-action delete-btn" type="submit">Eliminar</button>
					</form>
				</div>
			</div>';
	}
}
