<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class UserNotificationPreferenceUpdateRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user() !== null;
    }

    public function rules(): array
    {
        return [
            'email' => ['required', 'boolean'],
            'in_app' => ['required', 'boolean'],
            'whatsapp' => ['required', 'boolean'],
            'timezone' => ['nullable', 'timezone:all'],
            'quiet_hours_start' => ['nullable', 'date_format:H:i'],
            'quiet_hours_end' => ['nullable', 'date_format:H:i'],
            'reminder_worship_enabled' => ['nullable', 'boolean'],
            'reminder_worship_time' => ['nullable', 'date_format:H:i'],
            'reminder_class_enabled' => ['nullable', 'boolean'],
            'reminder_class_time' => ['nullable', 'date_format:H:i'],
            'reminder_visit_enabled' => ['nullable', 'boolean'],
            'reminder_visit_time' => ['nullable', 'date_format:H:i'],
        ];
    }
}
