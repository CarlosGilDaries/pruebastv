<?php

namespace App\Rules;

use Closure;
use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class ReCaptcha implements ValidationRule
{
    /**
     * Run the validation rule.
     *
     * @param  \Closure(string, ?string=): \Illuminate\Translation\PotentiallyTranslatedString  $fail
     */
    public function validate(string $attribute, mixed $value, Closure $fail): void
    {
        $response = Http::get("https://www.google.com/recaptcha/api/siteverify", [
            "secret" => env('GOOGLE_RECAPTCHA_SECRET'),
            'response' => $value
        ])->json();

        if (!$response['success']) {
            $fail("The Google ReCaptcha is not validate.");
            Log::info($response);
        } else {
            Log::info($response);
        }
    }
}
