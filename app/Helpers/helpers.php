<?php

function getClientIp() {
    if (!empty($_SERVER['HTTP_CLIENT_IP'])) {
        return $_SERVER['HTTP_CLIENT_IP']; // IP from shared internet
    } elseif (!empty($_SERVER['HTTP_X_FORWARDED_FOR'])) {
        // IP from proxies, could be a comma-separated list
        return explode(',', $_SERVER['HTTP_X_FORWARDED_FOR'])[0];
    } elseif (!empty($_SERVER['REMOTE_ADDR'])) {
        return $_SERVER['REMOTE_ADDR']; // IP from remote address
    }
    return 'Unknown IP';
}

if (!function_exists('sanitize_html')) {
    function sanitize_html($dirtyHtml)
    {
        return app('purifier')->purify($dirtyHtml);
    }
}

if (!function_exists('generateSignature')) {
    function generateSignature($merchantParametersBase64, $order, $secretKey) {
        // 1. Decodifica la clave Base64
        $decodedKey = base64_decode($secretKey);
        
        // 2. Diversificación 3DES
        $l = ceil(strlen($order) / 8) * 8;
        $order = $order.str_repeat("\0", $l - strlen($order));
        $key3DES = substr(openssl_encrypt($order, 'des-ede3-cbc', $decodedKey, OPENSSL_RAW_DATA, "\0\0\0\0\0\0\0\0"), 0, $l);
        
        // 3. Calcula HMAC-SHA256
        $hmac = hash_hmac(
            'sha256',
            $merchantParametersBase64,
            $key3DES,
            true // Salida binaria
        );
        
        // 4. Codifica en Base64
        return base64_encode($hmac);
    }
}