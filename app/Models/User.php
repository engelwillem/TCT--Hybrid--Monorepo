<?php

namespace App\Models;

use Illuminate\Contracts\Auth\MustVerifyEmail;
use Filament\Models\Contracts\FilamentUser;
use Filament\Panel;
use Filament\Auth\MultiFactor\App\Contracts\HasAppAuthentication;
use Filament\Auth\MultiFactor\App\Contracts\HasAppAuthenticationRecovery;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;
use Illuminate\Notifications\Notifiable;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;

class User extends Authenticatable implements MustVerifyEmail, FilamentUser, HasAppAuthentication, HasAppAuthenticationRecovery
{
    /** @use HasFactory<\Database\Factories\UserFactory> */
    use HasFactory, Notifiable;

    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $fillable = [
        'name',
        'email',
        'avatar_path',
        'password',
        'is_admin',
        'is_it',
        'is_system',
        'system_type',
    ];

    /**
     * The attributes that should be hidden for serialization.
     *
     * @var list<string>
     */
    protected $hidden = [
        'password',
        'remember_token',
        'app_authentication_secret',
        'app_authentication_recovery_codes',
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'last_seen_at' => 'datetime',
            'password' => 'hashed',
            'is_admin' => 'boolean',
            'is_it' => 'boolean',
            'is_system' => 'boolean',
            'app_authentication_recovery_codes' => 'array',
        ];
    }

    public function hasOpsDetailAccess(): bool
    {
        return (bool) ($this->is_admin || $this->is_it);
    }

    public function canAccessPanel(Panel $panel): bool
    {
        return (bool) $this->is_admin;
    }

    public function getAppAuthenticationSecret(): ?string
    {
        return $this->app_authentication_secret;
    }

    public function saveAppAuthenticationSecret(?string $secret): void
    {
        $this->forceFill([
            'app_authentication_secret' => $secret,
        ])->save();
    }

    public function getAppAuthenticationHolderName(): string
    {
        // Shown inside the authenticator app.
        return (string) $this->email;
    }

    public function getAppAuthenticationRecoveryCodes(): ?array
    {
        /** @var array<string> | null $codes */
        $codes = $this->app_authentication_recovery_codes;

        return $codes;
    }

    public function saveAppAuthenticationRecoveryCodes(?array $codes): void
    {
        $this->forceFill([
            'app_authentication_recovery_codes' => $codes,
        ])->save();
    }

    public function getFilamentAvatarUrl(): ?string
    {
        // Keep URL relative so it doesn't depend on APP_URL host.
        return $this->avatar_path
            ? '/storage/' . $this->avatar_path
            : null;
    }

    public function isSystemAccount(): bool
    {
        return in_array($this->email, [
            \App\Services\Engagement\SystemAccountService::EMAIL_SHEPHERD,
            \App\Services\Engagement\SystemAccountService::EMAIL_ENCOURAGER,
        ]);
    }

    public function lessonProgresses(): HasMany
    {
        return $this->hasMany(UserLessonProgress::class);
    }

    public function memberPosts(): HasMany
    {
        return $this->hasMany(MemberPost::class);
    }

    public function memberPostComments(): HasMany
    {
        return $this->hasMany(MemberPostComment::class);
    }

    public function memberPostReactions(): HasMany
    {
        return $this->hasMany(MemberPostReaction::class);
    }

    public function memberPostBookmarks(): HasMany
    {
        return $this->hasMany(MemberPostBookmark::class);
    }

    public function memberPostReports(): HasMany
    {
        return $this->hasMany(MemberPostReport::class);
    }

    public function verseActions(): HasMany
    {
        return $this->hasMany(UserVerseAction::class);
    }

    public function journalDrafts(): HasMany
    {
        return $this->hasMany(UserJournalDraft::class);
    }

    public function metric(): HasOne
    {
        return $this->hasOne(UserMetric::class);
    }

    public function following(): BelongsToMany
    {
        return $this->belongsToMany(
            self::class,
            'user_follows',
            'follower_id',
            'followed_id'
        )->withTimestamps();
    }

    public function followers(): BelongsToMany
    {
        return $this->belongsToMany(
            self::class,
            'user_follows',
            'followed_id',
            'follower_id'
        )->withTimestamps();
    }

    public function sentDirectMessages(): HasMany
    {
        return $this->hasMany(DirectMessage::class, 'sender_id');
    }

    public function receivedDirectMessages(): HasMany
    {
        return $this->hasMany(DirectMessage::class, 'recipient_id');
    }

    public function mentorSessions(): HasMany
    {
        return $this->hasMany(UserMentorSession::class);
    }

    public function studyPathProgress(): HasMany
    {
        return $this->hasMany(UserStudyPathProgress::class);
    }

    public function activeStudyPaths(): BelongsToMany
    {
        return $this->belongsToMany(StudyPath::class, 'user_study_path_progress', 'user_id', 'path_id')
            ->withPivot('last_step_order', 'completed_at')
            ->withTimestamps();
    }
}
