<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Movie;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Illuminate\Database\QueryException;
use Illuminate\Support\Facades\DB;

class MoviePlanController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        try {
            $movies = Movie::all();
            $moviePlans = $movies->plans;

            return response()->json([
                'success' => true,
                'data' => [
                    'movies' => $movies,
                    'plans' => $moviePlans,
                ],
                'message' => 'Películas con sus planes obtenidas con éxito.'
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
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        try {           
            foreach ($request->plans as $plan) {
                 if (!isset($plan['id'])){
                    continue;
                }

                DB::table('movie_plan')->insert([
                    'movie_id' => $request->content_id,
                    'plan_id' => $plan['id'],
                    'created_at' => now(),
                    'updated_at' => now(),
                ]);
            }

            return response()->json([
                'success' => true,
                'message' => 'Contenido vinculado a planes con éxito.'
            ], 201);

        } catch (\Exception $e) {
            Log::error('Error: ' . $e->getMessage());

            return response()->json([
                'success' => false,
                'message' => 'Error: ' . $e->getMessage(),
            ], 500);

        } catch (QueryException $e) {
            Log::error('Error: ' . $e->getMessage());

            if ($e->getCode() == 23000) {
                return response()->json([
                    'success' => false,
                    'message' => 'El contenido y el plan ya están vinculados.'
                ], 409);
            }
            return response()->json([
                'success' => false,
                'message' => 'Error: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Display the specified resource.
     */
    public function show($slug)
    {
        
    }


    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, string $id)
    {
        //
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $id)
    {
        //
    }
}
