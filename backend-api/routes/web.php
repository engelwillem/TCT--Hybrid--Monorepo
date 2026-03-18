<?php

use App\Http\Controllers\VerseHubController;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Route;

Route::get('/', function () {
    return redirect()->to(env('NEXT_PUBLIC_APP_URL', 'http://localhost:3000'));
})->name('landing.index');

Route::get('/auth/ping', function () {
    return response()->noContent()
        ->header('X-Auth', Auth::check() ? '1' : '0');
})->name('auth.ping');

Route::get('/versehub/{lang}/{ref}/og.png', [VerseHubController::class, 'ogImageLang'])
    ->whereIn('lang', ['id', 'en'])
    ->where('ref', '[a-z0-9]+(?:[-_.]\d+){2,3}')
    ->name('versehub.og');

Route::get('/versehub/{lang}/{ref}', [VerseHubController::class, 'showLang'])
    ->whereIn('lang', ['id', 'en'])
    ->where('ref', '[a-z0-9]+(?:[-_.]\d+){2,3}')
    ->name('versehub.show');

Route::redirect('/admin', '/admintalk/login', 302);
Route::redirect('/admin/login', '/admintalk/login', 302);
