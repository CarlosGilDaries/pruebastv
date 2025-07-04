<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Role;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use DataTables;

class RoleController extends Controller
{
    public function index()
    {
        try {
        $roles = Role::with('permissions')->get();

        return response()->json([
            'success' => true,
            'roles' => $roles,
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
            $roles = Role::all();

			return DataTables::of($roles)
				->addColumn('id', function($role) {
					return $role->id;
				})
				->addColumn('name', function($role) {
					return $role->name;
				})
				->addColumn('actions', function($role) {
					return $this->getActionButtons($role);
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
            $role = new Role();
            $name = sanitize_html($request->input('name'));

            $role->name = $name;
            $role->save();

            return response()->json([
                'success' => true,
                'role' => $role,
                'message' => 'Rol creado con éxito'
            ], 200);

        } catch(\Exception $e) {
            Log::error('Error: ' . $e->getMessage());

            return response()->json([
                'success' => false,
                'message' => 'Error: ' . $e->getMessage(),
            ], 500);
        }
    }

    public function assignPermissions(Request $request, $roleId)
    {
        try {
            $role = Role::findOrFail($roleId);
            $role->permissions()->sync($request->permission_ids);

            return response()->json([
                'success' => true,
                'message' => 'Permisos asignados'
            ], 200);

        } catch (\Exception $e) {
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
            $role = Role::with('permissions')->where('id', $id)->first();

            return response()->json([
                'success' => true,
                'role' => $role,
                'message' => 'Rol obtenido con éxito.'
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
            $role = role::where('id', $id)->first();
            $name = sanitize_html($request->input('name'));

            $role->name = $name;
            $role->save();

            return response()->json([
                'success' => true,
                'role' => $role,
                'message' => 'Rol editado con éxito'
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
            $role = Role::where('id', $id)->first();
            $role->delete();

            return response()->json([
                'success' => true,
                'message' => 'Rol eliminado con éxito'
            ], 200);

        } catch(\Exception $e) {
            Log::error('Error al eliminar el rol: ' . $e->getMessage());
            
            return response()->json([
                'success' => false,
                'message' => 'Error: ' . $e->getMessage(),
            ], 500);
        }
    }

    private function getActionButtons($role)
	{
		$id = $role->id;

		return '
			<div class="actions-container">
				<button class="actions-button orders-button">Acciones</button>
				<div class="actions-menu">
					<a href="/admin/edit-role.html" class="action-item content-action edit-button" data-id="'.$id.'">Editar</a>
                    <form class="role-delete-form" data-id="' . $id . '">
						<input type="hidden" name="content_id" value="' . $id . '">
						<button class="action-item content-action delete-btn" type="submit">Eliminar</button>
					</form>
				</div>
			</div>';
	}
}
