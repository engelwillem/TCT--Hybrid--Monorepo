<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Notifications\WelcomeNewMember;
use Illuminate\Auth\Events\Registered;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Config;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;
use Illuminate\Validation\Rules;
use Throwable;
use Inertia\Inertia;
use Inertia\Response;

class RegisteredUserController extends Controller
{
    /**
     * Display the registration view.
     */
    public function create(): Response
    {
        return Inertia::render('Auth/Register');
    }

    /**
     * Handle an incoming registration request.
     *
     * @throws \Illuminate\Validation\ValidationException
     */
    public function store(Request $request): RedirectResponse
    {
        $normalizedEmail = Str::lower(trim((string) $request->input('email', '')));
        $request->merge([
            'email' => $normalizedEmail,
        ]);

        $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|string|lowercase|email|max:255|unique:'.User::class,
            'password' => ['required', 'confirmed', Rules\Password::defaults()],
        ]);

        $user = User::create([
            'name' => $request->name,
            'email' => $request->email,
            'password' => Hash::make($request->password),
            'is_admin' => in_array(
                $request->email,
                collect(explode(',', (string) Config::get('auth.bootstrap_admin_emails', '')))
                    ->map(fn (string $value): string => Str::lower(trim($value)))
                    ->filter()
                    ->values()
                    ->all(),
                true
            ),
        ]);

        $verificationStatus = 'verification-link-sent';
        try {
            $hasRegisteredListeners = app('events')->hasListeners(Registered::class);
            event(new Registered($user));
            if (! $hasRegisteredListeners && method_exists($user, 'sendEmailVerificationNotification')) {
                $user->sendEmailVerificationNotification();
            }
        } catch (Throwable $e) {
            report($e);
            $verificationStatus = 'verification-link-failed';
        }

        // Send a first “welcome” message/notification from Admin.
        // (Stored as a database notification so it can show up in the UI bell icon.)
        try {
            $user->notify(new WelcomeNewMember());
        } catch (Throwable $e) {
            report($e);
        }

        Auth::login($user);

        // Keep new members in verification flow first.
        return redirect()->route('verification.notice')->with('status', $verificationStatus);
    }
}
