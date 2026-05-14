<?php

namespace Tests\Feature;

use App\Models\Channel;
use App\Models\DirectMessage;
use App\Models\User;
use App\Services\Engagement\SystemAccountService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class ChannelMembershipJoinNotificationTest extends TestCase
{
    use RefreshDatabase;

    public function test_joining_channel_creates_inbox_notification_in_english(): void
    {
        $member = User::factory()->create();
        $channel = new Channel();
        $channel->slug = 'faith-journey-test';
        $channel->title = 'Faith Journey';
        $channel->description = 'Channel for faith journey';
        $channel->type = 'weekly';
        $channel->cover_image_url = null;
        $channel->save();

        $response = $this->actingAs($member)->postJson("/api/v1/channels/{$channel->id}/membership");
        $response->assertOk()->assertJsonPath('status', 'joined-channel');

        $sender = app(SystemAccountService::class)->getEncourager();

        $this->assertDatabaseHas('direct_messages', [
            'sender_id' => $sender->id,
            'recipient_id' => $member->id,
        ]);

        $message = DirectMessage::query()
            ->where('sender_id', $sender->id)
            ->where('recipient_id', $member->id)
            ->latest('id')
            ->firstOrFail();

        $this->assertStringContainsString('Welcome!', $message->body);
        $this->assertStringContainsString('You have successfully joined', $message->body);
        $this->assertNotNull($message->approved_at);
    }
}
