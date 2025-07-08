<?php

use App\Http\Controllers\Api\ActionController;
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
use App\Http\Controllers\Api\EmailVerificationNotificationController;
use App\Http\Controllers\Api\FavoritesController;
use App\Http\Controllers\Api\PayPalController;
use App\Http\Controllers\Api\PermissionController;
use App\Http\Controllers\Api\RoleController;
use App\Http\Controllers\Api\VerifyEmailController;
use App\Http\Controllers\Api\ViewedContentController;
use App\Http\Middleware\EnsureEmailIsVerified;
use App\Http\Middleware\CheckPermissions;

//use Illuminate\Support\Facades\Storage;

Route::middleware(['auth:sanctum'])->group(function () {
    Route::post('new-device', [UserSessionApiController::class, 'store']);
    Route::get('manage-devices', [UserSessionApiController::class, 'manage']);
    Route::delete('destroy-device' , [UserSessionApiController::class, 'destroy']);

    Route::post('logout', [LoginApiController::class, 'logout']);

    Route::post('check-active-streams', [ActiveStreamApiController::class, 'startStream']);
    Route::put('keep-alive', [ActiveStreamApiController::class, 'keepAlive']);

    // Rutas de Usuarios protegidas
    Route::middleware([
        CheckPermissions::class . ':usuarios',
    ])->group(function () {
        Route::post('edit-user/{id}', [UserApiController::class, 'update']);
        Route::delete('delete-user', [UserApiController::class, 'destroy']);
        Route::get('users/datatable', [UserApiController::class, 'datatable']);
    });  

    Route::get('user', [UserApiController::class, 'getCurrentUser']);
	Route::get('users', [UserApicontroller::class, 'index']);
	Route::get('user/{id}', [UserApiController::class, 'show']); 
    Route::post('current-user-edit/{id}', [UserApiController::class, 'currentUserChange']);

    // Rutas de contenido protegidas
    Route::middleware([
        CheckPermissions::class . ':contenido',
    ])->group(function () {
        Route::get('content/{type}/datatable', [MovieApiController::class, 'datatable']);
        Route::get('edit-view-content/{id}', [MovieApiController::class, 'editShow']); 
        Route::post('add-content', [MovieApiController::class, 'store']);
        Route::delete('delete-content', [MovieApiController::class, 'destroy']);
        Route::post('update-content/{id}', [MovieApiController::class, 'update']);
    });

    Route::get('content/{slug}', [MovieApiController::class, 'show'])
        ->middleware(EnsureEmailIsVerified::class);
    Route::get('favorites', [FavoritesController::class, 'getFavorites']);
    Route::post('add-favorite/{id}', [FavoritesController::class, 'addFavorite']);
    Route::post('quit-favorite/{id}', [FavoritesController::class, 'quitFavorite']);
    Route::get('viewed', [ViewedContentController::class, 'getViewedContent']);
    Route::post('add-viewed/{id}', [ViewedContentController::class, 'viewed']);

    // Rutas de anuncios protegidas
    Route::middleware([
        CheckPermissions::class . ':anuncios',
    ])->group(function () {
        Route::post('add-ad', [AdApiController::class, 'store']);
        Route::post('update-ad/{id}', [AdApiController::class, 'update']);
        Route::delete('delete-ads', [AdApiController::class, 'destroy']);
        Route::get('edit-view-ad/{id}', [AdApiController::class, 'editShow']); 
        Route::post('link-ads', [AdMovieControllerApiController::class, 'store']);
        Route::post('content-with-ads-destroy', [AdMovieControllerApiController::class, 'destroy']);
        Route::get('ads/datatable', [AdApiController::class, 'datatable']);
    });

    Route::get('ads-list', [AdApiController::class, 'index']);
    Route::get('ads', [AdApiController::class, 'index']);
    Route::get('ad/{slug}', [AdApiController::class, 'show']);

    Route::get('content-with-ads', [AdMovieControllerApiController::class, 'index']);
    Route::get('content-with-ads/{id}', [AdMovieControllerApiController::class, 'show']);
    Route::get('ads/{slug}', [AdMovieControllerApiController::class, 'getAds']);

    // Rutas de planes protegidas
    Route::middleware([
        CheckPermissions::class . ':planes',
    ])->group(function () {
        Route::get('plans/datatable', [PlanController::class, 'datatable']);
        Route::post('add-plan', [PlanController::class, 'store']);
        Route::post('edit-plan/{id}', [PlanController::class, 'update']);
        Route::delete('delete-plan', [PlanController::class, 'destroy']);
    });

    Route::get('plan/{id}', [PlanController::class, 'show']);
    //Route::post('link-content-with-plans', [MoviePlanController::class, 'store']);

    // Rutas de Géneros protegidas
    Route::middleware([
        CheckPermissions::class . ':generos',
    ])->group(function () {
        Route::get('genders/datatable', [GenderController::class, 'datatable']);
        Route::post('add-gender', [GenderController::class, 'store']);
        Route::post('edit-gender/{id}', [GenderController::class, 'update']);
        Route::delete('delete-gender', [GenderController::class, 'destroy']);
    });

    // Rutas de Pedidos protegidas
    Route::middleware([
        CheckPermissions::class . ':pedidos',
    ])->group(function () {
        Route::get('orders', [PlanOrderController::class, 'index']);
        Route::post('add-order', [PlanOrderController::class, 'store']);
        Route::post('edit-order/{id}', [PlanOrderController::class, 'update']);
        Route::delete('delete-order', [PlanOrderController::class, 'destroy']);
        Route::get('orders/datatable', [PlanOrderController::class, 'datatable']);
        Route::get('ppv-orders', [PpvOrderController::class, 'index']);
        Route::get('ppv-current-user-order/{id}', [PpvOrderController::class, 'currentUserOrder']);
        Route::post('add-ppv-order', [PpvOrderController::class, 'store']);
        Route::post('edit-ppv-order/{id}', [PpvOrderController::class, 'update']);
        Route::delete('delete-ppv-order', [PpvOrderController::class, 'destroy']);
    });

    Route::get('current-user-orders', [UserApiController::class, 'getOrders']);
    Route::get('get-bill/{id}', [UserApiController::class, 'getBill']);
	
    // Rutas de facturas protegidas
    Route::middleware([
        CheckPermissions::class . ':facturas',
    ])->group(function () {
        Route::delete('delete-bill', [BillController::class, 'destroy']);
        Route::get('bills/datatable', [BillController::class, 'datatable']);
    });

    // Rutas de Categorías protegidas
    Route::middleware([
        CheckPermissions::class . ':categorias',
    ])->group(function () {
        Route::post('add-category', [CategoryController::class, 'store']);
        Route::post('edit-category/{id}', [CategoryController::class, 'update']);
        Route::delete('delete-category', [CategoryController::class, 'destroy']);
        Route::get('categories/datatable', [CategoryController::class, 'datatable']);
    }); 
    
    // Rutas de LLamadas a la Acción protegidas
    Route::middleware([
        CheckPermissions::class . ':llamadas_a_accion',
    ])->group(function () {
        Route::post('add-action', [ActionController::class, 'store']);
        Route::post('edit-action/{id}', [ActionController::class, 'update']);
        Route::delete('delete-action', [ActionController::class, 'destroy']);
        Route::get('actions/datatable', [ActionController::class, 'datatable']);
    });

    Route::get('action/{id}', [ActionController::class, 'show']);

    // Rutas de Roles protegidas
    Route::middleware([
        CheckPermissions::class . ':roles',
    ])->group(function () {
        Route::post('add-role', [RoleController::class, 'store']);
        Route::post('edit-role/{id}', [RoleController::class, 'update']);
        Route::post('role/{id}/permissions', [RoleController::class, 'assignPermissions']);
        Route::delete('delete-role', [RoleController::class, 'destroy']);
        Route::post('user/{id}/role', [UserApiController::class, 'setRole']);
        Route::get('roles/datatable', [RoleController::class, 'datatable']);
    });  

    Route::get('roles', [RoleController::class, 'index']);
    Route::get('role/{id}', [RoleController::class, 'show']);

    Route::get('permissions', [PermissionController::class, 'index']);
    Route::get('permission/{id}', [PermissionController::class, 'show']);
    Route::post('add-permission', [PermissionController::class, 'store']);
	
	Route::post('select-plan', [RedsysController::class, 'selectPlan']);
	Route::post('ppv-payment', [RedsysController::class, 'ppvPayment']);

    Route::post('/paypal/create', [PayPalController::class, 'paypalCreatePlanOrder'])->name('paypal.create');
	
	Route::get('/signed-url/{movieId}', [MovieApiController::class, 'getSignedUrl']);
});

