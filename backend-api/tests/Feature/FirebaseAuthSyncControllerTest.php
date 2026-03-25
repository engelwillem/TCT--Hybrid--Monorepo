<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Http;
use Tests\TestCase;

class FirebaseAuthSyncControllerTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();

        config()->set('services.firebase.web_api_key', 'test-web-api-key');
    }

    public function test_unverified_firebase_email_cannot_bind_existing_local_account(): void
    {
        User::factory()->create([
            'email' => 'admin@example.com',
            'firebase_uid' => null,
            'password' => Hash::make('password'),
        ]);

        Http::fake([
            'https://identitytoolkit.googleapis.com/*' => Http::response([
                'users' => [[
                    'localId' => 'firebase-attacker-uid',
                    'email' => 'admin@example.com',
                    'displayName' => 'Attacker',
                    'emailVerified' => false,
                ]],
            ], 200),
        ]);

        $response = $this->postJson('/api/v1/auth/firebase/sync', [
            'idToken' => 'fake-id-token',
        ]);

        $response->assertForbidden();
        $response->assertJsonPath('message', 'Firebase email must be verified before linking to an existing account.');

        $user = User::query()->where('email', 'admin@example.com')->firstOrFail();
        $this->assertNull($user->firebase_uid);
    }

    public function test_verified_firebase_email_can_bind_existing_local_account_without_uid(): void
    {
        $user = User::factory()->create([
            'email' => 'member@example.com',
            'firebase_uid' => null,
            'password' => Hash::make('password'),
        ]);

        Http::fake([
            'https://identitytoolkit.googleapis.com/*' => Http::response([
                'users' => [[
                    'localId' => 'firebase-member-uid',
                    'email' => 'member@example.com',
                    'displayName' => 'Chosen Member',
                    'emailVerified' => true,
                ]],
            ], 200),
        ]);

        $response = $this->postJson('/api/v1/auth/firebase/sync', [
            'idToken' => 'fake-id-token',
        ]);

        $response->assertOk();
        $response->assertJsonPath('data.user.email', 'member@example.com');
        $response->assertJsonPath('data.user.firebaseUid', 'firebase-member-uid');

        $user->refresh();
        $this->assertSame('firebase-member-uid', $user->firebase_uid);
    }
}
