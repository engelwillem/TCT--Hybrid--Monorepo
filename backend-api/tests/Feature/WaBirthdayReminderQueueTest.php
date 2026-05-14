<?php

namespace Tests\Feature;

use App\Models\User;
use App\Models\UserNotificationPreference;
use App\Models\UserWhatsappVerification;
use App\Models\WaClient;
use App\Models\WaReminder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class WaBirthdayReminderQueueTest extends TestCase
{
    use RefreshDatabase;

    public function test_it_queues_birthday_wa_reminder_for_verified_user_with_whatsapp_enabled(): void
    {
        $client = WaClient::query()->create([
            'client_name' => 'Demo Client',
            'client_key' => 'CLIENT_DEMO_001',
            'fonnte_token' => 'token-demo',
            'status' => 'active',
            'timezone' => 'Asia/Makassar',
        ]);

        $user = User::factory()->create([
            'name' => 'Member Ulang Tahun',
            'birth_date' => now('Asia/Makassar')->toDateString(),
        ]);

        UserNotificationPreference::query()->create([
            'user_id' => $user->id,
            'event_key' => 'global',
            'channel' => 'whatsapp',
            'enabled' => true,
            'timezone' => 'Asia/Makassar',
        ]);

        UserWhatsappVerification::query()->create([
            'user_id' => $user->id,
            'wa_client_id' => $client->id,
            'phone' => '081234567890',
            'normalized_phone' => '6281234567890',
            'status' => 'verified',
            'verified_at' => now(),
        ]);

        $this->artisan('wa:queue-birthday-reminders --limit=50')
            ->assertSuccessful();

        $this->assertDatabaseHas('wa_reminders', [
            'wa_client_id' => $client->id,
            'customer_name' => 'Member Ulang Tahun',
            'phone' => '6281234567890',
            'status' => 'Pending',
            'message_template' => 'birthday_auto',
            'toko' => 'TheChosenTalks',
        ]);
    }

    public function test_it_does_not_queue_when_whatsapp_notification_is_disabled(): void
    {
        $client = WaClient::query()->create([
            'client_name' => 'Demo Client',
            'client_key' => 'CLIENT_DEMO_001',
            'fonnte_token' => 'token-demo',
            'status' => 'active',
            'timezone' => 'Asia/Makassar',
        ]);

        $user = User::factory()->create([
            'name' => 'Member Non WA',
            'birth_date' => now('Asia/Makassar')->toDateString(),
        ]);

        UserNotificationPreference::query()->create([
            'user_id' => $user->id,
            'event_key' => 'global',
            'channel' => 'whatsapp',
            'enabled' => false,
            'timezone' => 'Asia/Makassar',
        ]);

        UserWhatsappVerification::query()->create([
            'user_id' => $user->id,
            'wa_client_id' => $client->id,
            'phone' => '081234567891',
            'normalized_phone' => '6281234567891',
            'status' => 'verified',
            'verified_at' => now(),
        ]);

        $this->artisan('wa:queue-birthday-reminders --limit=50')
            ->assertSuccessful();

        $this->assertDatabaseCount('wa_reminders', 0);
    }
}

