<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class AdMovieRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'content_id' => 'required|exists:movies,id',
            'ads' => 'required|array|min:1',
            'ads.*.id' => 'exists:ads,id',
            'ads.*.type' => 'required|in:preroll,midroll,postroll,overlay',
            'ads.*.skippable' => 'sometimes|boolean',
        ];
    }

    public function withValidator($validator)
    {
        $validator->after(function ($validator) {
            $ads = $this->input('ads', []);

            foreach ($ads as $index => $ad) {
                if (isset($ad['type']) && $ad['type'] === 'midroll') {
                    if (!isset($ad['midroll_time']) || !is_numeric($ad['midroll_time']) || $ad['midroll_time'] < 1) {
                        $validator->errors()->add("ads.$index.midroll_time", "El tiempo de midroll debe ser un número mayor o igual a 1.");
                    }
                }

                if (isset($ad['skippable']) && $ad['skippable'] == 1) {
                    if (!isset($ad['skip_time']) || !is_numeric($ad['skip_time']) || $ad['skip_time'] < 5 || $ad['skip_time'] > 15) {
                        $validator->errors()->add("ads.$index.skip_time", "El tiempo para saltar debe estar entre 5 y 15 segundos.");
                    }
                }
            }
        });
    }
}
