<?php

namespace App\Services\Whatsapp;

use App\Models\WaClient;
use Illuminate\Support\Facades\Http;

class WhatsappOtpDeliveryService
{
    public function send(string $normalizedPhone, string $message): bool
    {
        $token = $this->resolveToken();
        if (! $token) {
            return false;
        }

        $response = Http::asForm()
            ->timeout(30)
            ->withHeaders([
                'Authorization' => $token,
            ])
            ->post('https://api.fonnte.com/send', [
                'target' => $normalizedPhone,
                'message' => $message,
            ]);

        $decoded = json_decode($response->body(), true);

        if ($response->status() >= 200 && $response->status() < 300) {
            if (! is_array($decoded)) {
                return true;
            }

            return in_array($decoded['status'] ?? null, [true, 'true', 1, '1'], true);
        }

        return false;
    }

    public function resolveClientId(): ?int
    {
        $client = $this->resolveClient();

        return $client?->id;
    }

    private function resolveToken(): ?string
    {
        $client = $this->resolveClient();
        if ($client && trim((string) $client->fonnte_token) !== '') {
            return trim((string) $client->fonnte_token);
        }

        $fallback = trim((string) config('whatsapp_verification.fallback_fonnte_token'));

        return $fallback !== '' ? $fallback : null;
    }

    private function resolveClient(): ?WaClient
    {
        $clientKey = trim((string) config('whatsapp_verification.client_key', 'CLIENT_DEMO_001'));
        if ($clientKey === '') {
            return null;
        }

        return WaClient::query()
            ->where('client_key', $clientKey)
            ->where('status', 'active')
            ->first();
    }
}

