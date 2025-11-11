<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Script;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

class ScriptController extends Controller
{
    /*public function show($id) {
        try {
            $script = Script::where('id', $id)->with('movie', 'gender', 'category', 'tag', 'action')->first();

            return response()->json([
                'success' => true,
                'script' => $script
            ], 200);

        } catch (\Exception $e) {
            Log::error('Error en store ScriptController: ' . $e->getMessage());

			return response()->json([
				'success' => false,
				'message' => 'Error en store ScriptController: ' . $e->getMessage(),
			], 500);
        }
    }*/

    public function store(Request $request, $id, $key)
    {
        try {
            $script = new Script();
            $script->key = $key;
            $script->type = $request ->type;
            $script->code = $request->code;
            $script->save();

            if ($script->key == 'movie') {
                $script->movie_id = $id;
                $script->save();
            } 
            else if ($script->key == 'category') {
                $script->category_id = $id;
                $script->save();
            } 
            else if ($script->key == 'gender') {
                $script->gender_id = $id;
                $script->save();
            } 
            else if ($script->key == 'tag') {
                $script->tag_id = $id;
                $script->save();
            } 
            else if ($script->key == 'action') {
                $script->action_id = $id;
                $script->save();
            }

            return response()->json([
                'success' => true,
                'script' => $script
            ], 200);

        } catch (\Exception $e) {
            Log::error('Error en store ScriptController: ' . $e->getMessage());

			return response()->json([
				'success' => false,
				'message' => 'Error en store ScriptController: ' . $e->getMessage(),
			], 500);
        }
    }

    public function update(Request $request, $id)
    {
        try {
            $script = Script::where('id', $id)->first();
            $script->code = $request->code;
            $script->save();

            return response()->json([
                'success' => true,
                'script' => $script
            ], 200);

        } catch (\Exception $e) {
            Log::error('Error en update ScriptController: ' . $e->getMessage());

			return response()->json([
				'success' => false,
				'message' => 'Error en update ScriptController: ' . $e->getMessage(),
			], 500);
        }
    }
}
