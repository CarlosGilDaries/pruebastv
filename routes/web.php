<?php
use Illuminate\Support\Facades\Route;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Storage;
use Illuminate\Http\Request;
use App\Http\Controllers\Api\MovieApiController;
use App\Http\Controllers\ProxyController;

Route::get('/file/{path}', function ($path) {
    $filePathMovie = "content/{$path}";
    $filePathAd = "ads/{$path}";

    if (Storage::disk('private')->exists($filePathMovie)) {
        return response()->file(storage_path("app/private/{$filePathMovie}"));
    }

    if (Storage::disk('private')->exists($filePathAd)) {
        return response()->file(storage_path("app/private/{$filePathAd}"));
    }

    abort(404);
})->where('path', '[a-zA-Z0-9\/\-_.]+');

Route::get('/secure-stream/{movie}/{user}', [MovieApiController::class, 'streamSigned'])
	->name('secure.stream')
	->middleware(['signed']);;

Route::get('/proxy/hls/{movieId}/{userId}', [ProxyController::class, 'proxyHLS'])
	->name('proxy.m3u8')
	->middleware('signed');

Route::get('/proxy/ts/{movieId}/{userId}', [ProxyController::class, 'proxyTS'])
	->name('proxy.ts')
	->middleware('signed');



