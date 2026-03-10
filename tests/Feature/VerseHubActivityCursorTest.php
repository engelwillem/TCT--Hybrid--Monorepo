<?php

namespace Tests\Feature;

use App\Models\User;
use App\Models\UserVerseAction;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class VerseHubActivityCursorTest extends TestCase
{
    use RefreshDatabase;
    private const ACTIVITY_URL = '/versehub/id/my-spiritual-journey';

    public function test_recent_cursor_loads_next_page_without_duplicates(): void
    {
        $user = User::factory()->create();
        foreach (range(1, 25) as $i) {
            $this->makeAction($user, [
                'book_code' => 'kej',
                'chapter' => 1,
                'verse' => $i,
                'bookmarked' => true,
                'updated_at' => now()->subMinutes($i),
            ]);
        }

        $first = $this->actingAs($user)->getJson(self::ACTIVITY_URL . '?tab=all&sort=recent&per_page=20');
        $first->assertOk();
        $items1 = $first->json('items');
        $this->assertCount(20, $items1);
        $cursor = (string) $first->json('page.next_cursor');
        $this->assertNotSame('', $cursor);

        $second = $this->actingAs($user)->getJson(self::ACTIVITY_URL . '?tab=all&sort=recent&per_page=20&cursor='.urlencode($cursor));
        $second->assertOk();
        $items2 = $this->flattenGrouped($second->json('grouped_rows'));
        $this->assertCount(5, $items2);

        $refs1 = array_column($items1, 'ref');
        $refs2 = array_column($items2, 'ref');
        $this->assertCount(0, array_intersect($refs1, $refs2));
    }

    public function test_oldest_cursor_loads_next_page_without_duplicates(): void
    {
        $user = User::factory()->create();
        foreach (range(1, 25) as $i) {
            $this->makeAction($user, [
                'book_code' => 'yes',
                'chapter' => 41,
                'verse' => $i,
                'bookmarked' => true,
                'updated_at' => now()->subMinutes($i),
            ]);
        }

        $first = $this->actingAs($user)->getJson(self::ACTIVITY_URL . '?tab=all&sort=oldest&per_page=20');
        $first->assertOk();
        $items1 = $first->json('items');
        $this->assertCount(20, $items1);
        $cursor = (string) $first->json('page.next_cursor');

        $second = $this->actingAs($user)->getJson(self::ACTIVITY_URL . '?tab=all&sort=oldest&per_page=20&cursor='.urlencode($cursor));
        $second->assertOk();
        $items2 = $this->flattenGrouped($second->json('grouped_rows'));
        $this->assertCount(5, $items2);

        $refs1 = array_column($items1, 'ref');
        $refs2 = array_column($items2, 'ref');
        $this->assertCount(0, array_intersect($refs1, $refs2));
    }

    public function test_tab_filter_works_with_cursor(): void
    {
        $user = User::factory()->create();
        foreach (range(1, 24) as $i) {
            $this->makeAction($user, [
                'book_code' => 'mzm',
                'chapter' => 119,
                'verse' => $i,
                'favorited' => true,
                'updated_at' => now()->subMinutes($i),
            ]);
        }
        foreach (range(30, 32) as $i) {
            $this->makeAction($user, [
                'book_code' => 'mzm',
                'chapter' => 120,
                'verse' => $i,
                'bookmarked' => true,
                'updated_at' => now()->subMinutes($i),
            ]);
        }

        $first = $this->actingAs($user)->getJson(self::ACTIVITY_URL . '?tab=favorites&sort=recent&per_page=20');
        $first->assertOk();
        $items1 = $first->json('items');
        $this->assertCount(20, $items1);
        foreach ($items1 as $item) {
            $this->assertTrue((bool) ($item['is_favorite'] ?? false));
        }

        $cursor = (string) $first->json('page.next_cursor');
        $second = $this->actingAs($user)->getJson(self::ACTIVITY_URL . '?tab=favorites&sort=recent&per_page=20&cursor='.urlencode($cursor));
        $second->assertOk();
        foreach ($this->flattenGrouped($second->json('grouped_rows')) as $item) {
            $this->assertTrue((bool) ($item['is_favorite'] ?? false));
        }
    }

    public function test_search_filter_works_and_invalid_cursor_is_ignored(): void
    {
        $user = User::factory()->create();
        $this->makeAction($user, [
            'book_code' => 'kej',
            'chapter' => 1,
            'verse' => 1,
            'bookmarked' => true,
            'updated_at' => now()->subMinutes(1),
        ]);
        $this->makeAction($user, [
            'book_code' => 'yes',
            'chapter' => 41,
            'verse' => 10,
            'bookmarked' => true,
            'updated_at' => now()->subMinutes(2),
        ]);

        $res = $this->actingAs($user)->getJson(self::ACTIVITY_URL . '?tab=all&q=kej&sort=recent&per_page=20&cursor=invalid-cursor');
        $res->assertOk();
        $items = $res->json('items');
        $this->assertCount(1, $items);
        $this->assertSame('kej', $items[0]['book']);
    }

    public function test_quote_of_week_is_truncated_to_180_chars(): void
    {
        $user = User::factory()->create();
        $longNote = str_repeat('A', 220);
        $this->makeAction($user, [
            'book_code' => 'yoh',
            'chapter' => 3,
            'verse' => 16,
            'note_text' => $longNote,
            'updated_at' => now()->subMinutes(1),
        ]);

        $res = $this->actingAs($user)->getJson(self::ACTIVITY_URL . '?tab=notes&sort=recent&per_page=20');
        $res->assertOk();
        $quote = (string) $res->json('activity_stats.quote_of_week');
        $this->assertTrue(strlen($quote) <= 183);
        $this->assertStringEndsWith('...', $quote);
    }

    private function makeAction(User $user, array $attrs): void
    {
        $row = new UserVerseAction();
        $row->user_id = $user->id;
        $row->lang = 'id';
        $row->book_code = (string) ($attrs['book_code'] ?? 'kej');
        $row->chapter = (int) ($attrs['chapter'] ?? 1);
        $row->verse = (int) ($attrs['verse'] ?? 1);
        $row->favorited = (bool) ($attrs['favorited'] ?? false);
        $row->bookmarked = (bool) ($attrs['bookmarked'] ?? false);
        $row->highlighted = false;
        $row->highlight_color = null;
        $row->note_text = (string) ($attrs['note_text'] ?? '');
        $row->created_at = $attrs['updated_at'] ?? now();
        $row->updated_at = $attrs['updated_at'] ?? now();
        $row->save();
    }

    private function flattenGrouped(mixed $groups): array
    {
        if (!is_array($groups)) return [];
        $flat = [];
        foreach ($groups as $group) {
            if (!is_array($group)) continue;
            $items = $group['items'] ?? null;
            if (!is_array($items)) continue;
            foreach ($items as $item) {
                if (is_array($item)) $flat[] = $item;
            }
        }
        return $flat;
    }
}
