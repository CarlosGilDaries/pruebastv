<?php

namespace App\Http\Controllers;

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\URL;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Cache;
use Illuminate\Http\Request;
use App\Models\Movie;
use Illuminate\Support\Facades\Storage;

class ProxyController extends Controller
{
	public function proxyHLS(Request $request, $movieId, $userId)
	{
		if (! $request->hasValidSignature()) {
			return response()->json(['success' => false, 'message' => 'Firma inválida'], 403);
		}

		try {
			$movie = Movie::findOrFail($movieId);

			$realUrl = request()->query('u');
			$url = $realUrl ? urldecode($realUrl) : $movie->url;

			// Detectar si es ruta interna (archivo en storage privado)
			$isInternal = !str_starts_with($url, 'http');

			if ($isInternal) {
				// Elimina slashes iniciales y normaliza la ruta
				$cleanPath = preg_replace('#^file/#', 'content/', ltrim($url, '/'));
				if (!Storage::disk('private')->exists($cleanPath)) {
					return abort(404, 'Archivo no encontrado: ' . $cleanPath);
				}

				$content = Storage::disk('private')->get($cleanPath);
				$base = dirname($cleanPath);
			} else {
				// Recurso remoto
				$response = Http::get($url);
				if (!$response->ok()) {
					return abort(404, 'Recurso remoto no disponible');
				}

				$content = $response->body();
				$base = dirname($url);
			}

			// Reescribir las líneas con enlaces .ts o .m3u8
			$rewritten = preg_replace_callback('/^(?!#)(https?:\/\/[^\s?#]+|\S+\.(ts|m3u8))([?#][^\r\n]*)?/im', function ($matches) use ($movieId, $userId, $base, $isInternal) {
				$path = $matches[1];
				$extra = $matches[3] ?? '';

				// Resolver ruta completa
				if (!str_starts_with($path, 'http') && !$isInternal) {
					$fullUrl = $base . '/' . ltrim($path, '/');
				} elseif ($isInternal) {
					$fullUrl = $base . '/' . ltrim($path, '/');
				} else {
					$fullUrl = $path;
				}

				$encoded = urlencode($fullUrl);

				// Generar ruta firmada
				if (str_ends_with($path, '.ts')) {
					return URL::signedRoute('proxy.ts', [
						'movieId' => $movieId,
						'userId' => $userId,
						'u' => $encoded
					]) . $extra;
				} else {
					return URL::signedRoute('proxy.m3u8', [
						'movieId' => $movieId,
						'userId' => $userId,
						'u' => $encoded,
					]) . $extra;
				}
			}, $content);

			return response($rewritten, 200, [
				'Content-Type' => 'application/vnd.apple.mpegurl',
				'Cache-Control' => 'no-store',
			]);
		} catch (\Exception $e) {
			Log::error('Error en proxyHLS: ' . $e->getMessage());

			return response()->json([
				'success' => false,
				'message' => 'Error: ' . $e->getMessage(),
			], 500);
		}
	}

	public function proxyTS($movieId, $userId)
	{
		$encoded = request()->query('u');
		$url = urldecode($encoded);

		try {
			if (!str_starts_with($url, 'http')) {
				$cleanPath = ltrim($url, '/');

				if (!Storage::disk('private')->exists($cleanPath)) {
					return abort(404);
				}

				$stream = Storage::disk('private')->readStream($cleanPath);

				return response()->stream(function () use ($stream) {
					fpassthru($stream);
					fclose($stream);
				}, 200, [
					'Content-Type' => 'video/MP2T',
					'Cache-Control' => 'no-store',
				]);
			}

			// Si es remoto
			$stream = Http::withOptions(['stream' => true])->get($url);
			if (!$stream->ok()) return abort(404);

			return response()->stream(function () use ($stream) {
				while (!$stream->getBody()->eof()) {
					echo $stream->getBody()->read(8192);
					ob_flush();
					flush();
				}
			}, 200, [
				'Content-Type' => $stream->header('Content-Type') ?? 'video/MP2T',
				'Cache-Control' => 'no-store',
				'Content-Length' => $stream->header('Content-Length') ?? null,
			]);
		} catch (\Exception $e) {
			Log::error('Error en proxyTS: ' . $e->getMessage());

			return response()->json([
				'success' => false,
				'message' => 'Error: ' . $e->getMessage(),
			], 500);
		}
	}
}
