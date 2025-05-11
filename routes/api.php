<?php

use App\Http\Controllers\Api\ActiveStreamApiController;
//use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\MovieApiController;
use App\Http\Controllers\Api\AdApiController;
use App\Http\Controllers\Api\AdMovieControllerApiController;
use App\Http\Controllers\Api\GenderController;
use App\Http\Controllers\Api\LoginApiController;
use App\Http\Controllers\Api\MoviePlanController;
use App\Http\Controllers\Api\PlanController;
use App\Http\Controllers\Api\RedsysController;
use App\Http\Controllers\Api\UserSessionApiController;
use App\Http\Controllers\Api\UserApiController;
//use Illuminate\Support\Facades\Storage;

Route::middleware(['auth:sanctum'])->group(function () {
    Route::post('new-device', [UserSessionApiController::class, 'store']);
    Route::get('manage-devices', [UserSessionApiController::class, 'manage']);
    Route::get('check-device-id', [UserSessionApiController::class, 'checkDeviceId']);
    Route::delete('destroy-device' , [UserSessionApiController::class, 'destroy']);

    Route::post('select-plan', [UserApiController::class, 'selectPlan']);
    Route::post('cambiar-plan', [UserApiController::class, 'changePlan']);

    Route::get('content/{slug}', [MovieApiController::class, 'show']); 
	Route::get('edit-view-content/{id}', [MovieApiController::class, 'editShow']); 
    Route::get('ad/{slug}', [AdApiController::class, 'show']);
	Route::get('edit-view-ad/{id}', [AdApiController::class, 'editShow']); 
    Route::get('ads/{slug}', [AdMovieControllerApiController::class, 'getAds']);

    Route::post('logout', [LoginApiController::class, 'logout']);
    Route::get('user', [UserApiController::class, 'getCurrentUser']);
	Route::get('users', [UserApicontroller::class, 'index']);
    Route::get('user/{id}', [UserApiController::class, 'show']);
    Route::post('edit-user/{id}', [UserApiController::class, 'update']);
    Route::delete('delete-user', [UserApiController::class, 'destroy']);

    Route::post('check-active-streams', [ActiveStreamApiController::class, 'startStream']);
    Route::put('keep-alive', [ActiveStreamApiController::class, 'keepAlive']);

    Route::get('content-list', [MovieApiController::class, 'index']);
    Route::get('ads-list', [AdApiController::class, 'index']);
    Route::post('add-content', [MovieApiController::class, 'store']);
    Route::delete('delete-content', [MovieApiController::class, 'destroy']);
    Route::post('update-content/{id}', [MovieApiController::class, 'update']);
    Route::get('content-with-ads', [AdMovieControllerApiController::class, 'index']);
    Route::get('content-with-ads/{id}', [AdMovieControllerApiController::class, 'show']);
    Route::post('link-content-with-plans', [MoviePlanController::class, 'store']);
    Route::post('content-with-ads-destroy', [AdMovieControllerApiController::class, 'destroy']);

    Route::post('add-ad', [AdApiController::class, 'store']);
    Route::post('link-ads', [AdMovieControllerApiController::class, 'store']);
    Route::get('ads', [AdApiController::class, 'index']);
    Route::get('ad/{slug}', [AdApiController::class, 'show']);
    Route::post('update-ad/{id}', [AdApiController::class, 'update']);
    Route::delete('delete-ads', [AdApiController::class, 'destroy']);

    Route::get('plan/{id}', [PlanController::class, 'show']);
    Route::post('add-plan', [PlanController::class, 'store']);
    Route::post('edit-plan/{id}', [PlanController::class, 'update']);
    Route::delete('delete-plan', [PlanController::class, 'destroy']);

    Route::get('genders', [GenderController::class, 'index']);
    Route::get('gender/{id}', [GenderController::class, 'show']);
    Route::post('add-gender', [GenderController::class, 'store']);
    Route::post('edit-gender/{id}', [GenderController::class, 'update']);
    Route::delete('delete-gender', [GenderController::class, 'destroy']);
});

Route::post('register', [LoginApiController::class, 'register']);
Route::post('login', [LoginApiController::class, 'login']);
Route::get('content', [MovieApiController::class, 'index']);
Route::get('plans', [PlanController::class, 'index']);

Route::post('redsys-resp', [RedsysController::class, 'handleRedsysResponse']);