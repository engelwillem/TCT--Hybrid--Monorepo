<?php

namespace App\Console\Commands;

use App\Models\User;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Hash;

class EnsureLocalAdminCommand extends Command
{
    protected $signature = 'app:ensure-local-admin
        {--email= : Admin email (default: ADMIN_LOGIN_EMAIL or engel.willem@gmail.com)}
        {--name= : Admin name (default: ADMIN_LOGIN_NAME or TCT Admin)}
        {--password= : Admin password (default: ADMIN_LOGIN_PASSWORD env)}';

    protected $description = 'Create or update a local admin account safely for development';

    public function handle(): int
    {
        if (! app()->environment(['local', 'testing'])) {
            $this->error('This command is restricted to local/testing environments.');

            return self::FAILURE;
        }

        $email = strtolower(trim((string) ($this->option('email') ?: env('ADMIN_LOGIN_EMAIL', 'engel.willem@gmail.com'))));
        $name = trim((string) ($this->option('name') ?: env('ADMIN_LOGIN_NAME', 'TCT Admin')));
        $password = (string) ($this->option('password') ?: env('ADMIN_LOGIN_PASSWORD', ''));

        if ($email === '' || ! filter_var($email, FILTER_VALIDATE_EMAIL)) {
            $this->error('A valid admin email is required.');

            return self::FAILURE;
        }

        if ($password === '' || strlen($password) < 8) {
            $this->error('A password (min 8 chars) is required via --password or ADMIN_LOGIN_PASSWORD.');

            return self::FAILURE;
        }

        $user = User::query()->firstOrNew(['email' => $email]);
        $user->name = $name !== '' ? $name : $user->name;
        $user->password = Hash::make($password);
        $user->is_admin = true;
        $user->is_it = (bool) $user->is_it;
        $user->is_system = (bool) $user->is_system;
        $user->email_verified_at = $user->email_verified_at ?: now();
        $user->save();

        $this->info('Local admin account ensured.');
        $this->line('Email: '.$user->email);
        $this->line('Admin: yes');
        $this->line('Email verified: '.($user->email_verified_at ? 'yes' : 'no'));

        return self::SUCCESS;
    }
}

