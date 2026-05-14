<?php

namespace App\Http\Requests;

use App\Models\User;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class ProfileUpdateRequest extends FormRequest
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
     * NOTE:
     * This endpoint supports partial updates (e.g. avatar-only uploads from the avatar button)
     * as well as full profile updates (name/email).
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'name' => ['sometimes', 'required', 'string', 'max:255'],
            'email' => [
                'sometimes',
                'required',
                'string',
                'lowercase',
                'email',
                'max:255',
                Rule::unique(User::class)->ignore($this->user()->id),
            ],
            'birth_date' => ['sometimes', 'nullable', 'date', 'before_or_equal:today'],
            'avatar' => [
                'sometimes',
                'nullable',
                'file',
                'mimetypes:image/jpeg,image/png,image/webp,image/heic,image/heif',
                'max:5120',
            ],
        ];
    }
}
