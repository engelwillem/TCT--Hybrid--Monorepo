<?php

namespace App\Http\Controllers;

use App\Models\Channel;
use App\Models\MemberPost;
use App\Models\Post;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Carbon;

class WeeklyController extends Controller
{
    public function index(string $slug): JsonResponse
    {
        $user = auth()->user();
        $channel = Channel::query()
            ->where('slug', $slug)
            ->withCount('members')
            ->withExists([
                'members as is_joined' => fn ($q) => $q->where('users.id', $user?->id ?? 0),
            ])
            ->firstOrFail();

        $posts = Post::query()
            ->where('channel_id', $channel->id)
            ->where('status', 'published')
            ->orderByDesc('publish_at')
            ->get(['id', 'channel_id', 'title', 'publish_at', 'status']);

        $memberPosts = MemberPost::query()
            ->whereHas('channels', fn ($q) => $q->where('channels.id', $channel->id))
            ->whereNull('hidden_at')
            ->with('user:id,name')
            ->orderByDesc('created_at')
            ->limit(24)
            ->get()
            ->map(fn (MemberPost $post) => [
                'id' => $post->id,
                'type' => $post->type?->value ?? 'member_post',
                'title' => $post->title,
                'text' => $post->text,
                'author' => $post->user?->name,
                'created_at' => optional($post->created_at)?->toISOString(),
            ])
            ->values();

        $payload = [
            'channel' => $channel,
            'posts' => $posts,
            'memberPosts' => $memberPosts,
        ];

        return response()->json($payload);
    }

    public function show(string $slug, string $date): JsonResponse
    {
        $user = auth()->user();
        $channel = Channel::query()
            ->where('slug', $slug)
            ->withCount('members')
            ->withExists([
                'members as is_joined' => fn ($q) => $q->where('users.id', $user?->id ?? 0),
            ])
            ->firstOrFail();

        // date format: YYYY-MM-DD
        abort_unless((bool) preg_match('/^\d{4}-\d{2}-\d{2}$/', $date), 404);

        $post = Post::query()
            ->where('channel_id', $channel->id)
            ->whereDate('publish_at', $date)
            ->where('status', 'published')
            ->firstOrFail();

        $memberPosts = MemberPost::query()
            ->whereHas('channels', fn ($q) => $q->where('channels.id', $channel->id))
            ->whereDate('created_at', Carbon::parse($date)->toDateString())
            ->whereNull('hidden_at')
            ->with('user:id,name')
            ->orderByDesc('created_at')
            ->limit(24)
            ->get()
            ->map(fn (MemberPost $item) => [
                'id' => $item->id,
                'type' => $item->type?->value ?? 'member_post',
                'text' => $item->text,
                'author' => $item->user?->name,
                'created_at' => optional($item->created_at)?->toISOString(),
            ])
            ->values();

        $payload = [
            'channel' => $channel,
            'post' => $post,
            'memberPosts' => $memberPosts,
        ];

        return response()->json($payload);
    }
}
