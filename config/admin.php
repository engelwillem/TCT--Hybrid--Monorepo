<?php

return [
    /*
    |--------------------------------------------------------------------------
    | Admin alerts & restrictions
    |--------------------------------------------------------------------------
    |
    | These are used by the Filament admin panel and security notifications.
    | Keep them in env so they can be rotated safely.
    |
    */

    // Where to send admin-login security notifications.
    'alert_email' => env('ADMIN_ALERT_EMAIL'),

    // Optional hard restriction for admin password reset flows.
    // If set, only this email can request & complete a reset.
    'password_reset_email' => env('ADMIN_PASSWORD_RESET_EMAIL'),
];
