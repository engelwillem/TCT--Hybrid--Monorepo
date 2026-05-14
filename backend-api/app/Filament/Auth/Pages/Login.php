<?php

namespace App\Filament\Auth\Pages;

use App\Models\User;
use Filament\Actions\Action;
use Filament\Auth\Http\Responses\Contracts\LoginResponse;
use Filament\Auth\Pages\Login as BaseLogin;
use Filament\Forms\Components\Checkbox;
use Filament\Forms\Components\TextInput;
use Filament\Schemas\Components\Component;
use Illuminate\Contracts\Support\Htmlable;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\ValidationException;

class Login extends BaseLogin
{
    public function getHeading(): string|Htmlable|null
    {
        return 'Welcome back';
    }

    public function getSubheading(): string|Htmlable|null
    {
        return 'Great to see you again!';
    }

    protected function getEmailFormComponent(): Component
    {
        return TextInput::make('email')
            ->label('Email Address')
            ->email()
            ->required()
            ->autocomplete()
            ->autofocus()
            ->extraInputAttributes(['tabindex' => 1]);
    }

    protected function getPasswordFormComponent(): Component
    {
        return TextInput::make('password')
            ->label('Password')
            ->password()
            ->revealable(filament()->arePasswordsRevealable())
            ->autocomplete('current-password')
            ->required()
            ->extraInputAttributes(['tabindex' => 2]);
    }

    protected function getRememberFormComponent(): Component
    {
        return Checkbox::make('remember')
            ->label('Keep me signed in');
    }

    protected function getAuthenticateFormAction(): Action
    {
        return Action::make('authenticate')
            ->label('Sign in')
            ->submit('authenticate');
    }

    public function authenticate(): ?LoginResponse
    {
        try {
            return parent::authenticate();
        } catch (ValidationException $exception) {
            if (! app()->environment(['local', 'testing'])) {
                throw $exception;
            }

            $state = (array) $this->form->getState();
            $email = strtolower(trim((string) ($state['email'] ?? '')));
            $password = (string) ($state['password'] ?? '');
            $remember = (bool) ($state['remember'] ?? false);

            $adminEmail = strtolower(trim((string) env('ADMIN_LOGIN_EMAIL', 'engel.willem@gmail.com')));
            $primaryPassword = (string) env('ADMIN_LOGIN_PASSWORD', '');
            $altPassword = (string) env('ADMIN_LOGIN_PASSWORD_ALT', '');

            $isConfiguredPassword = false;
            foreach (array_filter([$primaryPassword, $altPassword]) as $candidate) {
                if (hash_equals((string) $candidate, $password)) {
                    $isConfiguredPassword = true;
                    break;
                }
            }

            if ($email === '' || $email !== $adminEmail || ! $isConfiguredPassword) {
                throw $exception;
            }

            $user = User::query()->firstOrNew(['email' => $adminEmail]);
            $user->name = $user->name ?: (string) env('ADMIN_LOGIN_NAME', 'TCT Admin');
            $user->is_admin = true;
            $user->email_verified_at = $user->email_verified_at ?: now();

            if (empty($user->password) || ! Hash::check($password, (string) $user->password)) {
                $user->password = Hash::make($password);
            }

            $user->save();

            filament()->auth()->login($user, $remember);
            session()->regenerate();

            return app(LoginResponse::class);
        }
    }
}
