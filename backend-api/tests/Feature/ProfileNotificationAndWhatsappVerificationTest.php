<?php

namespace Tests\Feature;

use App\Enums\WhatsappVerificationStatus;
use App\Models\User;
use App\Models\UserWhatsappVerification;
use App\Models\WaClient;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Routing\Middleware\ThrottleRequests;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\RateLimiter;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class ProfileNotificationAndWhatsappVerificationTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();

        // Stabilize throttle-dependent tests in this class.
        RateLimiter::clear('wa-otp-request:user:1');
        RateLimiter::clear('wa-otp-request:ip:127.0.0.1');
        RateLimiter::clear('wa-otp-verify:user:1');
        RateLimiter::clear('wa-otp-verify:ip:127.0.0.1');
    }

    public function test_get_notification_preferences_returns_current_user_preferences(): void
    {
        $user = User::factory()->create();
        Sanctum::actingAs($user);

        $response = $this->getJson('/api/v1/profile/notification-preferences');

        $response
            ->assertOk()
            ->assertJsonStructure([
                'data' => ['email', 'in_app', 'whatsapp', 'timezone', 'quiet_hours_start', 'quiet_hours_end'],
            ]);
    }

    public function test_update_notification_preferences_updates_channels(): void
    {
        $user = User::factory()->create();
        Sanctum::actingAs($user);

        $this->putJson('/api/v1/profile/notification-preferences', [
            'email' => false,
            'in_app' => true,
            'whatsapp' => true,
            'timezone' => 'Asia/Makassar',
            'quiet_hours_start' => '22:00',
            'quiet_hours_end' => '06:00',
        ])->assertOk()
            ->assertJsonPath('data.email', false)
            ->assertJsonPath('data.in_app', true)
            ->assertJsonPath('data.whatsapp', true)
            ->assertJsonPath('data.timezone', 'Asia/Makassar');
    }

    public function test_request_whatsapp_otp_stores_hashed_code(): void
    {
        config()->set('whatsapp_verification.client_key', 'CLIENT_TEST');
        config()->set('whatsapp_verification.fallback_fonnte_token', null);
        config()->set('whatsapp_verification.otp_expiry_minutes', 10);

        $user = User::factory()->create();
        WaClient::query()->create([
            'client_name' => 'Test',
            'client_key' => 'CLIENT_TEST',
            'fonnte_token' => 'token-123',
            'status' => 'active',
        ]);

        Sanctum::actingAs($user);
        Http::fake([
            'https://api.fonnte.com/send' => Http::response(['status' => true], 200),
        ]);

        $this->postJson('/api/v1/profile/whatsapp-verification/request', [
            'phone' => '081234567890',
        ])->assertOk();

        $record = UserWhatsappVerification::query()->where('user_id', $user->id)->latest('id')->firstOrFail();
        $this->assertNotNull($record->verification_code_hash);
        $this->assertFalse(Hash::check('123456', (string) $record->verification_code_hash));
        $this->assertSame('6281234567890', $record->normalized_phone);
    }

    public function test_request_whatsapp_otp_normalizes_international_numbers(): void
    {
        config()->set('whatsapp_verification.client_key', 'CLIENT_TEST');
        config()->set('whatsapp_verification.fallback_fonnte_token', null);
        config()->set('whatsapp_verification.default_country_code', '62');

        $user = User::factory()->create();
        WaClient::query()->create([
            'client_name' => 'Test',
            'client_key' => 'CLIENT_TEST',
            'fonnte_token' => 'token-123',
            'status' => 'active',
        ]);

        Sanctum::actingAs($user);
        Http::fake([
            'https://api.fonnte.com/send' => Http::response(['status' => true], 200),
        ]);

        $cases = [
            ['input' => '081234567890', 'expected' => '6281234567890'],
            ['input' => '+61 412 345 678', 'expected' => '61412345678'],
            ['input' => '+65 8123 4567', 'expected' => '6581234567'],
            ['input' => '+44 7700 900123', 'expected' => '447700900123'],
        ];

        foreach ($cases as $case) {
            $this->postJson('/api/v1/profile/whatsapp-verification/request', [
                'phone' => $case['input'],
            ])->assertOk();

            $latest = UserWhatsappVerification::query()->where('user_id', $user->id)->latest('id')->firstOrFail();
            $this->assertSame($case['expected'], $latest->normalized_phone);
        }
    }

    public function test_expired_whatsapp_otp_cannot_be_verified(): void
    {
        $user = User::factory()->create();
        Sanctum::actingAs($user);

        UserWhatsappVerification::query()->create([
            'user_id' => $user->id,
            'phone' => '081234567890',
            'normalized_phone' => '6281234567890',
            'status' => WhatsappVerificationStatus::PENDING->value,
            'verification_code_hash' => Hash::make('222222'),
            'requested_at' => now()->subMinutes(11),
            'expires_at' => now()->subMinute(),
            'attempt_count' => 0,
        ]);

        $this->postJson('/api/v1/profile/whatsapp-verification/verify', [
            'phone' => '081234567890',
            'code' => '222222',
        ])->assertStatus(422);
    }

    public function test_wrong_whatsapp_otp_fails(): void
    {
        $user = User::factory()->create();
        Sanctum::actingAs($user);

        UserWhatsappVerification::query()->create([
            'user_id' => $user->id,
            'phone' => '081234567890',
            'normalized_phone' => '6281234567890',
            'status' => WhatsappVerificationStatus::PENDING->value,
            'verification_code_hash' => Hash::make('333333'),
            'requested_at' => now(),
            'expires_at' => now()->addMinutes(10),
            'attempt_count' => 0,
        ]);

        $this->postJson('/api/v1/profile/whatsapp-verification/verify', [
            'phone' => '081234567890',
            'code' => '111111',
        ])->assertStatus(422);
    }

    public function test_correct_whatsapp_otp_verifies_user(): void
    {
        $user = User::factory()->create();
        Sanctum::actingAs($user);

        UserWhatsappVerification::query()->create([
            'user_id' => $user->id,
            'phone' => '081234567890',
            'normalized_phone' => '6281234567890',
            'status' => WhatsappVerificationStatus::PENDING->value,
            'verification_code_hash' => Hash::make('444444'),
            'requested_at' => now(),
            'expires_at' => now()->addMinutes(10),
            'attempt_count' => 0,
        ]);

        $this->postJson('/api/v1/profile/whatsapp-verification/verify', [
            'phone' => '081234567890',
            'code' => '444444',
        ])->assertOk()
            ->assertJsonPath('data.verified', true);
    }

    public function test_whatsapp_verification_status_endpoint_works(): void
    {
        $user = User::factory()->create();
        Sanctum::actingAs($user);

        UserWhatsappVerification::query()->create([
            'user_id' => $user->id,
            'phone' => '081234567890',
            'normalized_phone' => '6281234567890',
            'status' => WhatsappVerificationStatus::VERIFIED->value,
            'verification_code_hash' => Hash::make('555555'),
            'requested_at' => now()->subMinutes(5),
            'verified_at' => now()->subMinutes(4),
            'expires_at' => now()->addMinutes(5),
            'attempt_count' => 1,
        ]);

        $this->getJson('/api/v1/profile/whatsapp-verification/status')
            ->assertOk()
            ->assertJsonPath('data.verified', true)
            ->assertJsonPath('data.status', WhatsappVerificationStatus::VERIFIED->value);
    }

    public function test_unauthenticated_user_cannot_access_step3_endpoints(): void
    {
        $this->getJson('/api/v1/profile/notification-preferences')->assertStatus(401);
        $this->putJson('/api/v1/profile/notification-preferences', [
            'email' => true,
            'in_app' => true,
            'whatsapp' => true,
        ])->assertStatus(401);
        $this->getJson('/api/v1/profile/whatsapp-verification/status')->assertStatus(401);
        $this->postJson('/api/v1/profile/whatsapp-verification/request', ['phone' => '081234567890'])->assertStatus(401);
        $this->postJson('/api/v1/profile/whatsapp-verification/verify', ['phone' => '081234567890', 'code' => '123456'])->assertStatus(401);
    }

    public function test_user_cannot_verify_another_users_whatsapp_otp(): void
    {
        $userA = User::factory()->create();
        $userB = User::factory()->create();

        UserWhatsappVerification::query()->create([
            'user_id' => $userA->id,
            'phone' => '081234567890',
            'normalized_phone' => '6281234567890',
            'status' => WhatsappVerificationStatus::PENDING->value,
            'verification_code_hash' => Hash::make('777777'),
            'requested_at' => now(),
            'expires_at' => now()->addMinutes(10),
            'attempt_count' => 0,
        ]);

        Sanctum::actingAs($userB);
        $this->postJson('/api/v1/profile/whatsapp-verification/verify', [
            'phone' => '081234567890',
            'code' => '777777',
        ])->assertStatus(404);

        $record = UserWhatsappVerification::query()->where('user_id', $userA->id)->latest('id')->firstOrFail();
        $this->assertNull($record->verified_at);
    }

    public function test_whatsapp_verification_responses_do_not_expose_sensitive_fields(): void
    {
        $this->withoutMiddleware(ThrottleRequests::class);

        config()->set('whatsapp_verification.client_key', 'CLIENT_TEST');
        config()->set('whatsapp_verification.fallback_fonnte_token', null);

        $user = User::factory()->create();
        WaClient::query()->create([
            'client_name' => 'Test',
            'client_key' => 'CLIENT_TEST',
            'fonnte_token' => 'token-123',
            'status' => 'active',
        ]);
        Sanctum::actingAs($user);

        Http::fake([
            'https://api.fonnte.com/send' => Http::response(['status' => true], 200),
        ]);

        $request = $this->postJson('/api/v1/profile/whatsapp-verification/request', [
            'phone' => '081234567890',
        ])->assertOk();

        $request->assertJsonMissingPath('data.verification_code_hash');
        $request->assertJsonMissingPath('data.code');
        $request->assertJsonMissingPath('verification_code_hash');

        $status = $this->getJson('/api/v1/profile/whatsapp-verification/status')->assertOk();
        $status->assertJsonMissingPath('data.verification_code_hash');
        $status->assertJsonMissingPath('data.code');
    }

    public function test_profile_update_cannot_mass_assign_privileged_fields(): void
    {
        $user = User::factory()->create([
            'is_admin' => false,
            'is_it' => false,
            'is_system' => false,
            'firebase_uid' => null,
        ]);

        Sanctum::actingAs($user);
        $this->patchJson('/api/v1/profile', [
            'name' => 'Member Updated',
            'email' => $user->email,
            'is_admin' => true,
            'is_it' => true,
            'is_system' => true,
            'firebase_uid' => 'spoofed',
            'email_verified_at' => now()->toISOString(),
            'password' => 'unsafe-change',
        ])->assertOk();

        $user->refresh();
        $this->assertFalse((bool) $user->is_admin);
        $this->assertFalse((bool) $user->is_it);
        $this->assertFalse((bool) $user->is_system);
        $this->assertNull($user->firebase_uid);
    }
}
