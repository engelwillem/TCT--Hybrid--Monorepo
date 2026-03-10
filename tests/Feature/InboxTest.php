<?php

namespace Tests\Feature;

use App\Models\DirectMessage;
use App\Models\User;
use App\Models\UserFollow;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class InboxTest extends TestCase
{
    use RefreshDatabase;

    public function test_inbox_groups_primary_general_requests(): void
    {
        $me = User::factory()->create();
        $mutual = User::factory()->create();
        $general = User::factory()->create();
        $request = User::factory()->create();

        UserFollow::query()->create([
            'follower_id' => $me->id,
            'followed_id' => $mutual->id,
        ]);
        UserFollow::query()->create([
            'follower_id' => $mutual->id,
            'followed_id' => $me->id,
        ]);

        // One-way relation (not mutual) => general.
        UserFollow::query()->create([
            'follower_id' => $general->id,
            'followed_id' => $me->id,
        ]);

        DirectMessage::query()->create([
            'sender_id' => $mutual->id,
            'recipient_id' => $me->id,
            'body' => 'Mutual follow message',
            'approved_at' => now(),
        ]);

        DirectMessage::query()->create([
            'sender_id' => $general->id,
            'recipient_id' => $me->id,
            'body' => 'General inbox message',
            'approved_at' => now(),
        ]);

        DirectMessage::query()->create([
            'sender_id' => $request->id,
            'recipient_id' => $me->id,
            'body' => 'Please approve this message',
            'approved_at' => null,
        ]);

        $response = $this->actingAs($me)->getJson(route('inbox.index'));

        $response->assertOk();
        $response->assertJsonPath('inbox.counts.primary', 1);
        $response->assertJsonPath('inbox.counts.general', 1);
        $response->assertJsonPath('inbox.counts.requests', 1);
    }

    public function test_mark_all_read_marks_all_incoming_dm_as_read(): void
    {
        $me = User::factory()->create();
        $sender = User::factory()->create();

        DirectMessage::query()->create([
            'sender_id' => $sender->id,
            'recipient_id' => $me->id,
            'body' => 'One',
            'approved_at' => now(),
        ]);
        DirectMessage::query()->create([
            'sender_id' => $sender->id,
            'recipient_id' => $me->id,
            'body' => 'Two',
            'approved_at' => now(),
        ]);

        $this->actingAs($me)
            ->postJson(route('inbox.readAll'))
            ->assertOk()
            ->assertJsonPath('ok', true);

        $unread = DirectMessage::query()
            ->where('recipient_id', $me->id)
            ->whereNull('read_at')
            ->count();

        $this->assertSame(0, $unread);
    }
}
