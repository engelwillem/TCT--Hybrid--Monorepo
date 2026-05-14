<?php

namespace Tests\Feature\Auth;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class RegistrationTest extends TestCase
{
    use RefreshDatabase;

    public function test_registration_screen_redirects_to_landing_when_disabled(): void
    {
        $response = $this->get('/register');

        $response->assertRedirect('/');
    }

    public function test_new_users_cannot_register_when_signup_is_disabled(): void
    {
        $response = $this->post('/register', [
            'name' => 'Test User',
            'email' => 'test@example.com',
            'password' => 'password',
            'password_confirmation' => 'password',
        ]);

        $response->assertForbidden();
        $this->assertGuest();
        $this->assertDatabaseMissing('users', ['email' => 'test@example.com']);
    }

    public function test_register_endpoint_returns_forbidden_and_does_not_persist_user(): void
    {
        $response = $this->post('/register', [
            'name' => 'Chosen Member',
            'email' => 'Chosen.Member@Example.COM',
            'password' => 'password',
            'password_confirmation' => 'password',
        ]);

        $response->assertForbidden();
        $this->assertGuest();
        $this->assertDatabaseMissing('users', ['email' => 'chosen.member@example.com']);
    }

    public function test_registration_rejects_duplicate_email_with_different_case_while_disabled(): void
    {
        User::factory()->create([
            'email' => 'member@example.com',
        ]);

        $response = $this->from('/register')->post('/register', [
            'name' => 'Another Member',
            'email' => 'Member@Example.com',
            'password' => 'password',
            'password_confirmation' => 'password',
        ]);

        $response->assertForbidden();
        $this->assertDatabaseCount('users', 1);
    }
}
