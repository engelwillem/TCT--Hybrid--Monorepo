<?php

namespace App\Filament\Auth\Pages\PasswordReset;

use Filament\Auth\Pages\PasswordReset\ResetPassword as BaseResetPassword;
use Filament\Notifications\Notification;
use Illuminate\Support\Str;

class ResetPassword extends BaseResetPassword
{
    private function allowedAdminEmail(): string
    {
        $email = (string) config('admin.password_reset_email');

        return Str::lower($email);
    }

    public function mount(?string $email = null, ?string $token = null): void
    {
        parent::mount($email, $token);

        $state = $this->form->getState();
        $incoming = Str::lower((string) ($state['email'] ?? ''));

        if ($this->allowedAdminEmail() !== '' && $incoming !== $this->allowedAdminEmail()) {
            // Block reset for any other email.
            abort(403);
        }
    }

    public function resetPassword(): ?\Filament\Auth\Http\Responses\Contracts\PasswordResetResponse
    {
        $state = $this->form->getState();
        $incoming = Str::lower((string) ($state['email'] ?? $this->email ?? ''));

        if ($this->allowedAdminEmail() !== '' && $incoming !== $this->allowedAdminEmail()) {
            Notification::make()
                ->title(__('passwords.user'))
                ->danger()
                ->send();

            return null;
        }

        return parent::resetPassword();
    }
}
