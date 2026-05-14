<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreMemberPostRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'type' => ['required', 'string', 'in:member_post,user_post,prayer_request,testimony,reflection,discussion_prompt'],
            'title' => ['nullable', 'string', 'max:255'],
            'text' => ['required', 'string', 'min:3', 'max:5000'],
            'metadata' => ['nullable', 'array'],
            'channel_ids' => ['nullable', 'array'],
            'channel_ids.*' => ['exists:channels,id'],
            'expires_at' => ['nullable', 'date', 'after:now'],
        ];
    }
}
