<?php

return [
    'enabled' => env('WA_SHEET_SYNC_ENABLED', false),
    'sheet_id' => env('WA_SHEET_SYNC_SHEET_ID', ''),
    'gid' => env('WA_SHEET_SYNC_GID', '0'),
    'client_key' => env('WA_SHEET_SYNC_CLIENT_KEY', ''),
    'secret_key' => env('WA_SHEET_SYNC_SECRET_KEY', ''),
    'timeout_seconds' => (int) env('WA_SHEET_SYNC_TIMEOUT_SECONDS', 30),
];

