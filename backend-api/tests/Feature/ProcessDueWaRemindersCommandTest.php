<?php

namespace Tests\Feature;

use App\Models\WaClient;
use App\Models\WaReminder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\Http;
use Tests\TestCase;

class ProcessDueWaRemindersCommandTest extends TestCase
{
    use RefreshDatabase;

    public function test_failed_past_due_reminder_is_retried_and_updates_delivery_fields(): void
    {
        $client = WaClient::query()->create([
            'client_name' => 'Demo Client',
            'client_key' => 'CLIENT_DEMO_001',
            'fonnte_token' => 'demo-token',
            'status' => 'active',
            'timezone' => 'Asia/Makassar',
        ]);

        $reminder = WaReminder::query()->create([
            'wa_client_id' => $client->id,
            'sheet_row_number' => 2,
            'customer_name' => 'Retry User',
            'phone' => '6281234567890',
            'tanggal' => '2026-01-01',
            'jam' => '09:00:00',
            'timezone' => 'Asia/Makassar',
            'scheduled_at' => now()->subDay(),
            'message_final' => 'hello retry',
            'status' => 'Gagal',
            'source_hash' => sha1('retry-row-2'),
        ]);

        Http::fake([
            'https://api.fonnte.com/send' => Http::response([
                'status' => true,
                'id' => 'MSG-RETRY-001',
            ], 200),
        ]);

        $this->artisan('wa:process-due-reminders --limit=50')
            ->assertSuccessful();

        $reminder->refresh();

        $this->assertSame('Terkirim', $reminder->status);
        $this->assertSame('MSG-RETRY-001', $reminder->fonnte_message_id);
        $this->assertNotNull($reminder->sent_at);
        $this->assertSame(now('Asia/Makassar')->format('Y-m-d'), $reminder->tanggal);
        $this->assertMatchesRegularExpression('/^\d{2}:\d{2}:\d{2}$/', (string) $reminder->jam);
    }

    public function test_sent_reminder_is_not_resent_on_next_scheduler_run(): void
    {
        $client = WaClient::query()->create([
            'client_name' => 'Demo Client',
            'client_key' => 'CLIENT_DEMO_001',
            'fonnte_token' => 'demo-token',
            'status' => 'active',
            'timezone' => 'Asia/Makassar',
        ]);

        WaReminder::query()->create([
            'wa_client_id' => $client->id,
            'sheet_row_number' => 3,
            'customer_name' => 'No Duplicate',
            'phone' => '6281234567000',
            'tanggal' => Carbon::now('Asia/Makassar')->format('Y-m-d'),
            'jam' => Carbon::now('Asia/Makassar')->format('H:i:s'),
            'timezone' => 'Asia/Makassar',
            'scheduled_at' => now()->subMinute(),
            'message_final' => 'first send',
            'status' => 'Terkirim',
            'fonnte_message_id' => 'MSG-DONE-001',
            'sent_at' => now()->subMinute(),
            'source_hash' => sha1('sent-row-3'),
        ]);

        Http::fake();

        $this->artisan('wa:process-due-reminders --limit=50')
            ->assertSuccessful();

        Http::assertNothingSent();
    }

    public function test_it_refreshes_client_token_from_env_when_provider_returns_invalid_token(): void
    {
        config()->set('app.env', 'testing');
        putenv('FONNTE_TOKEN=valid-env-token');
        $_ENV['FONNTE_TOKEN'] = 'valid-env-token';
        $_SERVER['FONNTE_TOKEN'] = 'valid-env-token';

        $client = WaClient::query()->create([
            'client_name' => 'Demo Client',
            'client_key' => 'CLIENT_DEMO_001',
            'fonnte_token' => 'INVALID-TOKEN',
            'status' => 'active',
            'timezone' => 'Asia/Makassar',
        ]);

        $reminder = WaReminder::query()->create([
            'wa_client_id' => $client->id,
            'sheet_row_number' => 4,
            'customer_name' => 'Env Sync User',
            'phone' => '6287719814529',
            'tanggal' => now('Asia/Makassar')->format('Y-m-d'),
            'jam' => now('Asia/Makassar')->subMinute()->format('H:i:s'),
            'timezone' => 'Asia/Makassar',
            'scheduled_at' => now()->subMinute(),
            'message_final' => 'env token fallback',
            'status' => 'Pending',
            'source_hash' => sha1('env-token-fallback'),
        ]);

        Http::fakeSequence()
            ->push(['status' => false, 'reason' => 'invalid token'], 200)
            ->push(['status' => true, 'id' => 'MSG-ENV-001'], 200);

        $this->artisan('wa:process-due-reminders --limit=50')
            ->assertSuccessful();

        $reminder->refresh();
        $client->refresh();

        $this->assertSame('Terkirim', $reminder->status);
        $this->assertSame('MSG-ENV-001', $reminder->fonnte_message_id);
        $this->assertSame('valid-env-token', $client->fonnte_token);
    }
}
