<?php

namespace Tests\Feature;

use App\Models\User;
use App\Services\Security\TwoFactorService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Mockery;
use Tests\TestCase;

class ProfileTwoFactorApiTest extends TestCase
{
    use RefreshDatabase;

    public function test_two_factor_setup_returns_payload_for_token_authenticated_api_request(): void
    {
        $user = User::factory()->create();
        Sanctum::actingAs($user);

        $mock = Mockery::mock(TwoFactorService::class);
        $mock->shouldReceive('generateSecret')->once()->andReturn('SECRET1234567890');
        $mock->shouldReceive('generateRecoveryCodes')->once()->andReturn(['code-1', 'code-2']);
        $mock->shouldReceive('generateQrCodeDataUri')->once()->andReturn('data:image/svg+xml;base64,ZmFrZQ==');
        $this->app->instance(TwoFactorService::class, $mock);

        $response = $this->postJson('/api/v1/profile/two-factor/setup', [
            'current_password' => 'password',
        ]);

        $response->assertOk();
        $response->assertJsonPath('secret', 'SECRET1234567890');
        $response->assertJsonPath('qrCodeDataUri', 'data:image/svg+xml;base64,ZmFrZQ==');
        $response->assertJsonPath('recoveryCodes.0', 'code-1');
    }

    public function test_two_factor_confirm_uses_cached_pending_setup_for_token_authenticated_api_request(): void
    {
        $user = User::factory()->create();
        Sanctum::actingAs($user);

        $setupMock = Mockery::mock(TwoFactorService::class);
        $setupMock->shouldReceive('generateSecret')->once()->andReturn('SECRET1234567890');
        $setupMock->shouldReceive('generateRecoveryCodes')->once()->andReturn(['code-1', 'code-2']);
        $setupMock->shouldReceive('generateQrCodeDataUri')->once()->andReturn('data:image/svg+xml;base64,ZmFrZQ==');
        $this->app->instance(TwoFactorService::class, $setupMock);

        $this->postJson('/api/v1/profile/two-factor/setup', [
            'current_password' => 'password',
        ])->assertOk();

        $confirmMock = Mockery::mock(TwoFactorService::class);
        $confirmMock->shouldReceive('verifyCode')->once()->with('SECRET1234567890', '123456')->andReturnTrue();
        $confirmMock->shouldReceive('enable')->once()->withArgs(function (User $enabledUser, string $secret, array $recoveryCodes) use ($user): bool {
            return $enabledUser->is($user)
                && $secret === 'SECRET1234567890'
                && $recoveryCodes === ['code-1', 'code-2'];
        });
        $this->app->instance(TwoFactorService::class, $confirmMock);

        $response = $this->postJson('/api/v1/profile/two-factor/confirm', [
            'current_password' => 'password',
            'code' => '123456',
        ]);

        $response->assertOk();
        $response->assertJsonPath('ok', true);
        $response->assertJsonPath('twoFactor.enabled', true);
        $response->assertJsonPath('twoFactor.recoveryCodesRemaining', 2);
    }
}
