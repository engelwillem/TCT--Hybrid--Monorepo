<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class CommunityVideoUploadAuthorizationTest extends TestCase
{
    use RefreshDatabase;

    public function test_non_admin_email_cannot_upload_video_to_community_post(): void
    {
        Storage::fake('public');

        $user = User::factory()->create([
            'email' => 'member@example.com',
        ]);

        Sanctum::actingAs($user);

        $video = UploadedFile::fake()->create('test-video.mp4', 1024, 'video/mp4');

        $response = $this->post('/api/v1/community/posts', [
            'text' => 'Mencoba upload video.',
            'images' => [$video],
        ]);

        $response->assertStatus(403);
        $response->assertJsonPath('message', 'Upload video hanya tersedia untuk akun admin tertentu.');
    }

    public function test_allowed_admin_email_can_upload_video_to_community_post(): void
    {
        Storage::fake('public');

        $user = User::factory()->create([
            'email' => 'engel.willem@gmail.com',
        ]);

        Sanctum::actingAs($user);

        $video = UploadedFile::fake()->create('test-video.mp4', 1024, 'video/mp4');

        $response = $this->post('/api/v1/community/posts', [
            'text' => 'Upload video admin.',
            'images' => [$video],
        ]);

        $response->assertCreated();
        $response->assertJsonStructure([
            'data' => [
                'post' => [
                    'id',
                    'mediaPaths',
                ],
            ],
        ]);
    }
}
