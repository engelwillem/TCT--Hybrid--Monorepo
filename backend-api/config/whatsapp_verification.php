<?php

return [
    'otp_length' => (int) env('WHATSAPP_OTP_LENGTH', 6),
    'otp_expiry_minutes' => (int) env('WHATSAPP_OTP_EXPIRY_MINUTES', 10),
    'otp_max_attempts' => (int) env('WHATSAPP_OTP_MAX_ATTEMPTS', 5),
    'request_cooldown_seconds' => (int) env('WHATSAPP_OTP_REQUEST_COOLDOWN_SECONDS', 60),
    'default_country_code' => (string) env('WHATSAPP_DEFAULT_COUNTRY_CODE', '62'),
    'client_key' => env('WHATSAPP_VERIFICATION_CLIENT_KEY', 'CLIENT_DEMO_001'),
    'fallback_fonnte_token' => env('FONNTE_TOKEN'),
];

