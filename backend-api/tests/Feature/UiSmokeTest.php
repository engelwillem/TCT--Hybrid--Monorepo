<?php

namespace Tests\Feature;

use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class UiSmokeTest extends TestCase
{
    use RefreshDatabase;

    public function test_it_redirects_root_to_decoupled_frontend(): void
    {
        $response = $this->get('/');

        $response->assertRedirect();
    }

    public function test_legacy_entry_routes_redirect_to_current_auth_surface(): void
    {
        $this->get('/admin')->assertRedirect('/admintalk/login');
        $this->get('/admin/login')->assertRedirect('/admintalk/login');
        $this->get('/login')->assertRedirect('/admintalk/login');
    }
}
