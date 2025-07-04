<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Permission;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use DataTables;

class PermissionController extends Controller
{
    public function index()
    {
        try {
        $permissions = Permission::with('roles')->get();

        return response()->json([
            'success' => true,
            'permissions' => $permissions,
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
            $permissions = permission::all();

			return DataTables::of($permissions)
				->addColumn('id', function($permission) {
					return $permission->id;
				})
				->addColumn('name', function($permission) {
					return $permission->name;
				})
				->addColumn('actions', function($permission) {
					return $this->getActionButtons($permission);
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
            $permission = new Permission();
            $name = sanitize_html($request->input('name'));

            $permission->name = $name;
            $permission->save();

            return response()->json([
                'success' => true,
                'permission' => $permission,
                'message' => 'Permiso creado con éxito'
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
            $permission = Permission::with('roles')->where('id', $id)->first();

            return response()->json([
                'success' => true,
                'permission' => $permission,
                'message' => 'Permiso obtenido con éxito.'
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
            $permission = Permission::where('id', $id)->first();
            $name = sanitize_html($request->input('name'));

            $permission->name = $name;
            $permission->save();

            return response()->json([
                'success' => true,
                'permission' => $permission,
                'message' => 'Permiso editado con éxito'
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
            $permission = Permission::where('id', $id)->first();
            $permission->delete();

            return response()->json([
                'success' => true,
                'message' => 'Permiso eliminado con éxito'
            ], 200);

        } catch(\Exception $e) {
            Log::error('Error al eliminar el permiso: ' . $e->getMessage());
            
            return response()->json([
                'success' => false,
                'message' => 'Error: ' . $e->getMessage(),
            ], 500);
        }
    }

    private function getActionButtons($permission)
	{
		$id = $permission->id;

		return '
			<div class="actions-container">
				<button class="actions-button orders-button">Acciones</button>
				<div class="actions-menu">
					<a href="/admin/edit-permission.html" class="action-item content-action edit-button" data-id="'.$id.'">Editar</a>
                    <form class="permission-delete-form" data-id="' . $id . '">
						<input type="hidden" name="content_id" value="' . $id . '">
						<button class="action-item content-action delete-btn" type="submit">Eliminar</button>
					</form>
				</div>
			</div>';
	}
}
