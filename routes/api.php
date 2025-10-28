<?php

use App\Http\Controllers\Api\ActionController;
use App\Http\Controllers\Api\ActiveStreamApiController;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\MovieApiController;
use App\Http\Controllers\Api\AdApiController;
use App\Http\Controllers\Api\AdMovieControllerApiController;
use App\Http\Controllers\Api\BillController;
use App\Http\Controllers\Api\CategoryController;
use App\Http\Controllers\Api\GenderController;
use App\Http\Controllers\Api\LoginApiController;
use App\Http\Controllers\Api\PlanController;
use App\Http\Controllers\Api\RedsysController;
use App\Http\Controllers\Api\UserSessionApiController;
use App\Http\Controllers\Api\UserApiController;
use App\Http\Controllers\Api\PlanOrderController;
use App\Http\Controllers\Api\PpvOrderController;
use App\Http\Controllers\Api\CompanyDetailController;
use App\Http\Controllers\Api\ContactController;
use App\Http\Controllers\Api\CookieController;
use App\Http\Controllers\Api\EmailConfigController;
use App\Http\Controllers\Api\EmailTemplateController;
use App\Http\Controllers\Api\EmailVerificationNotificationController;
use App\Http\Controllers\Api\FavoritesController;
use App\Http\Controllers\Api\FooterItemController;
use App\Http\Controllers\Api\LanguageController;
use App\Http\Controllers\Api\LegalNoticeController;
use App\Http\Controllers\Api\PayPalController;
use App\Http\Controllers\Api\PermissionController;
use App\Http\Controllers\Api\RoleController;
use App\Http\Controllers\Api\VerifyEmailController;
use App\Http\Controllers\Api\MovieProgressController;
use App\Http\Controllers\Api\NewPasswordController;
use App\Http\Controllers\Api\PasswordResetLinkController;
use App\Http\Controllers\Api\PaymentPoliticController;
use App\Http\Controllers\Api\PrivacyPoliticController;
use App\Http\Controllers\Api\RentController;
use App\Http\Controllers\Api\RentOrderController;
use App\Http\Controllers\Api\TagController;
use App\Http\Controllers\Api\ViewedContentController;
use App\Http\Middleware\EnsureEmailIsVerified;
use App\Http\Middleware\CheckPermissions;

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
    Route::post('current-user-edit', [UserApiController::class, 'currentUserChange']);

    // Rutas de contenido protegidas
    Route::middleware([
        CheckPermissions::class . ':contenido',
    ])->group(function () {
        Route::get('content/{type}/datatable', [MovieApiController::class, 'datatable']);
        Route::get('edit-view-content/{id}/{type}', [MovieApiController::class, 'editShow']); 
        Route::post('add-content/{type}', [MovieApiController::class, 'store']);
        Route::delete('delete-content/{type}', [MovieApiController::class, 'destroy']);
        Route::post('update-content/{id}/{type}', [MovieApiController::class, 'update']);
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
    Route::get('reset-free-expiration', [PlanController::class, 'resetFreeExpiration']);
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
        Route::post('add-ppv-order', [PpvOrderController::class, 'store']);
        Route::post('edit-ppv-order/{id}', [PpvOrderController::class, 'update']);
        Route::delete('delete-ppv-order', [PpvOrderController::class, 'destroy']);
    });

    Route::get('ppv-current-user-order/{id}', [PpvOrderController::class, 'currentUserOrder']);
    Route::get('paid-resources', [UserApiController::class, 'getContentOrders']);
    Route::get('current-user-orders', [UserApiController::class, 'getOrders']);
    Route::get('get-bill/{reference}', [UserApiController::class, 'getBill']);
	
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

    // Rutas de Etiquetas protegidas
    Route::middleware([
        CheckPermissions::class . ':etiquetas',
    ])->group(function () {
        Route::get('tags/datatable', [TagController::class, 'datatable']);
        Route::post('add-tag', [TagController::class, 'store']);
        Route::post('edit-tag/{id}', [TagController::class, 'update']);
        Route::delete('delete-tag', [TagController::class, 'destroy']);
    });

    // Rutas de Ajustes Web protegidas
    Route::middleware([
        CheckPermissions::class . ':ajustes_web',
    ])->group(function () {
        Route::post('edit-company-details', [CompanyDetailController::class, 'update']);
    });

    // Rutas de Mail Config protegidas
    Route::middleware([
        CheckPermissions::class . ':ajustes_mail',
    ])->group(function () {
        Route::get('mail-config', [EmailConfigController::class, 'index']);
        Route::post('edit-mail-config', [EmailConfigController::class, 'update']);
        Route::get('mail-templates', [EmailTemplateController::class, 'index']);
        Route::post('edit-template/{id}', [EmailTemplateController::class, 'update']);
    });

        // Rutas de Footer Items protegidas
    Route::middleware([
        CheckPermissions::class . ':footer_items',
    ])->group(function () {
        Route::get('footer-items/datatable', [FooterItemController::class, 'datatable']);
        Route::get('footer-item/{id}', [FooterItemController::class, 'show']);
        Route::post('add-footer-item', [FooterItemController::class, 'store']);
        Route::post('edit-footer-item/{id}', [FooterItemController::class, 'update']);
        Route::delete('delete-footer-item', [FooterItemController::class, 'destroy']);
    });

    // Rutas de Aviso Legal protegidas
    Route::middleware([
        CheckPermissions::class . ':aviso_legal',
    ])->group(function () {
        Route::get('legal-notice/datatable', [LegalNoticeController::class, 'datatable']);
        Route::get('legal-notice/{id}', [LegalNoticeController::class, 'show']);
        Route::post('add-legal-notice', [LegalNoticeController::class, 'store']);
        Route::post('edit-legal-notice/{id}', [LegalNoticeController::class, 'update']);
        Route::delete('delete-legal-notice', [LegalNoticeController::class, 'destroy']);
    });

    // Rutas de Polítiva de Privacidad protegidas
    Route::middleware([
        CheckPermissions::class . ':politica_privacidad',
    ])->group(function () {
        Route::get('privacy-politic/datatable', [PrivacyPoliticController::class, 'datatable']);
        Route::get('privacy-politic/{id}', [PrivacyPoliticController::class, 'show']);
        Route::post('add-privacy-politic', [PrivacyPoliticController::class, 'store']);
        Route::post('edit-privacy-politic/{id}', [PrivacyPoliticController::class, 'update']);
        Route::delete('delete-privacy-politic', [PrivacyPoliticController::class, 'destroy']);
    });

        // Rutas de Cookies protegidas
    Route::middleware([
        CheckPermissions::class . ':cookies',
    ])->group(function () {
        Route::get('cookies/datatable', [CookieController::class, 'datatable']);
        Route::get('cookie/{id}', [CookieController::class, 'show']);
        Route::post('add-cookie', [CookieController::class, 'store']);
        Route::post('edit-cookie/{id}', [CookieController::class, 'update']);
        Route::delete('delete-cookie', [CookieController::class, 'destroy']);
    });

        // Rutas de Política de Pagos protegidas
    Route::middleware([
        CheckPermissions::class . ':politica_pagos',
    ])->group(function () {
        Route::get('payment-politic/datatable', [PaymentPoliticController::class, 'datatable']);
        Route::get('payment-politic/{id}', [PaymentPoliticController::class, 'show']);
        Route::post('add-payment-politic', [PaymentPoliticController::class, 'store']);
        Route::post('edit-payment-politic/{id}', [PaymentPoliticController::class, 'update']);
        Route::delete('delete-payment-politic', [PaymentPoliticController::class, 'destroy']);
    });

        // Rutas de Idiomas protegidas
    Route::middleware([
        CheckPermissions::class . ':idiomas',
    ])->group(function () {
        Route::get('languages/datatable', [LanguageController::class, 'datatable']);
        Route::post('add-language', [LanguageController::class, 'store']);
        Route::post('edit-language/{code}', [LanguageController::class, 'update']);
        Route::delete('delete-language', [LanguageController::class, 'destroy']);
    });

    Route::get('permissions', [PermissionController::class, 'index']);
    Route::get('permission/{id}', [PermissionController::class, 'show']);
    Route::post('add-permission', [PermissionController::class, 'store']);
    Route::get('all-languages', [LanguageController::class, 'allLang']);
	
	Route::post('select-plan', [RedsysController::class, 'selectPlan']);
	Route::post('ppv-payment', [RedsysController::class, 'ppvPayment']);
    Route::post('rent-payment', [RedsysController::class, 'rentPayment']);

    Route::post('/paypal/create', [PayPalController::class, 'paypalCreatePlanOrder'])->name('paypal.create');
	Route::post('/paypal/ppv/create', [PayPalController::class, 'paypalCreatePpvOrder'])->name('paypal.ppv.create');
    Route::post('/paypal/rent/create', [PayPalController::class, 'paypalCreateRentOrder'])->name('paypal.rent.create');

	Route::get('/signed-url/{movieId}', [MovieApiController::class, 'getSignedUrl']);

    Route::get('/movie-progress', [MovieProgressController::class, 'index']);
    Route::post('/movie-progress', [MovieProgressController::class, 'store']);
    Route::get('/movie-progress/{movieId}', [MovieProgressController::class, 'show']);
    Route::delete('/movie-progress/{movieId}', [MovieProgressController::class, 'destroy']);

    Route::get('check-if-rented/{movieId}', [RentController::class, 'show']);
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
Route::get('tags', [TagController::class, 'index']);
Route::get('tag/{id}', [TagController::class, 'show']);
Route::get('footer-items', [FooterItemController::class, 'index']);
Route::get('legal-notice', [LegalNoticeController::class, 'index']);
Route::get('privacy-politic', [PrivacyPoliticController::class, 'index']);
Route::get('cookies', [CookieController::class, 'index']);
Route::get('payment-politic', [PaymentPoliticController::class, 'index']);
Route::get('languages', [LanguageController::class, 'index']);
Route::get('language/{code}', [LanguageController::class, 'show']);

