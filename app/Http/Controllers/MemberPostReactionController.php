<?php

namespace App\Http\Controllers;

use App\Models\MemberPost;
use App\Models\MemberPostReaction;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\Auth;

class MemberPostReactionController extends Controller
{
    public function __construct(
        protected \App\Services\Interaction\SpiritualInteractionService $interactionService
    ) {
    }

    public function togglePray(MemberPost $memberPost): RedirectResponse
    {
        $this->interactionService->toggleReaction($memberPost, Auth::user(), 'pray');
        return redirect()->back();
    }
}
