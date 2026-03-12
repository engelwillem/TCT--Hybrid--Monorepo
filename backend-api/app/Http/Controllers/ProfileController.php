<?php

namespace App\Http\Controllers;

use App\Http\Requests\ProfileUpdateRequest;
use App\Models\AdminAuditLog;
use App\Models\Post;
use App\Models\SsDay;
use App\Services\Security\TwoFactorService;
use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\File;
use Illuminate\Support\Facades\Redirect;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;
use Inertia\Response;

class ProfileController extends Controller
{
    /**
     * Display the user's profile form.
     */
    public function edit(Request $request): Response
    {
        $isAdminViewer = (bool) ($request->user()?->is_admin ?? false);
        $opsGateway = $isAdminViewer ? $this->buildOpsGatewaySummary() : null;

        // Settings UI lives in the main app page.
        return Inertia::render('Profile', [
            'mustVerifyEmail' => $request->user() instanceof MustVerifyEmail,
            'status' => session('status'),
            'opsGateway' => $opsGateway,
            'twoFactor' => [
                'enabled' => filled($request->user()?->app_authentication_secret),
                'recoveryCodesRemaining' => is_array($request->user()?->app_authentication_recovery_codes)
                    ? count($request->user()->app_authentication_recovery_codes)
                    : 0,
            ],
        ]);
    }

    /**
     * Update the user's profile information.
     */
    public function update(ProfileUpdateRequest $request): RedirectResponse
    {
        $validated = $request->validated();

        $user = $request->user();

        // Handle avatar upload (optional).
        if ($request->hasFile('avatar')) {
            $path = $request->file('avatar')->store('avatars', 'public');

            // Clean up old avatar if exists.
            if ($user->avatar_path) {
                try {
                    Storage::disk('public')->delete($user->avatar_path);
                    $this->deletePublicAvatarMirror($user->avatar_path);
                } catch (\Throwable) {
                    // ignore
                }
            }

            $this->syncPublicAvatarMirror($path);

            $validated['avatar_path'] = $path;
        }

        unset($validated['avatar']);

        $user->fill($validated);

        if ($user->isDirty('email')) {
            $user->email_verified_at = null;
        }

        $user->save();

        return Redirect::route('settings.index');
    }

    /**
     * Delete the user's account.
     */
    public function destroy(Request $request): RedirectResponse
    {
        $request->validate([
            'password' => ['required', 'current_password'],
        ]);

        $user = $request->user();

        Auth::logout();

        $user->delete();

        $request->session()->invalidate();
        $request->session()->regenerateToken();

        return Redirect::to('/');
    }

    public function twoFactorSetup(Request $request, TwoFactorService $twoFactorService): JsonResponse
    {
        $request->validate([
            'current_password' => ['required', 'current_password'],
        ]);

        $user = $request->user();
        if (! $user) {
            abort(401);
        }

        $secret = $twoFactorService->generateSecret();
        $recoveryCodes = $twoFactorService->generateRecoveryCodes();
        $qrCodeDataUri = $twoFactorService->generateQrCodeDataUri($user, $secret);

        $request->session()->put('profile.2fa.setup', [
            'secret' => $secret,
            'recovery_codes' => $recoveryCodes,
        ]);

        return response()->json([
            'secret' => $secret,
            'qrCodeDataUri' => $qrCodeDataUri,
            'recoveryCodes' => $recoveryCodes,
        ]);
    }

    public function twoFactorConfirm(Request $request, TwoFactorService $twoFactorService): RedirectResponse
    {
        $request->validate([
            'current_password' => ['required', 'current_password'],
            'code' => ['required', 'digits:6'],
        ]);

        $setup = $request->session()->get('profile.2fa.setup');
        if (! is_array($setup) || blank($setup['secret'] ?? null)) {
            return Redirect::route('settings.index')->with('status', 'two-factor-setup-expired');
        }

        $secret = (string) ($setup['secret'] ?? '');
        $recoveryCodes = is_array($setup['recovery_codes'] ?? null)
            ? $setup['recovery_codes']
            : [];

        if (! $twoFactorService->verifyCode($secret, (string) $request->input('code'))) {
            return Redirect::route('settings.index')->withErrors([
                'two_factor_code' => 'Kode 2FA tidak valid.',
            ]);
        }

        $user = $request->user();
        if (! $user) {
            abort(401);
        }

        $twoFactorService->enable($user, $secret, $recoveryCodes);
        $request->session()->forget('profile.2fa.setup');

        return Redirect::route('settings.index')->with('status', 'two-factor-enabled');
    }

    public function twoFactorDisable(Request $request, TwoFactorService $twoFactorService): RedirectResponse
    {
        $request->validate([
            'current_password' => ['required', 'current_password'],
            'code' => ['required', 'string', 'min:6', 'max:32'],
        ]);

        $user = $request->user();
        if (! $user) {
            abort(401);
        }

        $secret = (string) ($user->app_authentication_secret ?? '');
        $code = (string) $request->input('code');

        $isValid = $secret !== '' && $twoFactorService->verifyCode($secret, $code);
        if (! $isValid) {
            $isValid = $twoFactorService->verifyRecoveryCode($user, $code);
        }

        if (! $isValid) {
            return Redirect::route('settings.index')->withErrors([
                'two_factor_code' => 'Kode OTP / recovery code tidak valid.',
            ]);
        }

        $twoFactorService->disable($user);
        $request->session()->forget('profile.2fa.setup');

        return Redirect::route('settings.index')->with('status', 'two-factor-disabled');
    }

