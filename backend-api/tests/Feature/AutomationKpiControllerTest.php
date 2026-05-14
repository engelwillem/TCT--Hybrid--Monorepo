<?php

namespace Tests\Feature;

use App\Models\AutomationEvent;
use App\Models\User;
use App\Models\WaClient;
use App\Models\WaReminder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class AutomationKpiControllerTest extends TestCase
{
    use RefreshDatabase;

    public function test_non_admin_cannot_access_automation_kpi(): void
    {
        $user = User::factory()->create([
            'email' => 'member@example.com',
            'is_admin' => false,
        ]);

        $this->actingAs($user, 'sanctum')
            ->getJson('/api/v1/profile/automation/kpi')
            ->assertStatus(403);
    }

    public function test_admin_can_get_automation_kpi_summary(): void
    {
        $admin = User::factory()->create([
            'email' => 'engel.willem@gmail.com',
            'is_admin' => true,
        ]);

        AutomationEvent::query()->create([
            'workflow' => 'wa_process_due',
            'trigger_source' => 'scheduler',
            'status' => 'sent',
            'channel' => 'whatsapp',
            'intent' => 'dispatch_wa_reminder',
            'attempt' => 1,
            'duration_ms' => 1500,
            'processed_at' => now(),
        ]);

        AutomationEvent::query()->create([
            'workflow' => 'wa_process_due',
            'trigger_source' => 'scheduler',
            'status' => 'retrying',
            'channel' => 'whatsapp',
            'intent' => 'dispatch_wa_reminder',
            'attempt' => 2,
            'available_for_retry' => true,
            'error_code' => 'timeout',
            'error_message' => 'request timeout',
            'processed_at' => now(),
        ]);

        $this->actingAs($admin, 'sanctum')
            ->getJson('/api/v1/profile/automation/kpi?limit=20')
            ->assertOk()
            ->assertJsonPath('data.metrics.total_events', 2)
            ->assertJsonPath('data.metrics.success_count', 1)
            ->assertJsonPath('data.metrics.retry_count', 1);
    }

    public function test_admin_can_pause_resume_and_retry_control_loop(): void
    {
        $admin = User::factory()->create([
            'email' => 'engel.willem@gmail.com',
            'is_admin' => true,
        ]);

        $client = WaClient::query()->create([
            'client_name' => 'Demo Client',
            'client_key' => 'DEMO_CLIENT_001',
            'fonnte_token' => 'dummy-token',
            'status' => 'active',
        ]);

        $reminder = WaReminder::query()->create([
            'wa_client_id' => $client->id,
            'sheet_row_number' => 1,
            'customer_name' => 'John',
            'phone' => '6281234567890',
            'tanggal' => now()->format('Y-m-d'),
            'jam' => now()->format('H:i:s'),
            'timezone' => 'Asia/Makassar',
            'scheduled_at' => now()->subMinute(),
            'message_final' => 'hello',
            'status' => 'Gagal',
            'source_hash' => sha1('demo-retry'),
        ]);

        $event = AutomationEvent::query()->create([
            'workflow' => 'wa_process_due',
            'trigger_source' => 'scheduler',
            'status' => 'retrying',
            'channel' => 'whatsapp',
            'intent' => 'dispatch_wa_reminder',
            'subject_type' => 'wa_reminder',
            'subject_id' => $reminder->id,
            'attempt' => 2,
            'available_for_retry' => true,
            'idempotency_key' => sha1('demo-retry'),
            'error_code' => 'timeout',
            'error_message' => 'request timeout',
        ]);

        $this->actingAs($admin, 'sanctum')
            ->postJson('/api/v1/profile/automation/workflows/wa_process_due/pause')
            ->assertOk()
            ->assertJsonPath('data.state', 'paused');

        $this->actingAs($admin, 'sanctum')
            ->postJson('/api/v1/profile/automation/workflows/wa_process_due/resume')
            ->assertOk()
            ->assertJsonPath('data.state', 'running');

        $this->actingAs($admin, 'sanctum')
            ->postJson("/api/v1/profile/automation/events/{$event->id}/retry")
            ->assertOk()
            ->assertJsonPath('data.retry_state', 'queued');

        $this->assertDatabaseHas('wa_reminders', [
            'id' => $reminder->id,
            'status' => 'Pending',
        ]);

        $this->assertTrue(
            AutomationEvent::query()
                ->where('workflow', 'wa_process_due')
                ->where('status', 'retrying')
                ->where('subject_type', 'wa_reminder')
                ->where('subject_id', $reminder->id)
                ->exists()
        );
    }
}
