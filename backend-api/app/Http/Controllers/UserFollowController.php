<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class UserFollowController extends Controller
{
    public function toggle(Request $request, User $user): JsonResponse
    {
        $auth = $request->user();
        abort_unless($auth, 401);

        if ((int) $auth->id === (int) $user->id) {
            return response()->json([
                'ok' => false,
                'message' => 'Cannot follow yourself.',
            ], 422);
        }

        $exists = $auth->following()->where('users.id', $user->id)->exists();

        if ($exists) {
            $auth->following()->detach($user->id);
        } else {
            $auth->following()->syncWithoutDetaching([$user->id]);
        }

        return response()->json([
            'ok' => true,
            'following' => ! $exists,
        ]);
    }
}
