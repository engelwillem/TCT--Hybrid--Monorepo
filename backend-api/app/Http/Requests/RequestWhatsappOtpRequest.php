<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class RequestWhatsappOtpRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user() !== null;
    }

    public function rules(): array
    {
        return [
            'phone' => ['required', 'string', 'max:40'],
        ];
    }
}

