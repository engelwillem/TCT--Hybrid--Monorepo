<?php

namespace App\Http\Controllers;

use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Redirect;

class NotificationController extends Controller
{
    public function readAll(Request $request): RedirectResponse
    {
        $user = $request->user();

        if ($user) {
            $user->unreadNotifications->markAsRead();
            Cache::forget("notifications:payload:user:{$user->id}");
        }

        return Redirect::back();
    }
}
