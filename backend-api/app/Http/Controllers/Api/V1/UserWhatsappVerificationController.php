<?php

namespace App\Http\Controllers\Api\V1;

use App\Enums\WhatsappVerificationStatus;
use App\Http\Controllers\Controller;
use App\Http\Requests\RequestWhatsappOtpRequest;
use App\Http\Requests\VerifyWhatsappOtpRequest;
use App\Models\UserWhatsappVerification;
use App\Services\Whatsapp\WhatsappOtpDeliveryService;
use App\Support\WhatsappPhoneNormalizer;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;

class UserWhatsappVerificationController extends Controller
{
    public function status(Request $request): JsonResponse
    {
        $user = $request->user();
        $latest = UserWhatsappVerification::query()
            ->where('user_id', $user->id)
            ->latest('id')
            ->first();

        return response()->json([
            'data' => [
                'phone' => $latest?->phone,
                'normalized_phone' => $latest?->normalized_phone,
                'status' => $latest?->status?->value ?? WhatsappVerificationStatus::PENDING->value,
                'verified' => (bool) $latest?->verified_at,
                'verified_at' => $latest?->verified_at?->toIso8601String(),
                'expires_at' => $latest?->expires_at?->toIso8601String(),
            ],
        ]);
    }

    public function requestOtp(RequestWhatsappOtpRequest $request, WhatsappOtpDeliveryService $deliveryService): JsonResponse
    {
        $user = $request->user();
        $phone = trim((string) $request->input('phone'));
        $normalized = WhatsappPhoneNormalizer::normalize(
            $phone,
            (string) config('whatsapp_verification.default_country_code', '62')
        );

        if (! $normalized) {
            return response()->json(['message' => 'Nomor WhatsApp tidak valid.'], 422);
        }

        $now = now();
        $cooldownSeconds = max(10, (int) config('whatsapp_verification.request_cooldown_seconds', 60));
        $recent = UserWhatsappVerification::query()
            ->where('user_id', $user->id)
            ->where('normalized_phone', $normalized)
            ->where('status', WhatsappVerificationStatus::PENDING->value)
            ->where('requested_at', '>=', $now->copy()->subSeconds($cooldownSeconds))
            ->latest('id')
            ->first();

        if ($recent) {
            return response()->json([
                'message' => 'OTP baru saja dikirim. Coba lagi sebentar.',
            ], 429);
        }

        UserWhatsappVerification::query()
            ->where('user_id', $user->id)
            ->where('normalized_phone', $normalized)
            ->where('status', WhatsappVerificationStatus::PENDING->value)
            ->update(['status' => WhatsappVerificationStatus::CANCELLED->value]);

        $otp = $this->generateOtp();
        $expiryMinutes = max(1, (int) config('whatsapp_verification.otp_expiry_minutes', 10));
        $expiresAt = $now->copy()->addMinutes($expiryMinutes);
        $message = "Kode verifikasi TheChosenTalks Anda: {$otp}. Berlaku {$expiryMinutes} menit. Jangan bagikan kode ini.";

        $sent = false;
        try {
            $sent = $deliveryService->send($normalized, $message);
        } catch (\Throwable) {
            $sent = false;
        }

        $verification = UserWhatsappVerification::query()->create([
            'user_id' => $user->id,
            'wa_client_id' => $deliveryService->resolveClientId(),
            'phone' => $phone,
            'normalized_phone' => $normalized,
            'status' => $sent ? WhatsappVerificationStatus::PENDING->value : WhatsappVerificationStatus::FAILED->value,
            'verification_code_hash' => Hash::make($otp),
            'requested_at' => $now,
            'expires_at' => $expiresAt,
            'attempt_count' => 0,
            'last_error' => $sent ? null : 'delivery_failed',
        ]);

        if (! $sent) {
            return response()->json([
                'message' => 'Gagal mengirim OTP WhatsApp. Coba lagi nanti.',
            ], 502);
        }

        return response()->json([
            'message' => 'OTP verifikasi WhatsApp telah dikirim.',
            'data' => [
                'status' => $verification->status->value,
                'expires_at' => $verification->expires_at?->toIso8601String(),
            ],
        ]);
    }

    public function verifyOtp(VerifyWhatsappOtpRequest $request): JsonResponse
    {
        $user = $request->user();
        $phone = trim((string) $request->input('phone'));
        $normalized = WhatsappPhoneNormalizer::normalize(
            $phone,
            (string) config('whatsapp_verification.default_country_code', '62')
        );
        if (! $normalized) {
            return response()->json(['message' => 'Nomor WhatsApp tidak valid.'], 422);
        }

        $verification = UserWhatsappVerification::query()
            ->where('user_id', $user->id)
            ->where('normalized_phone', $normalized)
            ->latest('id')
            ->first();

        if (! $verification || $verification->status !== WhatsappVerificationStatus::PENDING) {
            return response()->json(['message' => 'Permintaan OTP tidak ditemukan.'], 404);
        }

        $now = now();
        if ($verification->expires_at && $verification->expires_at->lt($now)) {
            $verification->update([
                'status' => WhatsappVerificationStatus::EXPIRED->value,
                'last_error' => 'expired',
            ]);

            return response()->json(['message' => 'OTP sudah kedaluwarsa.'], 422);
        }

        $maxAttempts = max(1, (int) config('whatsapp_verification.otp_max_attempts', 5));
        if ($verification->attempt_count >= $maxAttempts) {
            $verification->update([
                'status' => WhatsappVerificationStatus::FAILED->value,
                'last_error' => 'too_many_attempts',
            ]);

            return response()->json(['message' => 'Batas percobaan OTP terlampaui.'], 429);
        }

        $code = (string) $request->input('code');
        $attemptCount = $verification->attempt_count + 1;
        if (! $verification->verification_code_hash || ! Hash::check($code, $verification->verification_code_hash)) {
            $verification->update([
                'attempt_count' => $attemptCount,
                'last_error' => 'invalid_code',
                'status' => $attemptCount >= $maxAttempts
                    ? WhatsappVerificationStatus::FAILED->value
                    : WhatsappVerificationStatus::PENDING->value,
            ]);

            return response()->json(['message' => 'Kode OTP tidak valid.'], 422);
        }

        $verification->update([
            'attempt_count' => $attemptCount,
            'status' => WhatsappVerificationStatus::VERIFIED->value,
            'verified_at' => $now,
            'last_error' => null,
        ]);

        return response()->json([
            'message' => 'WhatsApp berhasil diverifikasi.',
            'data' => [
                'verified' => true,
                'verified_at' => $verification->fresh()->verified_at?->toIso8601String(),
            ],
        ]);
    }

    private function generateOtp(): string
    {
        $length = max(4, min(8, (int) config('whatsapp_verification.otp_length', 6)));
        $min = (int) pow(10, $length - 1);
        $max = (int) pow(10, $length) - 1;

        return (string) random_int($min, $max);
    }
}