Route::get('check-email/{email}', [LoginApiController::class, 'checkEmail']);
Route::get('check-dni/{dni}', [LoginApiController::class, 'checkDni']);

Route::get('company-details', [CompanyDetailController::class, 'show'])
	->name('company-details');
Route::post('/send-contact-email', [ContactController::class, 'sendEmail']);

Route::post('redsys-plan-resp', [RedsysController::class, 'handlePlanRedsysResponse']);
Route::post('redsys-ppv-resp', [RedsysController::class, 'handlePpvRedsysResponse']);
Route::post('redsys-rent-resp', [RedsysController::class, 'handleRentRedsysResponse']);

Route::get('order/{id}', [PlanOrderController::class, 'show'])
	->name('plan-order.show');
Route::get('ppv-order/{id}', [PpvOrderController::class, 'show'])
	->name('ppv-order.show');
Route::get('rent-order/{id}', [RentOrderController::class, 'show'])
	->name('rent-order.show');

Route::get('/verify-email/{id}/{hash}', VerifyEmailController::class)
    ->middleware(['throttle:6,1'])
    ->name('verification.verify');

Route::post('/email/verification-notification', [EmailVerificationNotificationController::class, 'store'])
                ->middleware(['auth:sanctum', 'throttle:6,1'])
                ->name('verification.send');

Route::post('/forgot-password', [PasswordResetLinkController::class, 'store'])
                ->middleware('guest')
                ->name('password.email');

Route::post('/reset-password', [NewPasswordController::class, 'store'])
                ->middleware('guest')
                ->name('password.store');

Route::get('/paypal/capture', [PayPalController::class, 'paypalCapturePlanOrder'])->name('paypal.capture');
Route::get('/paypal/ppv/capture', [PayPalController::class, 'paypalCapturePpvOrder'])->name('paypal.ppv.capture');
Route::get('/paypal/rent/capture', [PayPalController::class, 'paypalCaptureRentOrder'])->name('paypal.rent.capture');
Route::get('/paypal/cancel', [PayPalController::class, 'paypalCancel'])->name('paypal.cancel');

Route::post('rent/{userId}/{movieId}', [RentController::class, 'store'])->name('rent.create');

Route::get('/translations/{locale}', function ($locale) {
    if (!in_array($locale, ['es', 'en', 'va'])) {
        return response()->json(['error' => 'Language not supported'], 400);
    }
    
    $translations = [
        'messages' => require resource_path("lang/$locale/messages.php"),
    ];
    
    return response()->json($translations);
});