<?php

use App\Http\Controllers\Api\ActiveStreamApiController;
//use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\MovieApiController;
use App\Http\Controllers\Api\AdApiController;
use App\Http\Controllers\Api\AdMovieControllerApiController;
use App\Http\Controllers\Api\BillController;
use App\Http\Controllers\Api\CategoryController;
use App\Http\Controllers\Api\GenderController;
use App\Http\Controllers\Api\LoginApiController;
use App\Http\Controllers\Api\MoviePlanController;
use App\Http\Controllers\Api\PlanController;
use App\Http\Controllers\Api\RedsysController;
use App\Http\Controllers\Api\UserSessionApiController;
use App\Http\Controllers\Api\UserApiController;
use App\Http\Controllers\Api\PlanOrderController;
use App\Http\Controllers\Api\PpvOrderController;
use App\Http\Controllers\Api\CompanyDetailController;
//use Illuminate\Support\Facades\Storage;

Route::middleware(['auth:sanctum'])->group(function () {
	Route::get('content/datatable', [MovieApiController::class, 'datatable']);
    Route::get('orders/datatable', [PlanOrderController::class, 'datatable']);
    Route::get('plans/datatable', [PlanController::class, 'datatable']);
    Route::get('users/datatable', [UserApiController::class, 'datatable']);
    Route::get('ads/datatable', [AdApiController::class, 'datatable']);
    Route::get('genders/datatable', [GenderController::class, 'datatable']);
    Route::get('bills/datatable', [BillController::class, 'datatable']);
    Route::get('categories/datatable', [CategoryController::class, 'datatable']);

    Route::post('new-device', [UserSessionApiController::class, 'store']);
    Route::get('manage-devices', [UserSessionApiController::class, 'manage']);
    Route::delete('destroy-device' , [UserSessionApiController::class, 'destroy']);

    Route::post('logout', [LoginApiController::class, 'logout']);
    Route::get('user', [UserApiController::class, 'getCurrentUser']);
	Route::get('users', [UserApicontroller::class, 'index']);
	Route::get('user/{id}', [UserApiController::class, 'show']);
    Route::post('edit-user/{id}', [UserApiController::class, 'update']);
    Route::delete('delete-user', [UserApiController::class, 'destroy']);

    Route::post('check-active-streams', [ActiveStreamApiController::class, 'startStream']);
    Route::put('keep-alive', [ActiveStreamApiController::class, 'keepAlive']);

    Route::get('content/{slug}', [MovieApiController::class, 'show']); 
	Route::get('edit-view-content/{id}', [MovieApiController::class, 'editShow']); 
    Route::post('add-content', [MovieApiController::class, 'store']);
    Route::delete('delete-content', [MovieApiController::class, 'destroy']);
    Route::post('update-content/{id}', [MovieApiController::class, 'update']);

    Route::get('ads-list', [AdApiController::class, 'index']);
    Route::post('add-ad', [AdApiController::class, 'store']);
    Route::get('ads', [AdApiController::class, 'index']);
    Route::get('ad/{slug}', [AdApiController::class, 'show']);
    Route::post('update-ad/{id}', [AdApiController::class, 'update']);
    Route::delete('delete-ads', [AdApiController::class, 'destroy']);
	Route::get('edit-view-ad/{id}', [AdApiController::class, 'editShow']); 

    Route::get('content-with-ads', [AdMovieControllerApiController::class, 'index']);
    Route::get('content-with-ads/{id}', [AdMovieControllerApiController::class, 'show']);
    Route::post('link-ads', [AdMovieControllerApiController::class, 'store']);
    Route::post('content-with-ads-destroy', [AdMovieControllerApiController::class, 'destroy']);
    Route::get('ads/{slug}', [AdMovieControllerApiController::class, 'getAds']);

    Route::get('plan/{id}', [PlanController::class, 'show']);
    Route::post('add-plan', [PlanController::class, 'store']);
    Route::post('edit-plan/{id}', [PlanController::class, 'update']);
    Route::delete('delete-plan', [PlanController::class, 'destroy']);

    Route::post('link-content-with-plans', [MoviePlanController::class, 'store']);

    Route::post('add-gender', [GenderController::class, 'store']);
    Route::post('edit-gender/{id}', [GenderController::class, 'update']);
    Route::delete('delete-gender', [GenderController::class, 'destroy']);
	
	Route::get('orders', [PlanOrderController::class, 'index']);
    Route::post('add-order', [PlanOrderController::class, 'store']);
    Route::post('edit-order/{id}', [PlanOrderController::class, 'update']);
    Route::delete('delete-order', [PlanOrderController::class, 'destroy']);
	
	Route::get('ppv-orders', [PpvOrderController::class, 'index']);
	Route::get('ppv-current-user-order/{id}', [PpvOrderController::class, 'currentUserOrder']);
    Route::post('add-ppv-order', [PpvOrderController::class, 'store']);
    Route::post('edit-ppv-order/{id}', [PpvOrderController::class, 'update']);
    Route::delete('delete-ppv-order', [PpvOrderController::class, 'destroy']);

    Route::delete('delete-bill', [BillController::class, 'destroy']);

    Route::post('add-category', [CategoryController::class, 'store']);
    Route::post('edit-category/{id}', [CategoryController::class, 'update']);
    Route::delete('delete-category', [CategoryController::class, 'destroy']);
	
	Route::post('select-plan', [RedsysController::class, 'selectPlan']);
	Route::post('ppv-payment', [RedsysController::class, 'ppvPayment']);
	
	Route::get('/signed-url/{movieId}', [MovieApiController::class, 'getSignedUrl']);
});

//Route::get('check-device-id', [UserSessionApiController::class, 'checkDeviceId']);
Route::post('register', [LoginApiController::class, 'register']);
Route::post('login', [LoginApiController::class, 'login']);
Route::get('content', [MovieApiController::class, 'index']);
Route::get('plans', [PlanController::class, 'index']);
Route::get('categories', [CategoryController::class, 'index']);
Route::get('dropdown-categories-menu', [CategoryController::class, 'dropDownMenu']);
Route::get('genders', [GenderController::class, 'index']);
Route::get('gender/{id}', [GenderController::class, 'show']);
Route::get('category/{id}', [CategoryController::class, 'show']);

Route::get('company-details', [CompanyDetailController::class, 'show'])
	->name('company-details');

Route::post('redsys-plan-resp', [RedsysController::class, 'handlePlanRedsysResponse']);
Route::post('redsys-ppv-resp', [RedsysController::class, 'handlePpvRedsysResponse']);

Route::get('order/{id}', [PlanOrderController::class, 'show'])
	->name('plan-order.show');
Route::get('ppv-order/{id}', [PpvOrderController::class, 'show'])
	->name('ppv-order.show');