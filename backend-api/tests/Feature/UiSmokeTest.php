<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Inertia\Testing\AssertableInertia as Assert;
use Tests\TestCase;

class UiSmokeTest extends TestCase
{
    use RefreshDatabase;

    public function test_it_renders_the_premium_welcome_ui(): void
    {
        $this->withoutVite();
        $response = $this->get('/');

        $response
            ->assertStatus(200)
            ->assertInertia(fn (Assert $page) => $page->component('Auth/Welcome'));
    }

    public function test_it_renders_all_ui_pages(): void
    {
        $this->withoutVite();
        $user = User::factory()->create();

        $publicRoutes = [
            '/' => 'Auth/Welcome',
            '/channels' => 'Channels/Index',
        ];

        foreach ($publicRoutes as $route => $component) {
            $this->get($route)
                ->assertStatus(200)
                ->assertInertia(fn (Assert $page) => $page->component($component));
        }

        $protectedRoutes = [
            '/today' => 'Today/Index',
            '/community' => 'Community/Index',
            '/profile' => 'Profile',
        ];

        foreach ($protectedRoutes as $route => $component) {
            $this->actingAs($user)->get($route)
                ->assertStatus(200)
                ->assertInertia(fn (Assert $page) => $page->component($component));
        }
    }
}
