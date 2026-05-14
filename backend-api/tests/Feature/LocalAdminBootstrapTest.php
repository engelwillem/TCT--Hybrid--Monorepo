<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class LocalAdminBootstrapTest extends TestCase
{
    use RefreshDatabase;

    public function test_local_admin_command_ensures_admin_account_and_login_works(): void
    {
        $email = 'engel.willem@gmail.com';
        $password = 'TctAdmin2026Reset';

        $this->artisan('app:ensure-local-admin', [
            '--email' => $email,
            '--name' => 'TCT Admin',
            '--password' => $password,
        ])->assertExitCode(0);

        $user = User::query()->where('email', $email)->firstOrFail();
        $this->assertTrue((bool) $user->is_admin);
        $this->assertNotNull($user->email_verified_at);

        $this->postJson('/api/v1/login', [
            'email' => $email,
            'password' => $password,
        ])->assertOk()
            ->assertJsonPath('status', 'success')
            ->assertJsonPath('user.email', $email);
    }

    public function test_invalid_password_does_not_return_connectivity_timeout_message(): void
    {
        $user = User::factory()->create([
            'email' => 'member@example.com',
        ]);

        $response = $this->postJson('/api/v1/login', [
            'email' => $user->email,
            'password' => 'wrong-password',
        ]);

        $response->assertStatus(422);
        $payload = $response->json();
        $message = strtolower((string) ($payload['message'] ?? ''));
        $this->assertStringNotContainsString('unreachable', $message);
        $this->assertStringNotContainsString('timed out', $message);
    }

    public function test_non_admin_cannot_access_admin_route(): void
    {
        $user = User::factory()->create([
            'is_admin' => false,
        ]);

        $response = $this->actingAs($user)->get('/admintalk');
        $this->assertContains($response->getStatusCode(), [302, 403]);
    }
}

