<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Str;

class FirebaseAuthSyncController extends Controller
{
    public function sync(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'idToken' => ['required', 'string'],
        ]);

        $webApiKey = (string) config('services.firebase.web_api_key');
        if ($webApiKey === '') {
            return response()->json([
                'message' => 'Firebase web API key is not configured on backend.',
            ], 500);
        }

        $lookup = Http::timeout(10)
            ->acceptJson()
            ->post("https://identitytoolkit.googleapis.com/v1/accounts:lookup?key={$webApiKey}", [
                'idToken' => $validated['idToken'],
            ]);

        if (! $lookup->ok()) {
            return response()->json([
                'message' => 'Invalid Firebase ID token.',
            ], 401);
        }

        $remoteUser = $lookup->json('users.0');
        if (! is_array($remoteUser)) {
            return response()->json([
                'message' => 'Unable to read Firebase user payload.',
            ], 422);
        }

        $firebaseUid = trim((string) ($remoteUser['localId'] ?? ''));
        if ($firebaseUid === '') {
            return response()->json([
                'message' => 'Firebase payload is missing uid.',
            ], 422);
        }

        $email = trim((string) ($remoteUser['email'] ?? ''));
        $displayName = trim((string) ($remoteUser['displayName'] ?? ''));
        $photoUrl = trim((string) ($remoteUser['photoUrl'] ?? ''));
        $emailVerified = (bool) ($remoteUser['emailVerified'] ?? false);

        $user = User::query()
            ->where('firebase_uid', $firebaseUid)
            ->when($email !== '', fn ($query) => $query->orWhere('email', $email))
            ->first();

        $generatedEmail = false;
        if ($email === '') {
            $email = "{$firebaseUid}@firebase.local";
            $generatedEmail = true;
        }

        if (! $user) {
            $user = User::query()->create([
                'name' => $displayName !== '' ? $displayName : 'Chosen User',
                'email' => $email,
                'firebase_uid' => $firebaseUid,
                'password' => Str::random(40),
                'avatar_path' => null,
                'email_verified_at' => $emailVerified ? now() : null,
            ]);
        } else {
            $dirty = false;

            if (! $user->firebase_uid) {
                $user->firebase_uid = $firebaseUid;
                $dirty = true;
            }

            if ($displayName !== '' && $displayName !== $user->name) {
                $user->name = $displayName;
                $dirty = true;
            }

            if (! $generatedEmail && $email !== '' && $email !== $user->email) {
                $emailTaken = User::query()
                    ->where('email', $email)
                    ->where('id', '!=', $user->id)
                    ->exists();

                if (! $emailTaken) {
                    $user->email = $email;
                    $dirty = true;
                }
            }

            if ($emailVerified && ! $user->email_verified_at) {
                $user->email_verified_at = now();
                $dirty = true;
            }

            if ($dirty) {
                $user->save();
            }
        }

        if ($photoUrl !== '' && str_starts_with($photoUrl, '/storage/')) {
            $photoPath = ltrim(Str::after($photoUrl, '/storage/'), '/');
            if ($photoPath !== '' && $photoPath !== $user->avatar_path) {
                $user->avatar_path = $photoPath;
                $user->save();
            }
        }

        $user->tokens()->where('name', 'next-web')->delete();
        $token = $user->createToken('next-web')->plainTextToken;

        return response()->json([
            'data' => [
                'token' => $token,
                'user' => [
                    'id' => (string) $user->id,
                    'firebaseUid' => (string) ($user->firebase_uid ?? ''),
                    'name' => (string) $user->name,
                    'email' => (string) $user->email,
                    'avatarUrl' => $user->getFilamentAvatarUrl(),
                ],
            ],
        ]);
    }

    /**
     * Logout & Revoke Token
     * Ensures the Sanctum token is destroyed in MySQL when user logs out of the frontend.
     */
    public function logout(Request $request): JsonResponse
    {
        if ($request->user()) {
            $request->user()->currentAccessToken()->delete();
        }

        return response()->json([
            'message' => 'Sesi berhasil diakhiri.',
        ]);
    }
}
