<?php

use App\Http\Controllers\Api\V1\CommunityApiController;
use App\Http\Controllers\Api\V1\FirebaseAuthSyncController;
use App\Http\Controllers\Api\V1\TodayApiController;
use Illuminate\Support\Facades\Route;

Route::prefix('v1')->group(function (): void {
    Route::get('/today', [TodayApiController::class, 'show']);

    Route::post('/auth/firebase/sync', [FirebaseAuthSyncController::class, 'sync']);

    Route::get('/community/posts', [CommunityApiController::class, 'index']);
    Route::get('/community/posts/{memberPost}/comments', [CommunityApiController::class, 'commentsIndex']);

    Route::middleware('auth:sanctum')->group(function (): void {
        Route::post('/community/posts', [CommunityApiController::class, 'store']);
        Route::post('/community/posts/{memberPost}/comments', [CommunityApiController::class, 'commentsStore']);
        Route::post('/community/posts/{memberPost}/pray', [CommunityApiController::class, 'togglePray']);
        Route::post('/community/posts/{memberPost}/bookmark', [CommunityApiController::class, 'toggleBookmark']);
    });
});
