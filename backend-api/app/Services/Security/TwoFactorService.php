<?php

namespace App\Services\Security;

use App\Models\User;
use BaconQrCode\Renderer\ImageRenderer;
use BaconQrCode\Writer;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;
use PragmaRX\Google2FAQRCode\Google2FA;

class TwoFactorService
{
    public function __construct(
        protected Google2FA $google2fa,
    ) {}

    public function isEnabled(User $user): bool
    {
        return filled($user->app_authentication_secret);
    }

    public function generateSecret(): string
    {
        return $this->google2fa->generateSecretKey(16);
    }

    public function generateQrCodeDataUri(User $user, string $secret): string
    {
        $inlineQrCode = $this->google2fa->getQRCodeInline(
            config('app.name', 'TheChoosenTalks'),
            (string) $user->email,
            $secret,
        );

        // Fallback when imagick is unavailable.
        if (
            class_exists(Writer::class) &&
            class_exists(ImageRenderer::class) &&
            (! extension_loaded('imagick'))
        ) {
            return 'data:image/svg+xml;base64,'.base64_encode($inlineQrCode);
        }

        return $inlineQrCode;
    }

    /**
     * @return array<string>
     */
    public function generateRecoveryCodes(int $count = 8): array
    {
        return collect()->times($count, fn (): string => Str::random(10).'-'.Str::random(10))->all();
    }

    public function verifyCode(string $secret, string $code): bool
    {
        return $this->google2fa->verifyKey($secret, $code, 2);
    }

    public function enable(User $user, string $secret, array $recoveryCodes): void
    {
        $user->forceFill([
            'app_authentication_secret' => $secret,
            'app_authentication_recovery_codes' => array_map(
                fn (string $code): string => Hash::make($code),
                $recoveryCodes
            ),
        ])->save();
    }

    public function disable(User $user): void
    {
        $user->forceFill([
            'app_authentication_secret' => null,
            'app_authentication_recovery_codes' => null,
        ])->save();
    }

    /**
     * @return array<string>
     */
    public function regenerateRecoveryCodes(User $user, int $count = 8): array
    {
        $codes = $this->generateRecoveryCodes($count);

        $user->forceFill([
            'app_authentication_recovery_codes' => array_map(
                fn (string $code): string => Hash::make($code),
                $codes
            ),
        ])->save();

        return $codes;
    }

    public function verifyRecoveryCode(User $user, string $recoveryCode): bool
    {
        $stored = is_array($user->app_authentication_recovery_codes)
            ? $user->app_authentication_recovery_codes
            : [];

        $remaining = [];
        $matched = false;

        foreach ($stored as $hashedCode) {
            if (! $matched && Hash::check($recoveryCode, (string) $hashedCode)) {
                $matched = true;

                continue;
            }

            $remaining[] = $hashedCode;
        }

        if ($matched) {
            $user->forceFill([
                'app_authentication_recovery_codes' => $remaining,
            ])->save();
        }

        return $matched;
    }
}
