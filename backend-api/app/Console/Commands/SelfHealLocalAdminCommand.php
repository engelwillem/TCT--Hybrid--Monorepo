<?php

namespace App\Console\Commands;

use App\Models\User;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Hash;

class SelfHealLocalAdminCommand extends Command
{
    protected $signature = 'auth:self-heal-local-admin
        {--email= : Admin email (default: ADMIN_LOGIN_EMAIL)}
        {--name= : Admin name (default: ADMIN_LOGIN_NAME)}
        {--password= : Primary admin password (default: ADMIN_LOGIN_PASSWORD)}
        {--alt-password= : Alternate admin password (default: ADMIN_LOGIN_PASSWORD_ALT)}
        {--smoke-login : Verify at least one configured password can authenticate the admin hash}';

    protected $description = 'Self-heal local admin account and optionally run credential smoke validation';

    public function handle(): int
    {
        if (! app()->environment(['local', 'testing'])) {
            $this->error('This command is restricted to local/testing environments.');

            return self::FAILURE;
        }

        $email = strtolower(trim((string) ($this->option('email') ?: env('ADMIN_LOGIN_EMAIL', 'engel.willem@gmail.com'))));
        $name = trim((string) ($this->option('name') ?: env('ADMIN_LOGIN_NAME', 'TCT Admin')));
        $primaryPassword = (string) ($this->option('password') ?: env('ADMIN_LOGIN_PASSWORD', ''));
        $altPassword = (string) ($this->option('alt-password') ?: env('ADMIN_LOGIN_PASSWORD_ALT', ''));

        if ($email === '' || ! filter_var($email, FILTER_VALIDATE_EMAIL)) {
            $this->error('A valid admin email is required.');

            return self::FAILURE;
        }

        if ($primaryPassword !== '' && strlen($primaryPassword) < 8) {
            $this->error('Primary password must be at least 8 characters.');

            return self::FAILURE;
        }

        if ($altPassword !== '' && strlen($altPassword) < 8) {
            $this->error('Alternate password must be at least 8 characters.');

            return self::FAILURE;
        }

        $user = User::query()->firstOrNew(['email' => $email]);
        $user->name = $name !== '' ? $name : ($user->name ?: 'TCT Admin');
        $user->is_admin = true;
        $user->email_verified_at = $user->email_verified_at ?: now();

        if ($primaryPassword !== '') {
            $matchesPrimary = ! empty($user->password) && Hash::check($primaryPassword, (string) $user->password);
            $matchesAlt = $altPassword !== '' && ! empty($user->password) && Hash::check($altPassword, (string) $user->password);

            // Keep existing valid hash if it already matches configured credentials.
            if (! $matchesPrimary && ! $matchesAlt) {
                $user->password = Hash::make($primaryPassword);
            }
        } elseif (empty($user->password)) {
            $this->error('Primary password is empty and user has no password hash. Set ADMIN_LOGIN_PASSWORD.');

            return self::FAILURE;
        }

        $user->save();

        if ($this->option('smoke-login')) {
            $hash = (string) $user->password;
            $primaryOk = $primaryPassword !== '' && Hash::check($primaryPassword, $hash);
            $altOk = $altPassword !== '' && Hash::check($altPassword, $hash);

            if (! $primaryOk && ! $altOk) {
                $this->error('Smoke login failed: no configured password matches current hash.');

                return self::FAILURE;
            }

            $this->info('Smoke login passed.');
            $this->line('primary_ok=' . ($primaryOk ? 'yes' : 'no'));
            $this->line('alt_ok=' . ($altOk ? 'yes' : 'no'));
        }

        $this->info('Local admin self-heal completed.');
        $this->line('email=' . $user->email);
        $this->line('id=' . $user->id);
        $this->line('is_admin=' . ((bool) $user->is_admin ? 'yes' : 'no'));

        return self::SUCCESS;
    }
}

