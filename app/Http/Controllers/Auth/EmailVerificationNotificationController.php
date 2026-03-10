<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\URL;
use Throwable;

class EmailVerificationNotificationController extends Controller
{
    /**
     * Send a new email verification notification.
     */
    public function store(Request $request): RedirectResponse
    {
        if ($request->user()->hasVerifiedEmail()) {
            return redirect()->intended(route('today.index', [], false));
        }

        try {
            $request->user()->sendEmailVerificationNotification();
        } catch (Throwable $e) {
            report($e);

            // Local/dev fallback: provide a direct signed verification URL so users
            // can continue verification flow even if SMTP is not reachable yet.
            if (app()->environment('local')) {
                $user = $request->user();
                $expiresAt = now()->addMinutes(60);
                $verificationUrl = URL::temporarySignedRoute(
                    'verification.verify',
                    $expiresAt,
                    [
                        'id' => $user->getKey(),
                        'hash' => sha1($user->getEmailForVerification()),
                    ]
                );

                return back()->with([
                    'status' => 'verification-link-dev-fallback',
                    'verification_url' => $verificationUrl,
                    'verification_link_expires_at' => $expiresAt->toIso8601String(),
                ]);
            }

            return back()->with('status', 'verification-link-failed');
        }

        return back()->with('status', 'verification-link-sent');
    }
}
