<?php

namespace Tests\Unit\ShareAssets\Revision;

use App\Services\ShareAssets\Revision\CommunityShareRevision;
use App\Services\ShareAssets\Revision\RenunganShareRevision;
use App\Services\ShareAssets\Revision\VersehubShareRevision;
use PHPUnit\Framework\TestCase;

/**
 * Unit tests for revision helper determinism and sensitivity.
 *
 * Guarantees:
 *  1. Revision is stable when inputs don't change (idempotency)
 *  2. Revision changes when source content changes
 *  3. Revision changes when prompt_version changes
 *  4. Revision changes when style_version changes
 *  5. Revision changes when surface-specific inputs change
 */
class ShareRevisionHelperTest extends TestCase
{
    // -------------------------------------------------------------------------
    // CommunityShareRevision
    // -------------------------------------------------------------------------

    public function test_community_revision_is_stable_for_same_inputs(): void
    {
        $r1 = CommunityShareRevision::compute('42', 'Hello world', null, ['/a.jpg'], 'v1', 'v1');
        $r2 = CommunityShareRevision::compute('42', 'Hello world', null, ['/a.jpg'], 'v1', 'v1');

        $this->assertSame($r1, $r2, 'Same inputs must produce same revision');
    }

    public function test_community_revision_changes_when_post_text_changes(): void
    {
        $r1 = CommunityShareRevision::compute('42', 'Hello world', null, [], 'v1', 'v1');
        $r2 = CommunityShareRevision::compute('42', 'Different text', null, [], 'v1', 'v1');

        $this->assertNotSame($r1, $r2, 'Revision must change when text changes');
    }

    public function test_community_revision_changes_when_prompt_version_changes(): void
    {
        $r1 = CommunityShareRevision::compute('42', 'Hello', null, [], 'v1', 'v1');
        $r2 = CommunityShareRevision::compute('42', 'Hello', null, [], 'v2', 'v1');

        $this->assertNotSame($r1, $r2, 'Revision must change when prompt_version changes');
    }

    public function test_community_revision_changes_when_style_version_changes(): void
    {
        $r1 = CommunityShareRevision::compute('42', 'Hello', null, [], 'v1', 'v1');
        $r2 = CommunityShareRevision::compute('42', 'Hello', null, [], 'v1', 'v2');

        $this->assertNotSame($r1, $r2, 'Revision must change when style_version changes');
    }

    public function test_community_revision_changes_when_preview_media_index_changes(): void
    {
        $r1 = CommunityShareRevision::compute('42', 'Hello', 0, ['/a.jpg', '/b.jpg'], 'v1', 'v1');
        $r2 = CommunityShareRevision::compute('42', 'Hello', 1, ['/a.jpg', '/b.jpg'], 'v1', 'v1');

        $this->assertNotSame($r1, $r2, 'Revision must change when preview_media_index changes');
    }

    public function test_community_revision_changes_when_media_paths_change(): void
    {
        $r1 = CommunityShareRevision::compute('42', 'Hello', null, ['/a.jpg'], 'v1', 'v1');
        $r2 = CommunityShareRevision::compute('42', 'Hello', null, ['/b.jpg'], 'v1', 'v1');

        $this->assertNotSame($r1, $r2, 'Revision must change when media_paths change');
    }

    public function test_community_revision_length_is_16(): void
    {
        $revision = CommunityShareRevision::compute('42', 'Hello', null, [], 'v1', 'v1');
        $this->assertSame(16, strlen($revision), 'Revision must be exactly 16 characters');
    }

    // -------------------------------------------------------------------------
    // VersehubShareRevision
    // -------------------------------------------------------------------------

    public function test_versehub_revision_is_stable_for_same_inputs(): void
    {
        $r1 = VersehubShareRevision::compute('id', 'yoh.3.16', 'Karena begitu besar kasih Allah', null, null, 'v1', 'v1');
        $r2 = VersehubShareRevision::compute('id', 'yoh.3.16', 'Karena begitu besar kasih Allah', null, null, 'v1', 'v1');

        $this->assertSame($r1, $r2);
    }

    public function test_versehub_revision_changes_when_verse_text_changes(): void
    {
        $r1 = VersehubShareRevision::compute('id', 'yoh.3.16', 'Text A', null, null, 'v1', 'v1');
        $r2 = VersehubShareRevision::compute('id', 'yoh.3.16', 'Text B', null, null, 'v1', 'v1');

        $this->assertNotSame($r1, $r2);
    }

    public function test_versehub_revision_changes_when_prompt_version_changes(): void
    {
        $r1 = VersehubShareRevision::compute('id', 'yoh.3.16', 'Text', null, null, 'v1', 'v1');
        $r2 = VersehubShareRevision::compute('id', 'yoh.3.16', 'Text', null, null, 'v2', 'v1');

        $this->assertNotSame($r1, $r2);
    }

    public function test_versehub_revision_changes_when_style_version_changes(): void
    {
        $r1 = VersehubShareRevision::compute('id', 'yoh.3.16', 'Text', null, null, 'v1', 'v1');
        $r2 = VersehubShareRevision::compute('id', 'yoh.3.16', 'Text', null, null, 'v1', 'v2');

        $this->assertNotSame($r1, $r2);
    }

    // -------------------------------------------------------------------------
    // RenunganShareRevision
    // -------------------------------------------------------------------------

    public function test_renungan_revision_is_stable_for_same_inputs(): void
    {
        $r1 = RenunganShareRevision::compute('token-abc', 'Ringkasan renungan', 'Yoh 3:16', 'v1', 'v1');
        $r2 = RenunganShareRevision::compute('token-abc', 'Ringkasan renungan', 'Yoh 3:16', 'v1', 'v1');

        $this->assertSame($r1, $r2);
    }

    public function test_renungan_revision_changes_when_excerpt_changes(): void
    {
        $r1 = RenunganShareRevision::compute('token-abc', 'Excerpt A', 'Yoh 3:16', 'v1', 'v1');
        $r2 = RenunganShareRevision::compute('token-abc', 'Excerpt B', 'Yoh 3:16', 'v1', 'v1');

        $this->assertNotSame($r1, $r2);
    }

    public function test_renungan_revision_changes_when_prompt_version_changes(): void
    {
        $r1 = RenunganShareRevision::compute('token-abc', 'Excerpt', 'Yoh 3:16', 'v1', 'v1');
        $r2 = RenunganShareRevision::compute('token-abc', 'Excerpt', 'Yoh 3:16', 'v2', 'v1');

        $this->assertNotSame($r1, $r2);
    }

    public function test_renungan_revision_changes_when_style_version_changes(): void
    {
        $r1 = RenunganShareRevision::compute('token-abc', 'Excerpt', 'Yoh 3:16', 'v1', 'v1');
        $r2 = RenunganShareRevision::compute('token-abc', 'Excerpt', 'Yoh 3:16', 'v1', 'v2');

        $this->assertNotSame($r1, $r2);
    }
}
