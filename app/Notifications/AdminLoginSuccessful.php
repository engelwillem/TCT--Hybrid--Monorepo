<?php

namespace App\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class AdminLoginSuccessful extends Notification implements ShouldQueue
{
    use Queueable;

    public function __construct(
        public readonly string $email,
        public readonly string $ip,
        public readonly string $userAgent,
    ) {}

    public function via(object $notifiable): array
    {
        return ['mail'];
    }

    public function toMail(object $notifiable): MailMessage
    {
        return (new MailMessage)
            ->subject('Admin login berhasil (TheChoosenTalk)')
            ->greeting('Notifikasi keamanan')
            ->line("Ada login admin berhasil untuk akun: {$this->email}")
            ->line("IP: {$this->ip}")
            ->line("Device: {$this->userAgent}")
            ->line('Jika ini bukan kamu, segera ganti password dan periksa keamanan email kamu.');
    }
}
