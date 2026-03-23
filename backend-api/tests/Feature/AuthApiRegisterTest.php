<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Hash;
use Tests\TestCase;

class AuthApiRegisterTest extends TestCase
{
    use RefreshDatabase;

    public function test_api_register_creates_user_and_returns_token_contract(): void
    {
        $response = $this->postJson('/api/v1/register', [
            'name' => 'Chosen Member',
            'email' => 'chosen.member@example.com',
            'password' => 'password123',
            'password_confirmation' => 'password123',
        ]);

        $response->assertCreated();
        $response->assertJsonStructure([
            'status',
            'data' => ['token'],
            'user' => ['id', 'name', 'email'],
            'redirect_to',
        ]);
        $response->assertJsonPath('status', 'success');
        $response->assertJsonPath('redirect_to', '/today');

        $user = User::query()->where('email', 'chosen.member@example.com')->first();
        $this->assertNotNull($user);
        $this->assertTrue(Hash::check('password123', (string) $user?->password));
        $this->assertNotEmpty((string) $response->json('data.token'));
    }

    public function test_api_register_rejects_duplicate_email(): void
    {
        User::factory()->create([
            'email' => 'member@example.com',
        ]);

        $response = $this->postJson('/api/v1/register', [
            'name' => 'Another Member',
            'email' => 'member@example.com',
            'password' => 'password123',
            'password_confirmation' => 'password123',
        ]);

        $response->assertStatus(422);
        $response->assertJsonValidationErrors(['email']);
    }

    public function test_plain_post_to_api_register_without_accept_header_still_returns_json_validation_errors(): void
    {
        $response = $this->post('/api/v1/register', []);

        $response->assertStatus(422);
        $response->assertHeaderMissing('Location');
        $response->assertHeader('content-type', 'application/json');
        $response->assertJsonValidationErrors(['name', 'email', 'password']);
    }

    public function test_plain_post_to_api_login_without_accept_header_still_returns_json_validation_errors(): void
    {
        $response = $this->post('/api/v1/login', []);

        $response->assertStatus(422);
        $response->assertHeaderMissing('Location');
        $response->assertHeader('content-type', 'application/json');
        $response->assertJsonValidationErrors(['email', 'password']);
    }

    public function test_plain_guest_request_to_protected_api_route_returns_json_401_instead_of_redirect(): void
    {
        $response = $this->get('/api/v1/profile');

        $response->assertUnauthorized();
        $response->assertHeaderMissing('Location');
        $response->assertHeader('content-type', 'application/json');
        $response->assertJsonPath('message', 'Unauthenticated.');
    }
}
