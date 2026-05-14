<?php

namespace App\Http\Controllers\Api\V1;

use App\Enums\NotificationChannel;
use App\Http\Controllers\Controller;
use App\Http\Requests\UserNotificationPreferenceUpdateRequest;
use App\Models\UserNotificationPreference;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class UserNotificationPreferenceController extends Controller
{
    private const EVENT_KEY = 'global';
    private const DEFAULT_REMINDER_META = [
        'reminder_worship_enabled' => false,
        'reminder_worship_time' => '07:00',
        'reminder_class_enabled' => false,
        'reminder_class_time' => '18:00',
        'reminder_visit_enabled' => false,
        'reminder_visit_time' => '09:00',
    ];

    public function show(Request $request): JsonResponse
    {
        $user = $request->user();
        $timezone = null;
        $quietHoursStart = null;
        $quietHoursEnd = null;

        $channels = [];
        $reminderMeta = self::DEFAULT_REMINDER_META;
        foreach (NotificationChannel::cases() as $channel) {
            $preference = UserNotificationPreference::query()->firstOrCreate(
                [
                    'user_id' => $user->id,
                    'event_key' => self::EVENT_KEY,
                    'channel' => $channel->value,
                ],
                [
                    'enabled' => true,
                ]
            );

            $channels[$channel->value] = (bool) $preference->enabled;
            $timezone = $timezone ?: $preference->timezone;
            $quietHoursStart = $quietHoursStart ?: optional($preference->quiet_hours_start)->format('H:i');
            $quietHoursEnd = $quietHoursEnd ?: optional($preference->quiet_hours_end)->format('H:i');
            $meta = is_array($preference->meta) ? $preference->meta : [];
            foreach (self::DEFAULT_REMINDER_META as $key => $defaultValue) {
                if (array_key_exists($key, $meta) && $meta[$key] !== null && $meta[$key] !== '') {
                    $reminderMeta[$key] = $meta[$key];
                }
            }
        }

        return response()->json([
            'data' => [
                'email' => $channels[NotificationChannel::EMAIL->value] ?? true,
                'in_app' => $channels[NotificationChannel::IN_APP->value] ?? true,
                'whatsapp' => $channels[NotificationChannel::WHATSAPP->value] ?? true,
                'timezone' => $timezone,
                'quiet_hours_start' => $quietHoursStart,
                'quiet_hours_end' => $quietHoursEnd,
                ...$reminderMeta,
            ],
        ]);
    }

    public function update(UserNotificationPreferenceUpdateRequest $request): JsonResponse
    {
        $user = $request->user();
        $validated = $request->validated();
        $timezone = $validated['timezone'] ?? null;
        $quietHoursStart = isset($validated['quiet_hours_start']) ? $validated['quiet_hours_start'].':00' : null;
        $quietHoursEnd = isset($validated['quiet_hours_end']) ? $validated['quiet_hours_end'].':00' : null;
        $reminderMeta = [
            'reminder_worship_enabled' => (bool) ($validated['reminder_worship_enabled'] ?? false),
            'reminder_worship_time' => (string) ($validated['reminder_worship_time'] ?? self::DEFAULT_REMINDER_META['reminder_worship_time']),
            'reminder_class_enabled' => (bool) ($validated['reminder_class_enabled'] ?? false),
            'reminder_class_time' => (string) ($validated['reminder_class_time'] ?? self::DEFAULT_REMINDER_META['reminder_class_time']),
            'reminder_visit_enabled' => (bool) ($validated['reminder_visit_enabled'] ?? false),
            'reminder_visit_time' => (string) ($validated['reminder_visit_time'] ?? self::DEFAULT_REMINDER_META['reminder_visit_time']),
        ];

        $map = [
            NotificationChannel::EMAIL->value => (bool) $validated['email'],
            NotificationChannel::IN_APP->value => (bool) $validated['in_app'],
            NotificationChannel::WHATSAPP->value => (bool) $validated['whatsapp'],
        ];

        foreach ($map as $channel => $enabled) {
            UserNotificationPreference::query()->updateOrCreate(
                [
                    'user_id' => $user->id,
                    'event_key' => self::EVENT_KEY,
                    'channel' => $channel,
                ],
                [
                    'enabled' => $enabled,
                    'timezone' => $timezone,
                    'quiet_hours_start' => $quietHoursStart,
                    'quiet_hours_end' => $quietHoursEnd,
                    'meta' => $reminderMeta,
                ]
            );
        }

        return $this->show($request);
    }
}
