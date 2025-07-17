<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\FooterItem;
use Illuminate\Support\Facades\Log;
use DataTables;

class FooterItemController extends Controller
{
    public function index()
    {
        try {
        $footerItems = FooterItem::all();

        return response()->json([
            'success' => true,
            'footerItems' => $footerItems,
            'message' => 'Planes obtenidos con éxito.',
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
            $footerItems = FooterItem::all();

			return DataTables::of($footerItems)
				->addColumn('id', function($footerItem) {
					return $footerItem->id;
				})
				->addColumn('name', function($footerItem) {
					return $footerItem->name;
				})
                ->addColumn('logo', function($footerItem) {
					return $footerItem->logo;
				})
                ->addColumn('url', function($footerItem) {
					return $footerItem->url;
				})
				->addColumn('actions', function($footerItem) {
					return $this->getActionButtons($footerItem);
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
            $footerItem = new FooterItem();
            $name = sanitize_html($request->input('name'));
            $description = sanitize_html($request->input('description'));
            $url = sanitize_html($request->input('url'));

            $footerItem->name = $name;
            $footerItem->description = $description;
            $footerItem->logo = "temp";
            $footerItem->url = $url;

            $footerItem->save();

            $logo = $request->file('logo');
            $logoExtension = $logo->getClientOriginalExtension();
            $footerItem->logo = '/file/footer-' . $footerItem->id . '-img.' . $logoExtension;
            $logo->storeAs('settings', 'footer-' . $footerItem->id . '-img.' . $logoExtension, 'private');

            $footerItem->save();

            return response()->json([
                'success' => true,
                'footerItem' => $footerItem,
                'message' => 'Item creado con éxito'
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
            $footerItem = FooterItem::where('id', $id)->first();

            return response()->json([
                'success' => true,
                'footerItem' => $footerItem,
                'message' => 'Item obtenido con éxito.'
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
            $footerItem = FooterItem::where('id', $id)->first();
            $name = sanitize_html($request->input('name'));
            $description = sanitize_html($request->input('description'));
            $url = sanitize_html($request->input('url'));

            $footerItem->name = $name;
            $footerItem->description = $description;
            $footerItem->logo = "temp";
            $footerItem->url = $url;

            $footerItem->save();

            $logo = $request->file('logo');
            if ($logo) {
                $logoExtension = $logo->getClientOriginalExtension();
                $footerItem->logo = '/file/footer-' . $footerItem->id . '-img.' . $logoExtension;
                $logo->storeAs('settings/','footer-' . $footerItem->id . '-img.' . $logoExtension, 'private');
            }

            $footerItem->save();

            return response()->json([
                'success' => true,
                'footerItem' => $footerItem,
                'message' => 'Item editado con éxito'
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
            $footerItem = FooterItem::where('id', $id)->first();
            $footerItem->delete();

            return response()->json([
                'success' => true,
                'message' => 'Item eliminado con éxito'
            ], 200);

        } catch(\Exception $e) {
            Log::error('Error al eliminar el item: ' . $e->getMessage());
            
            return response()->json([
                'success' => false,
                'message' => 'Error: ' . $e->getMessage(),
            ], 500);
        }
    }

    private function getActionButtons($footerItem)
	{
		$id = $footerItem->id;

		return '
			<div class="actions-container">
				<button class="actions-button orders-button">Acciones</button>
				<div class="actions-menu">
					<a href="/admin/edit-footer-item.html" class="action-item content-action edit-button" data-id="'.$id.'">Editar</a>
                    <form class="footer-item-delete-form" data-id="' . $id . '">
						<input type="hidden" name="content_id" value="' . $id . '">
						<button class="action-item content-action delete-btn" type="submit">Eliminar</button>
					</form>
				</div>
			</div>';
	}
}