Route::get('check-device-id', [UserSessionApiController::class, 'checkDeviceId']);
Route::post('register', [LoginApiController::class, 'register']);
Route::post('login', [LoginApiController::class, 'login']);
Route::get('content', [MovieApiController::class, 'index']);
Route::get('plans', [PlanController::class, 'index']);
Route::get('categories', [CategoryController::class, 'index']);
Route::get('dropdown-categories-menu', [CategoryController::class, 'dropDownMenu']);
Route::get('genders', [GenderController::class, 'index']);
Route::get('gender/{id}', [GenderController::class, 'show']);
Route::get('category/{id}', [CategoryController::class, 'show']);
Route::get('actions', [ActionController::class, 'index']);

Route::get('company-details', [CompanyDetailController::class, 'show'])
	->name('company-details');

Route::post('redsys-plan-resp', [RedsysController::class, 'handlePlanRedsysResponse']);
Route::post('redsys-ppv-resp', [RedsysController::class, 'handlePpvRedsysResponse']);

Route::get('order/{id}', [PlanOrderController::class, 'show'])
	->name('plan-order.show');
Route::get('ppv-order/{id}', [PpvOrderController::class, 'show'])
	->name('ppv-order.show');

Route::get('/verify-email/{id}/{hash}', VerifyEmailController::class)
    ->middleware(['throttle:6,1'])
    ->name('verification.verify');

Route::post('/email/verification-notification', [EmailVerificationNotificationController::class, 'store'])
                ->middleware(['auth:sanctum', 'throttle:6,1'])
                ->name('verification.send');

Route::get('/paypal/capture', [PayPalController::class, 'paypalCaptureOrder'])->name('paypal.capture');
Route::get('/paypal/cancel', [PayPalController::class, 'paypalCancel'])->name('paypal.cancel');