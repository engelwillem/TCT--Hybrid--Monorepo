<?php

namespace Tests\Feature\Auth;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class PasswordResetTest extends TestCase
{
    use RefreshDatabase;

    public function test_reset_password_link_screen_can_be_rendered(): void
    {
        $response = $this->get('/forgot-password');

        $response->assertRedirect('/');
    }

    public function test_reset_password_link_can_be_requested(): void
    {
        $user = User::factory()->create();

        $this->post('/forgot-password', ['email' => $user->email])
            ->assertRedirect('/');
    }

    public function test_reset_password_screen_can_be_rendered(): void
    {
        $this->get('/reset-password/fake-token')
            ->assertNotFound();
    }

    public function test_password_can_be_reset_with_valid_token(): void
    {
        $user = User::factory()->create();

        $this->post('/reset-password', [
            'token' => 'fake-token',
            'email' => $user->email,
            'password' => 'password',
            'password_confirmation' => 'password',
        ])->assertRedirect('/');
    }
}
