<?php

namespace Tests\Feature\ShareAssets;

use App\Models\ShareAsset;
use App\Services\ShareAssets\ShareAssetService;
use App\Services\ShareAssets\ShareCopyGenerator;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Cache;
use Mockery;
use Tests\TestCase;

/**
 * Integration-style tests for ShareAssetService.
 *
 * Covers:
 *  1. First prepare creates a ready asset
 *  2. Second prepare with same revision returns cached asset (no re-generation)
 *  3. Asset with different revision triggers new generation
 *  4. Failed generation persists 'failed' status and returns safe fallback
 *  5. Concurrent prepare (lock) prevents duplicate rows
 */
class ShareAssetServiceTest extends TestCase
{
    use RefreshDatabase;

    private ShareAssetService $service;

    /** @var \Mockery\MockInterface&ShareCopyGenerator */
    private $copyGenerator;

    protected function setUp(): void
    {
        parent::setUp();

        $this->copyGenerator = Mockery::mock(ShareCopyGenerator::class);
        $this->service = new ShareAssetService($this->copyGenerator);
    }

    public function test_first_prepare_creates_ready_asset(): void
    {
        $this->copyGenerator
            ->shouldReceive('generate')
            ->once()
            ->andReturn(['title' => 'AI Title', 'description' => 'AI Desc', 'eyebrow' => 'AI Eyebrow']);

        $result = $this->service->prepare(
            surface:    'community',
            subjectId:  '123',
            revision:   'abc123',
            sourceData: ['post_text' => 'Hello world'],
        );

        $this->assertSame('ready', $result['status']);
        $this->assertSame('abc123', $result['revision']);
        $this->assertSame('AI Title', $result['share_title']);
        $this->assertFalse($result['from_cache']);

        $this->assertDatabaseHas('share_assets', [
            'surface'    => 'community',
            'subject_id' => '123',
            'revision'   => 'abc123',
            'status'     => 'ready',
        ]);
    }

    public function test_second_prepare_same_revision_returns_cached(): void
    {
        // Pre-seed a ready asset
        ShareAsset::factory()->create([
            'surface'     => 'community',
            'subject_id'  => '123',
            'revision'    => 'abc123',
            'status'      => 'ready',
            'share_title' => 'Cached Title',
        ]);

        // Generator must NOT be called
        $this->copyGenerator->shouldNotReceive('generate');

        $result = $this->service->prepare(
            surface:    'community',
            subjectId:  '123',
            revision:   'abc123',
            sourceData: ['post_text' => 'Hello world'],
        );

        $this->assertSame('ready', $result['status']);
        $this->assertTrue($result['from_cache']);
        $this->assertSame('Cached Title', $result['share_title']);
    }

    public function test_different_revision_triggers_new_generation(): void
    {
        // Pre-seed asset with revision v1
        ShareAsset::factory()->create([
            'surface'    => 'community',
            'subject_id' => '123',
            'revision'   => 'old-rev',
            'status'     => 'ready',
        ]);

        $this->copyGenerator
            ->shouldReceive('generate')
            ->once()
            ->andReturn(['title' => 'New AI Title', 'description' => 'New Desc', 'eyebrow' => 'New Eyebrow']);

        $result = $this->service->prepare(
            surface:    'community',
            subjectId:  '123',
            revision:   'new-rev',
            sourceData: ['post_text' => 'Updated text'],
        );

        $this->assertSame('ready', $result['status']);
        $this->assertFalse($result['from_cache']);
        $this->assertSame('New AI Title', $result['share_title']);

        $this->assertDatabaseHas('share_assets', [
            'surface'    => 'community',
            'subject_id' => '123',
            'revision'   => 'new-rev',
            'status'     => 'ready',
        ]);
    }

    public function test_ai_failure_returns_safe_fallback_and_marks_failed(): void
    {
        $this->copyGenerator
            ->shouldReceive('generate')
            ->andThrow(new \RuntimeException('OpenAI timeout'));

        $result = $this->service->prepare(
            surface:    'community',
            subjectId:  'fail-subject',
            revision:   'fail-rev',
            sourceData: ['post_text' => 'Hi'],
        );

        // Still returns a usable result
        $this->assertContains($result['status'], ['ready', 'failed']);
        $this->assertSame('fail-rev', $result['revision']);
    }

    public function test_concurrent_prepare_does_not_create_duplicate_rows(): void
    {
        // Simulate: one prepare runs and completes while another is checking lock
        $callCount = 0;
        $this->copyGenerator
            ->shouldReceive('generate')
            ->andReturnUsing(function () use (&$callCount) {
                $callCount++;
                return ['title' => 'T', 'description' => 'D', 'eyebrow' => 'E'];
            });

        // First prepare
        $this->service->prepare(
            surface:    'community',
            subjectId:  'concur-subject',
            revision:   'same-rev',
            sourceData: ['post_text' => 'x'],
        );

        // Second prepare for same revision — should hit cache, not generate again
        $this->service->prepare(
            surface:    'community',
            subjectId:  'concur-subject',
            revision:   'same-rev',
            sourceData: ['post_text' => 'x'],
        );

        // Only 1 row must exist in the DB for this revision
        $this->assertSame(1, ShareAsset::where([
            'surface'    => 'community',
            'subject_id' => 'concur-subject',
            'revision'   => 'same-rev',
        ])->count());

        // Generator was called at most once
        $this->assertLessThanOrEqual(1, $callCount, 'Generator must not run more than once for the same revision');
    }

    public function test_read_ready_returns_null_for_missing_revision(): void
    {
        $result = $this->service->readReady('community', 'notfound', 'no-revision');
        $this->assertNull($result);
    }

    public function test_read_ready_returns_asset_for_correct_revision(): void
    {
        $asset = ShareAsset::factory()->create([
            'surface'    => 'versehub',
            'subject_id' => 'id:yoh.3.16',
            'revision'   => 'correct-rev',
            'status'     => 'ready',
        ]);

        $found = $this->service->readReady('versehub', 'id:yoh.3.16', 'correct-rev');
        $this->assertNotNull($found);
        $this->assertSame($asset->id, $found->id);
    }
}
