<?php

use App\Http\Controllers\StudyPathController;
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
    ->where('ref', '[a-z0-9]+(?:[-_.]\d+){1,3}')
    ->name('versehub.og');

Route::get('/versehub/{lang}/{ref}', [VerseHubController::class, 'showLang'])
    ->whereIn('lang', ['id', 'en'])
    ->where('ref', '[a-z0-9]+(?:[-_.]\d+){1,3}')
    ->name('versehub.show');

Route::get('/versehub/{lang}/my-spiritual-journey', [App\Http\Controllers\VersehubActionController::class, 'mySpiritualJourney'])
    ->whereIn('lang', ['id', 'en']);

Route::get('/versehub/{lang}/{ref}/mentor', [VerseHubController::class, 'mentorInsights'])
    ->whereIn('lang', ['id', 'en'])
    ->where('ref', '[a-z0-9]+(?:[-_.]\d+){1,3}');

Route::post('/versehub/{lang}/{ref}/mentor/ask', [VerseHubController::class, 'mentorAsk'])
    ->whereIn('lang', ['id', 'en'])
    ->where('ref', '[a-z0-9]+(?:[-_.]\d+){1,3}');

Route::get('/versehub/{lang}/{ref}/mentor/og.png', [VerseHubController::class, 'mentorOgImage'])
    ->whereIn('lang', ['id', 'en'])
    ->where('ref', '[a-z0-9]+(?:[-_.]\d+){1,3}');

Route::get('/versehub/{lang}/study', [StudyPathController::class, 'index'])
    ->whereIn('lang', ['id', 'en']);

Route::get('/versehub/{lang}/study/{slug}/og.png', [StudyPathController::class, 'ogImage'])
    ->whereIn('lang', ['id', 'en']);

Route::redirect('/admin', '/admintalk/login', 302);
Route::redirect('/admin/login', '/admintalk/login', 302);

// Auth Redirections for Compatibility with Legacy Feature Tests
Route::get('/login', fn () => redirect('/admintalk/login'))->name('login');
Route::post('/login', fn () => redirect('/admintalk/login'));
Route::get('/register', fn () => redirect('/'))->name('register');
Route::post('/register', fn () => abort(403));
Route::match(['get', 'post'], '/logout', function () {
    Auth::logout();

    return redirect('/');
})->name('logout');
Route::match(['get', 'post'], '/forgot-password', fn () => redirect('/'))->name('password.request');
Route::match(['get', 'post'], '/reset-password', fn () => redirect('/'))->name('password.reset');
Route::match(['get', 'post'], '/verify-email', fn () => redirect('/'))->name('verification.notice');
Route::get('/verify-email/{id}/{hash}', fn () => redirect('/'))->name('verification.verify');
Route::post('/email/verification-notification', fn () => redirect('/'))->name('verification.send');
Route::match(['get', 'post'], '/confirm-password', fn () => redirect('/'))->name('password.confirm');
Route::get('/profile', fn () => redirect('/'))->name('profile.edit');