    public function regenerateTwoFactorRecoveryCodes(Request $request, TwoFactorService $twoFactorService): JsonResponse
    {
        $request->validate([
            'current_password' => ['required', 'current_password'],
            'code' => ['required', 'string', 'min:6', 'max:32'],
        ]);

        $user = $request->user();
        if (! $user) {
            abort(401);
        }

        $secret = (string) ($user->app_authentication_secret ?? '');
        $code = (string) $request->input('code');

        $isValid = $secret !== '' && $twoFactorService->verifyCode($secret, $code);
        if (! $isValid) {
            $isValid = $twoFactorService->verifyRecoveryCode($user, $code);
        }

        if (! $isValid) {
            return response()->json([
                'message' => 'Kode OTP / recovery code tidak valid.',
            ], 422);
        }

        $codes = $twoFactorService->regenerateRecoveryCodes($user);

        return response()->json([
            'recoveryCodes' => $codes,
        ]);
    }

    private function buildOpsGatewaySummary(): array
    {
        $viewer = auth()->user();
        $isAdminViewer = (bool) ($viewer?->is_admin ?? false);
        $now = now();
        $last24h = $now->copy()->subDay();

        $overdueScheduled = Post::query()
            ->where('status', 'scheduled')
            ->where('publish_at', '<', $now)
            ->count();

        $failedJobs24h = 0;
        if (Schema::hasTable('failed_jobs')) {
            $failedJobs24h = (int) DB::table('failed_jobs')
                ->where('failed_at', '>=', $last24h)
                ->count();
        }

        $securitySignals = (int) AdminAuditLog::query()
            ->where('created_at', '>=', $last24h)
            ->where(function ($q) {
                $q->where('action', 'like', '%deny%')
                    ->orWhere('action', 'like', '%forbid%')
                    ->orWhere('action', 'like', '%mfa%')
                    ->orWhere('action', 'like', '%security%')
                    ->orWhere('action', 'like', '%critical%');
            })
            ->count();

        $ssDaysTotal = SsDay::query()->count();
        $ssDaysPublished = SsDay::query()->where('status', 'published')->count();
        $ssCoveragePercent = $ssDaysTotal > 0
            ? (int) round(($ssDaysPublished / $ssDaysTotal) * 100)
            : 0;

        $riskScore = min(
            100,
            ($failedJobs24h * 18)
            + ($securitySignals * 10)
            + ($overdueScheduled * 6)
            + (max(0, 70 - $ssCoveragePercent))
        );

        $status = match (true) {
            $riskScore >= 70 => 'High Risk',
            $riskScore >= 35 => 'Needs Attention',
            default => 'Healthy',
        };

        $topAction = match (true) {
            $overdueScheduled > 0 => 'Publish scheduled post yang tertunda.',
            $failedJobs24h > 0 => 'Periksa antrian proses backend yang gagal.',
            $ssCoveragePercent < 70 => 'Lengkapi konten Sabbath School yang belum publish.',
            default => 'Tidak ada aksi kritis, lanjutkan monitoring rutin.',
        };

        // For admins, the "Status Today" chip should deep-link directly
        // to the most relevant backoffice action (no searching in dashboard).
        // For non-admins, keep pointing to the safe Ops Visibility page.
        $statusHref = route('settings.ops-visibility');

        if ($isAdminViewer) {
            $statusHref = match (true) {
                $overdueScheduled > 0 => route('filament.admin.pages.ops-triage') . '#scheduled-overdue',
                $ssCoveragePercent < 70 => route('filament.admin.pages.ops-triage') . '#ss-needs-publish',
                $failedJobs24h > 0 => route('filament.admin.pages.ops-triage') . '#backend-queue',
                $securitySignals > 0 => route('filament.admin.pages.ops-triage') . '#security',
                default => route('filament.admin.pages.ops-triage'),
            };
        }

        return [
            'status' => $status,
            'riskScore' => $riskScore,
            'topAction' => $topAction,
            'statusHref' => $statusHref,
        ];
    }

    /**
     * Ensure /storage/<path> remains readable even when public/storage is a real directory
     * (not a symlink to storage/app/public), which happens on some shared-hosting setups.
     */
    private function syncPublicAvatarMirror(string $relativePath): void
    {
        try {
            $publicStorageRoot = public_path('storage');

            // If storage symlink exists and works, no mirror needed.
            if (is_link($publicStorageRoot)) {
                return;
            }

            $source = storage_path('app/public/' . ltrim($relativePath, '/'));
            $target = $publicStorageRoot . DIRECTORY_SEPARATOR . ltrim($relativePath, '/');

            if (! is_file($source)) {
                return;
            }

            File::ensureDirectoryExists(dirname($target));
            File::copy($source, $target);
        } catch (\Throwable) {
            // Non-fatal: avatar is still stored on public disk.
        }
    }

    private function deletePublicAvatarMirror(string $relativePath): void
    {
        try {
            $publicStorageRoot = public_path('storage');
            if (is_link($publicStorageRoot)) {
                return;
            }

            $target = $publicStorageRoot . DIRECTORY_SEPARATOR . ltrim($relativePath, '/');
            if (is_file($target)) {
                File::delete($target);
            }
        } catch (\Throwable) {
            // Ignore mirror cleanup failures.
        }
    }
}
