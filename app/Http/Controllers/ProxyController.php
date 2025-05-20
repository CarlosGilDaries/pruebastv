<?php

namespace App\Http\Controllers;

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\URL;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Cache;
use Illuminate\Http\Request;
use App\Models\Movie;

class ProxyController extends Controller
{
	public function proxyHLS(request $request, $movieId, $userId)
	{
		if (! $request->hasValidSignature()) {
			return response()->json(['success' => false, 'message' => 'Firma inválida'], 403);
		}

		try {
			$movie = Movie::findOrFail($movieId);

			// Obtener la URL original (ya codificada en la query string)
			$realUrl = request()->query('u');
			$url = $realUrl ? urldecode($realUrl) : $movie->url;

			// Descargar el contenido del .m3u8 original
			$response = Http::get($url);
			if (!$response->ok()) {
				return abort(404, 'Recurso no disponible');
			}

			$content = $response->body();
			$base = dirname($url); // Base para rutas relativas

			// Reescribir todas las líneas que apuntan a .ts o .m3u8 (relativas o absolutas)
			$rewritten = preg_replace_callback('/^(?!#)(https?:\/\/[^\s?#]+|\S+\.(ts|m3u8))([?#][^\r\n]*)?/im', function ($matches) use ($movieId, $userId, $base) {
				$path = $matches[1];              // Ruta relativa o absoluta
				$extra = $matches[3] ?? '';       // Sufijos como ?token=123

				// Si es ruta relativa, combinar con la base
				$fullUrl = str_starts_with($path, 'http') ? $path : $base . '/' . ltrim($path, '/');

				// Codificar la URL para incluirla como parámetro
				$encoded = urlencode($fullUrl);

				// Redirigir según el tipo de recurso
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

			// Devolver el nuevo playlist con rutas reescritas
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
			// Pedir el fragmento .ts como streaming
			$stream = Http::withOptions(['stream' => true])->get($url);
			if (!$stream->ok()) return abort(404);

			// Cabeceras adecuadas
			$headers = [
				'Content-Type' => $stream->header('Content-Type') ?? 'video/MP2T',
				'Cache-Control' => 'no-store',
			];

			// Incluir el tamaño si está disponible
			if ($stream->header('Content-Length')) {
				$headers['Content-Length'] = $stream->header('Content-Length');
			}

			// Devolver el contenido del fragmento en tiempo real
			return response()->stream(function () use ($stream) {
				while (!$stream->getBody()->eof()) {
					echo $stream->getBody()->read(8192);
					ob_flush();
					flush();
				}
			}, 200, $headers);

		} catch (\Exception $e) {
			Log::error('Error en proxyTS: ' . $e->getMessage());

			return response()->json([
				'success' => false,
				'message' => 'Error: ' . $e->getMessage(),
			], 500);
		}
	}
}
