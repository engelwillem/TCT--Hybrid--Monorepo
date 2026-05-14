<?php

namespace App\Services\Engagement;

use App\Models\User;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

class SystemAccountService
{
    const EMAIL_SHEPHERD = 'editor@thechoosentalks.com';

    const EMAIL_ENCOURAGER = 'encourager@thechoosentalks.com';

    /**
     * Get the official "The Shepherd" user (Editorial/Wisdom).
     */
    public function getShepherd(): User
    {
        return $this->ensureAccount(self::EMAIL_SHEPHERD, [
            'name' => 'The Shepherd',
            'is_admin' => true,
        ]);
    }

    /**
     * Get the official "The Encourager" user (Support/Prayer).
     */
    public function getEncourager(): User
    {
        return $this->ensureAccount(self::EMAIL_ENCOURAGER, [
            'name' => 'The Encourager',
            'is_admin' => false,
        ]);
    }

    /**
     * Ensure all system accounts exist in the database.
     */
    public function ensureSystemAccounts(): void
    {
        $this->getShepherd();
        $this->getEncourager();
    }

    /**
     * Internal helper to find or create a system account.
     */
    protected function ensureAccount(string $email, array $defaults): User
    {
        return User::updateOrCreate(
            ['email' => $email],
            array_merge([
                'password' => Hash::make(Str::random(32)),
                'email_verified_at' => now(),
            ], $defaults)
        );
    }
}
