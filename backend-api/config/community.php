<?php

return [
    // Only this account can upload community video files.
    // Keep the value in env so production can rotate safely.
    'video_upload_admin_email' => env('COMMUNITY_VIDEO_UPLOAD_ADMIN_EMAIL', 'engel.willem@gmail.com'),
];
