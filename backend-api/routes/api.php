<?php

use App\Http\Controllers\Api\V1\CommunityApiController;
use App\Http\Controllers\Api\V1\FirebaseAuthSyncController;
use App\Http\Controllers\Api\V1\TodayApiController;
use App\Http\Controllers\Auth\PasswordController;
use App\Http\Controllers\DirectMessageController;
use App\Http\Controllers\InboxController;
use App\Http\Controllers\InboxThreadController;
use App\Http\Controllers\ProfileController;
use App\Http\Controllers\VerseHubController;
use App\Http\Controllers\VerseHubReflectionController;
use App\Http\Controllers\VersehubActionController;
use Illuminate\Support\Facades\Route;

Route::prefix('v1')->group(function (): void {
    Route::get('/today', [TodayApiController::class, 'show']);

    Route::post('/auth/firebase/sync', [FirebaseAuthSyncController::class, 'sync']);

    Route::get('/community/posts', [CommunityApiController::class, 'index']);
    Route::get('/community/posts/{memberPost}/comments', [CommunityApiController::class, 'commentsIndex']);
    Route::get('/versehub/{lang}/{ref}/mentor', [VerseHubController::class, 'mentorInsights'])
        ->whereIn('lang', ['id', 'en'])
        ->where('ref', '[a-z0-9]+(?:[-_.]\d+){1,3}');

    Route::middleware('auth:sanctum')->group(function (): void {
        Route::post('/community/posts', [CommunityApiController::class, 'store']);
        Route::post('/community/posts/{memberPost}/comments', [CommunityApiController::class, 'commentsStore']);
        Route::post('/community/posts/{memberPost}/pray', [CommunityApiController::class, 'togglePray']);
        Route::post('/community/posts/{memberPost}/bookmark', [CommunityApiController::class, 'toggleBookmark']);

        Route::get('/versehub/{lang}/reader-actions', [VersehubActionController::class, 'index'])
            ->whereIn('lang', ['id', 'en']);
        Route::post('/versehub/{lang}/reader-actions', [VersehubActionController::class, 'upsert'])
            ->whereIn('lang', ['id', 'en']);

        Route::get('/versehub/{lang}/reflections', [VerseHubReflectionController::class, 'index'])
            ->whereIn('lang', ['id', 'en']);
        Route::post('/versehub/{lang}/reflections', [VerseHubReflectionController::class, 'store'])
            ->whereIn('lang', ['id', 'en']);

        Route::post('/versehub/{lang}/{ref}/mentor/ask', [VerseHubController::class, 'mentorAsk'])
            ->whereIn('lang', ['id', 'en'])
            ->where('ref', '[a-z0-9]+(?:[-_.]\d+){1,3}');

        Route::get('/inbox', [InboxController::class, 'index']);
        Route::post('/inbox/read-all', [InboxController::class, 'markAllRead']);
        Route::post('/inbox/messages', [DirectMessageController::class, 'store']);
        Route::post('/inbox/messages/{directMessage}/approve', [DirectMessageController::class, 'approve']);
        Route::get('/inbox/{user}/messages', [DirectMessageController::class, 'thread'])
            ->whereNumber('user');
        Route::get('/inbox/{user}', [InboxThreadController::class, 'show'])
            ->whereNumber('user');

        Route::get('/profile', [ProfileController::class, 'edit']);
        Route::patch('/profile', [ProfileController::class, 'update']);
        Route::delete('/profile', [ProfileController::class, 'destroy']);
        Route::put('/profile/password', [PasswordController::class, 'update']);
        Route::post('/profile/two-factor/setup', [ProfileController::class, 'twoFactorSetup']);
        Route::post('/profile/two-factor/confirm', [ProfileController::class, 'twoFactorConfirm']);
        Route::delete('/profile/two-factor', [ProfileController::class, 'twoFactorDisable']);
        Route::post('/profile/two-factor/recovery-codes', [ProfileController::class, 'regenerateTwoFactorRecoveryCodes']);
    });
});
