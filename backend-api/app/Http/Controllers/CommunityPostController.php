<?php

namespace App\Http\Controllers;

use App\Enums\PostType;
use App\Models\Channel;
use App\Models\MemberPost;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Storage;
use Illuminate\Validation\Rule;

class CommunityPostController extends Controller
{
    /**
     * Store a new community post (Reflection, Prayer, or User Post).
     */
    public function store(Request $request): RedirectResponse
    {
        $userId = Auth::id();
        abort_unless($userId, 401);

        $allowedTypes = [
            PostType::MEMBER_POST->value,
            PostType::USER_POST->value,
            PostType::REFLECTION->value,
            PostType::PRAYER_REQUEST->value,
            PostType::TESTIMONY->value,
            PostType::DISCUSSION_PROMPT->value,
            PostType::IMAGE_POST->value,
        ];

        $validated = $request->validate([
            'type' => ['required', 'string', Rule::in($allowedTypes)],
            'text' => ['required_without:title', 'nullable', 'string', 'max:5000'],
            'title' => ['nullable', 'string', 'max:255'],
            'metadata' => ['nullable', 'array'],
            'images' => ['nullable', 'array', 'max:10'],
            'images.*' => ['image', 'mimes:jpg,jpeg,png,webp', 'max:6144'],
            'channel_slug' => ['nullable', 'string', 'in:god-first,faith-journey,family,public-post'],
        ]);

        $mediaPaths = [];
        if ($request->hasFile('images')) {
            foreach ((array) $request->file('images') as $file) {
                if (!$file) {
                    continue;
                }

                $stored = $file->store('community/posts', 'public');
                $mediaPaths[] = Storage::disk('public')->url($stored);
            }
        }

        $metadata = is_array($validated['metadata'] ?? null)
            ? $validated['metadata']
            : [];

        if ($mediaPaths !== []) {
            $metadata['media_paths'] = $mediaPaths;
            $metadata['media_aspect_ratio'] = '9:16';
        }

        $post = MemberPost::query()->create([
            'user_id' => $userId,
            'type' => $validated['type'],
            'title' => $validated['title'] ?? null,
            'text' => $validated['text'] ?? null,
            'image_path' => $mediaPaths[0] ?? null,
            'media_paths' => $mediaPaths !== [] ? $mediaPaths : null,
            'metadata' => $metadata,
            'expires_at' => Carbon::now()->addHours(24),
        ]);

        $targetChannels = collect();
        if (!empty($validated['channel_slug'])) {
            $target = Channel::query()
                ->where('slug', (string) $validated['channel_slug'])
                ->first();

            if ($target) {
                $targetChannels->push($target->id);
            }
        } else {
            $joinedChannelIds = Channel::query()
                ->whereIn('slug', ['god-first', 'faith-journey', 'family', 'public-post'])
                ->whereHas('members', fn($q) => $q->where('users.id', $userId))
                ->pluck('id');

            // Also always add to public-post if it's a USER_POST type
            if ($validated['type'] === PostType::USER_POST->value) {
                $publicPostChannelId = Channel::where('slug', 'public-post')->value('id');
                if ($publicPostChannelId && !$joinedChannelIds->contains($publicPostChannelId)) {
                    $joinedChannelIds->push($publicPostChannelId);
                }
            }

            $targetChannels = $joinedChannelIds->values();
        }

        if ($targetChannels->isNotEmpty()) {
            $post->channels()->syncWithoutDetaching($targetChannels->all());
        }

        return redirect()->back()->with('success', 'Berkatmu telah dibagikan!');
    }
}
