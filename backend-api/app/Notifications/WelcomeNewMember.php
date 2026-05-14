<?php

namespace App\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Notification;

class WelcomeNewMember extends Notification
{
    use Queueable;

    /**
     * Create a new notification instance.
     */
    public function __construct()
    {
        //
    }

    /**
     * Get the notification's delivery channels.
     *
     * @return array<int, string>
     */
    public function via(object $notifiable): array
    {
        return ['database'];
    }

    /**
     * Get the array representation of the notification.
     *
     * @return array<string, mixed>
     */
    public function toArray(object $notifiable): array
    {
        return [
            'title' => 'Welcome Chosen People',
            'body' => "Hi {$notifiable->name}, welcome to The Choose n Talks!",
            'from' => [
                'type' => 'admin',
                'name' => 'Admin',
            ],
            // A simple deep link that we can reuse later.
            'action' => [
                'label' => 'Open inbox',
                'href' => '/today',
            ],
        ];
    }
}
