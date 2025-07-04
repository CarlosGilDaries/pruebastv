<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class AdRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function rules(): array
    {
        return [
            'title' => 'required|max:255',
            'brand' => 'required|max:25',
            'content' => [
                'required_if:type,video/mp4,audio/mp3',
                function ($attribute, $value, $fail) {
                    $type = request('type');

                    if ($type !== 'application/vnd.apple.mpegurl') {
                        if ($type === 'video/mp4' && !in_array($value->getClientOriginalExtension(), ['mp4'])) {
                            $fail('Debe subir un archivo en formato MP4.');
                        }

                        if ($type === 'audio/mp3' && !in_array($value->getClientOriginalExtension(), ['mp3'])) {
                            $fail('Debe subir un archivo en formato MP3.');
                        }
                    }
                }
            ],
            'type' => 'required|in:video/mp4,application/vnd.apple.mpegurl,audio/mp3',
            'm3u8' => 'required_if:type,application/vnd.apple.mpegurl|mimetypes:text/plain',
            'ts1' => 'required_if:type,application/vnd.apple.mpegurl|mimes:zip',
            'ts2' => 'required_if:type,application/vnd.apple.mpegurl|mimes:zip',
            'ts3' => 'required_if:type,application/vnd.apple.mpegurl|mimes:zip'
        ];
    }

    public function messages()
    {
        return [
            'title.required' => 'El título es obligatorio',
            'title.max' => 'Máximo de 255 caracteres',

            'brand.required' => 'La marca es obligatoria',
            'brand.max' => 'Máximo 25 caracteres',

            'content.required' => 'El contenido es obligatorio',
            'content.mimes' => 'El contenido debe ser mp4 o mp3',
            
            'm3u8.required_if' => 'El contenido es obligatorio',
            'm3u8.mimetypes' => 'El contenido debe ser un archivo m3u8',

            'ts1.required_if' => 'El ZIP de la playlist 1 es obligatorio',
            'ts1.mimes' => 'El archivo de la playlist 1 debe ser zip',

            'ts2.required_if' => 'El ZIP de la playlist 2 es obligatorio',
            'ts2.mimes' => 'El archivo de la playlist 2 debe ser zip',

            'ts3.required_if' => 'El ZIP de la playlist 3 es obligatorio',
            'ts3.mimes' => 'El archivo de la playlist 3 debe ser zip'
        ];
    }
}
