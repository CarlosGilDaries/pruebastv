<?php
use Illuminate\Support\Facades\Route;
use Illuminate\Support\Facades\Storage;
use App\Http\Controllers\Api\MovieApiController;
use App\Http\Controllers\ProxyController;
use Barryvdh\DomPDF\Facade\Pdf;
use App\Http\Controllers\BillPdfController;

Route::get('/file/{path}', function ($path) {
    $filePathMovie = "content/{$path}";
    $filePathAd = "ads/{$path}";
    $filePathAction = "actions/{$path}";
    $filePathSettings = "settings/{$path}";
    $filePathGenders = "genders/{$path}";
    $filePathCategories = "categories/{$path}";
    $filePathTags = "tags/{$path}";

    if (Storage::disk('private')->exists($filePathMovie)) {
        return response()->file(storage_path("app/private/{$filePathMovie}"));
    }

    if (Storage::disk('private')->exists($filePathAd)) {
        return response()->file(storage_path("app/private/{$filePathAd}"));
    }

    if (Storage::disk('private')->exists($filePathAction)) {
        return response()->file(storage_path("app/private/{$filePathAction}"));
    }
    
    if (Storage::disk('private')->exists($filePathSettings)) {
        return response()->file(storage_path("app/private/{$filePathSettings}"));
    }

    if (Storage::disk('private')->exists($filePathGenders)) {
        return response()->file(storage_path("app/private/{$filePathGenders}"));
    }

    if (Storage::disk('private')->exists($filePathCategories)) {
        return response()->file(storage_path("app/private/{$filePathCategories}"));
    }

    if (Storage::disk('private')->exists($filePathTags)) {
        return response()->file(storage_path("app/private/{$filePathTags}"));
    }

    abort(404);
})->where('path', '[a-zA-Z0-9\/\-_.]+');

Route::get('/bills/{path}', function ($path) {
    $fullPath = "bills/{$path}";

    if (Storage::disk('private')->exists($fullPath)) {
        return response()->file(storage_path("app/private/{$fullPath}"));
    }

    abort(404);
})->where('path', '.*')->name('bills.view');

Route::get('bill-path-from-order/{reference}', [BillPdfController::class, 'returnBillPathFromReference']);
Route::get('bill-path/{billId}', [BillPdfController::class, 'returnBillPathFromBillId']);
Route::get('/bill/{id}/download', [BillPdfController::class, 'download'])->name('bill.download');

Route::get('/proxy/hls/{movieId}/{userId}', [ProxyController::class, 'proxyHLS'])
	->name('proxy.m3u8')
	->middleware('signed');

Route::get('/proxy/ts/{movieId}/{userId}', [ProxyController::class, 'proxyTS'])
	->name('proxy.ts')
	->middleware('signed');

Route::get('/secure-stream/{movie}/{user}', [MovieApiController::class, 'streamSigned'])
	->name('secure.stream')
	->middleware(['signed']);

Route::get('/test-pdf', function() {
    $pdf = Pdf::loadHTML('<h1>Test domPDF</h1>');
    return $pdf->stream();
});

Route::get('/pdf', [BillPdfController::class, 'basicInvoice']);


