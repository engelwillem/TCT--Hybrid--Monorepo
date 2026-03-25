<?php

namespace Tests\Feature;

use App\Models\DirectMessage;
use App\Models\User;
use App\Models\UserFollow;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class InboxThreadTest extends TestCase
{
    use RefreshDatabase;

    public function test_opening_thread_marks_incoming_messages_as_read(): void
    {
        $me = User::factory()->create();
        $partner = User::factory()->create();

        $incoming = DirectMessage::query()->create([
            'sender_id' => $partner->id,
            'recipient_id' => $me->id,
            'body' => 'Hello there',
            'approved_at' => now(),
        ]);

        $this->actingAs($me)->get(route('inbox.show', ['user' => $partner->id]))->assertOk();

        $this->assertNotNull($incoming->fresh()?->read_at);
    }

    public function test_thread_endpoint_supports_cursor_pagination(): void
    {
        $me = User::factory()->create();
        $partner = User::factory()->create();

        for ($i = 1; $i <= 40; $i++) {
            DirectMessage::query()->create([
                'sender_id' => $i % 2 === 0 ? $me->id : $partner->id,
                'recipient_id' => $i % 2 === 0 ? $partner->id : $me->id,
                'body' => 'Message '.$i,
                'approved_at' => now(),
            ]);
        }

        $first = $this->actingAs($me)
            ->getJson(route('inbox.messages.thread', ['user' => $partner->id]).'?limit=20')
            ->assertOk();

        $first->assertJsonPath('paging.has_more', true);
        $beforeId = (int) $first->json('paging.next_before_id');
        $this->assertGreaterThan(0, $beforeId);

        $second = $this->actingAs($me)
            ->getJson(route('inbox.messages.thread', ['user' => $partner->id]).'?limit=20&before_id='.$beforeId)
            ->assertOk();

        $this->assertCount(20, $second->json('messages'));
    }

    public function test_thread_payload_includes_follow_relationship_state(): void
    {
        $me = User::factory()->create();
        $partner = User::factory()->create();

        UserFollow::query()->create([
            'follower_id' => $me->id,
            'followed_id' => $partner->id,
        ]);

        $response = $this->actingAs($me)
            ->getJson(route('inbox.show', ['user' => $partner->id]))
            ->assertOk();

        $response->assertJsonPath('partner.relationship.is_following_partner', true);
        $response->assertJsonPath('partner.relationship.is_followed_by_partner', false);
        $response->assertJsonPath('partner.relationship.is_mutual_follow', false);
    }
}
