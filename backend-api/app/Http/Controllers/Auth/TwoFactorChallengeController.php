<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Services\Security\TwoFactorService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use Inertia\Response;

class TwoFactorChallengeController extends Controller
{
    public function create(Request $request): Response|RedirectResponse
    {
        if (Auth::check()) {
            return redirect()->intended(route('today.index', [], false));
        }

        if (! $request->session()->has('auth.2fa.user_id')) {
            return redirect()->route('login');
        }

        return Inertia::render('Auth/TwoFactorChallenge');
    }

    public function store(Request $request, TwoFactorService $twoFactorService): RedirectResponse
    {
        $request->validate([
            'code' => ['required', 'string', 'min:6', 'max:32'],
        ]);

        $pendingUserId = (int) $request->session()->get('auth.2fa.user_id');
        if ($pendingUserId <= 0) {
            return redirect()->route('login');
        }

        /** @var User|null $user */
        $user = User::query()->find($pendingUserId);
        if (! $user || blank($user->app_authentication_secret)) {
            $request->session()->forget(['auth.2fa.user_id', 'auth.2fa.remember']);

            return redirect()->route('login');
        }

        $code = (string) $request->input('code');
        $isValid = $twoFactorService->verifyCode((string) $user->app_authentication_secret, $code);
        if (! $isValid) {
            $isValid = $twoFactorService->verifyRecoveryCode($user, $code);
        }

        if (! $isValid) {
            return back()->withErrors([
                'code' => 'Kode OTP / recovery code tidak valid.',
            ]);
        }

        $remember = (bool) $request->session()->pull('auth.2fa.remember', false);
        $request->session()->forget('auth.2fa.user_id');
        Auth::login($user, $remember);
        $request->session()->regenerate();

        return redirect()->intended(route('today.index', [], false));
    }
}

