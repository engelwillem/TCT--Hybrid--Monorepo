<?php

use App\Http\Controllers\Api\V1\CommunityApiController;
use App\Http\Controllers\Api\V1\CommunityAIController;
use App\Http\Controllers\Api\V1\CommunityComposerAnalyticsController;
use App\Http\Controllers\Api\V1\CommunityShareAssetController;
use App\Http\Controllers\Api\V1\AutomationKpiController;
use App\Http\Controllers\Api\V1\FirebaseAuthSyncController;
use App\Http\Controllers\Api\V1\OnboardingController;
use App\Http\Controllers\Api\V1\TodayApiController;
use App\Http\Controllers\Api\V1\UserNotificationPreferenceController;
use App\Http\Controllers\Api\V1\UserWhatsappVerificationController;
use App\Http\Controllers\Api\V1\WaReminderController;
use App\Http\Controllers\Api\V1\RenunganPersonalizationController;
use App\Http\Controllers\Api\V1\RenunganShareController;
use App\Http\Controllers\Api\V1\RenunganShareAssetController;
use App\Http\Controllers\Api\V1\ShareAssetReadController;
use App\Http\Controllers\Api\V1\TodaySessionController;
use App\Http\Controllers\Api\V1\VersehubShareAssetController;
use App\Http\Controllers\Auth\PasswordController;
use App\Http\Controllers\ChannelController;
use App\Http\Controllers\ChannelMembershipController;
use App\Http\Controllers\DirectMessageController;
use App\Http\Controllers\FunnelAnalyticsController;
use App\Http\Controllers\InboxController;
use App\Http\Controllers\InboxThreadController;
use App\Http\Controllers\ProfileController;
use App\Http\Controllers\SabbathSchoolController;
use App\Http\Controllers\SsDayCommentController;
use App\Http\Controllers\StudyPathController;
use App\Http\Controllers\UserFollowController;
use App\Http\Controllers\VersehubActionController;
use App\Http\Controllers\VersehubCommentController;
use App\Http\Controllers\VerseHubController;
use App\Http\Controllers\VerseHubEventController;
use App\Http\Controllers\VerseHubLibraryController;
use App\Http\Controllers\VerseHubReaderController;
use App\Http\Controllers\VerseHubReflectionController;
use App\Http\Controllers\WeeklyController;
use Illuminate\Support\Facades\Route;

Route::get('/today/session', [TodaySessionController::class, 'show']);

Route::prefix('v1')->group(function (): void {
    Route::post('/login', [\App\Http\Controllers\Api\V1\AuthController::class, 'login']);
    Route::post('/register', [\App\Http\Controllers\Api\V1\AuthController::class, 'register']);
    Route::post('/forgot-password', [\App\Http\Controllers\Api\V1\AuthController::class, 'forgotPassword']);
    Route::post('/reset-password', [\App\Http\Controllers\Api\V1\AuthController::class, 'resetPassword']);
    Route::post('/renungan/personalize', [RenunganPersonalizationController::class, 'personalize']);
    Route::get('/renungan/share/{token}', [RenunganShareController::class, 'show']);

    Route::get('/today', [TodayApiController::class, 'show']);
    Route::post('/analytics/funnel', [FunnelAnalyticsController::class, 'store']);

    Route::post('/auth/firebase/sync', [FirebaseAuthSyncController::class, 'sync']);
    Route::get('/avatar/{user}', [ProfileController::class, 'avatar']);
    Route::post('/wa/reminders/send', [WaReminderController::class, 'sendReminder']);
    Route::post('/wa/reminders/sync', [WaReminderController::class, 'syncReminders']);
    Route::post('/wa/reminders/status', [WaReminderController::class, 'reminderStatus']);

    Route::get('/community/posts', [CommunityApiController::class, 'index']);
    Route::get('/community/media/{path}', [CommunityApiController::class, 'media'])->where('path', '.*');
    Route::get('/community/posts/{memberPost}/comments', [CommunityApiController::class, 'commentsIndex']);
    // Single-post share payload — does NOT load full feed
    Route::get('/community/posts/{memberPost}/share', [CommunityShareAssetController::class, 'show']);
    // Read-only snapshot for OG routes — crawler-safe, no AI calls
    Route::get('/share-assets/{surface}/{subject}/snapshot', [ShareAssetReadController::class, 'snapshot'])
        ->where('subject', '.*');

    Route::prefix('onboarding')->group(function (): void {
        Route::post('/leads', [OnboardingController::class, 'storeLead'])
            ->middleware('throttle:aios-intake');
        Route::get('/runs/{correlationId}/status', [OnboardingController::class, 'statusByCorrelation'])
            ->middleware('throttle:60,1')
            ->where('correlationId', '[A-Za-z0-9._:-]+');
        Route::get('/dashboard/summary', [OnboardingController::class, 'summary'])
            ->middleware('throttle:60,1');
        Route::get('/dashboard/kpi-detail', [OnboardingController::class, 'kpiDetail'])
            ->middleware('throttle:60,1');
        Route::get('/dashboard/recent-runs', [OnboardingController::class, 'recentRuns'])
            ->middleware('throttle:60,1');
        Route::post('/integrations/test', [OnboardingController::class, 'integrationTest'])
            ->middleware('throttle:10,1');
    });

    Route::get('/study-paths/{lang}', [StudyPathController::class, 'index'])
        ->whereIn('lang', ['id', 'en']);
    Route::get('/study-paths/{lang}/{slug}', [StudyPathController::class, 'show'])
        ->whereIn('lang', ['id', 'en']);

    Route::get('/channels', [ChannelController::class, 'index']);
    Route::get('/channels/{slug}', [WeeklyController::class, 'index']);
    Route::get('/channels/{slug}/{date}', [WeeklyController::class, 'show'])
        ->where('date', '\d{4}-\d{2}-\d{2}');

    Route::get('/sabbath-school', [SabbathSchoolController::class, 'index']);
    Route::get('/sabbath-school/{year}/q{quarter}/lesson/{lessonNumber}', [SabbathSchoolController::class, 'lesson']);
    Route::get('/sabbath-school/{year}/q{quarter}/lesson/{lessonNumber}/{dayKey}', [SabbathSchoolController::class, 'day']);
    Route::get('/sabbath-school/{year}/q{quarter}/lesson/{lessonNumber}/{dayKey}/comments', [SsDayCommentController::class, 'index']);

    // VerseHub Reader Core Data
    Route::get('/versehub/{lang}/books', [VerseHubReaderController::class, 'getBooksApi'])
        ->whereIn('lang', ['id', 'en']);
    Route::get('/versehub/{lang}/chapters', [VerseHubReaderController::class, 'chapters'])
        ->whereIn('lang', ['id', 'en']);
    Route::get('/versehub/{lang}/chapter/{ref}', [VerseHubReaderController::class, 'getChapterContentApi'])
        ->whereIn('lang', ['id', 'en']);
    Route::get('/versehub/{lang}/suggest', [VerseHubLibraryController::class, 'suggest'])
        ->whereIn('lang', ['id', 'en']);
    Route::post('/versehub/{lang}/events', [VerseHubEventController::class, 'store'])
        ->whereIn('lang', ['id', 'en']);

    Route::get('/versehub/{lang}/{ref}/mentor', [VerseHubController::class, 'mentorInsights'])
        ->whereIn('lang', ['id', 'en'])
        ->where('ref', '[a-z0-9]+(?:[-_.]\d+){1,3}');
    Route::get('/versehub/{lang}/{ref}/comments', [VersehubCommentController::class, 'index'])
        ->whereIn('lang', ['id', 'en'])
        ->where('ref', '[a-z0-9]+(?:[-_.]\d+){1,3}');

    // Read-only reader actions are guest-safe to prevent noisy 401s on public surfaces.
    Route::get('/versehub/{lang}/reader-actions', [VersehubActionController::class, 'index'])
        ->whereIn('lang', ['id', 'en']);
    Route::get('/versehub/{lang}/actions/summary', [VersehubActionController::class, 'summary'])
        ->whereIn('lang', ['id', 'en']);

    Route::middleware('auth:sanctum')->group(function (): void {
        Route::post('/auth/logout', [FirebaseAuthSyncController::class, 'logout']);
        Route::post('/today/state', [TodayApiController::class, 'updateState']);
        Route::get('/analytics/community/composer', [CommunityComposerAnalyticsController::class, 'index']);

        Route::post('/community/posts', [CommunityApiController::class, 'store']);
        // Share asset prepare — authenticated intent endpoint
        Route::post('/community/posts/{memberPost}/share-assets/prepare', [CommunityShareAssetController::class, 'prepare']);
        Route::post('/versehub/{lang}/{slug}/share-assets/prepare', [VersehubShareAssetController::class, 'prepare'])
            ->whereIn('lang', ['id', 'en'])
            ->where('slug', '[a-z0-9]+(?:[-_.][a-z0-9]+)*');
        Route::post('/renungan/share/{token}/prepare', [RenunganShareAssetController::class, 'prepare']);
        Route::post('/community/ai/assist', [CommunityAIController::class, 'assist']);
        Route::post('/renungan/share', [RenunganShareController::class, 'store']);
        Route::delete('/renungan/share/{token}', [RenunganShareController::class, 'destroy']);
        Route::post('/community/posts/{memberPost}/comments', [CommunityApiController::class, 'commentsStore']);
        Route::post('/community/posts/{memberPost}/pray', [CommunityApiController::class, 'togglePray']);
        Route::post('/community/posts/{memberPost}/bookmark', [CommunityApiController::class, 'toggleBookmark']);
        Route::post('/community/posts/{memberPost}/repost', [CommunityApiController::class, 'repost']);
        Route::get('/community/bookmarks', [CommunityApiController::class, 'listBookmarks']);
        Route::patch('/community/bookmarks/{memberPost}/category', [CommunityApiController::class, 'moveBookmarkCategory']);
        Route::get('/community/bookmark-categories', [CommunityApiController::class, 'listBookmarkCategories']);
        Route::post('/community/bookmark-categories', [CommunityApiController::class, 'createBookmarkCategory']);
        Route::patch('/community/posts/{memberPost}', [CommunityApiController::class, 'update']);
        Route::delete('/community/posts/{memberPost}', [CommunityApiController::class, 'destroy']);

        Route::post('/versehub/{lang}/reader-actions', [VersehubActionController::class, 'upsert'])
            ->whereIn('lang', ['id', 'en']);

        Route::get('/versehub/{lang}/reflections', [VerseHubReflectionController::class, 'index'])
            ->whereIn('lang', ['id', 'en']);
        Route::post('/versehub/{lang}/reflections', [VerseHubReflectionController::class, 'store'])
            ->whereIn('lang', ['id', 'en']);

        Route::post('/versehub/{lang}/{ref}/mentor/ask', [VerseHubController::class, 'mentorAsk'])
            ->whereIn('lang', ['id', 'en'])
            ->where('ref', '[a-z0-9]+(?:[-_.]\d+){1,3}');
        Route::post('/versehub/{lang}/{ref}/comments', [VersehubCommentController::class, 'store'])
            ->whereIn('lang', ['id', 'en'])
            ->where('ref', '[a-z0-9]+(?:[-_.]\d+){1,3}');

        Route::post('/study-paths/{lang}/{slug}/join', [StudyPathController::class, 'join'])
            ->whereIn('lang', ['id', 'en']);
        Route::post('/study-paths/{lang}/{slug}/complete/{stepId}', [StudyPathController::class, 'completeStep'])
            ->whereIn('lang', ['id', 'en'])
            ->whereNumber('stepId');

        Route::get('/inbox', [InboxController::class, 'index'])->name('inbox.index');
        Route::post('/inbox/read-all', [InboxController::class, 'markAllRead'])->name('inbox.readAll');
        Route::post('/inbox/messages', [DirectMessageController::class, 'store']);
        Route::post('/inbox/messages/{directMessage}/approve', [DirectMessageController::class, 'approve']);
        Route::get('/inbox/{user}/messages', [DirectMessageController::class, 'thread'])
            ->whereNumber('user')
            ->name('inbox.messages.thread');
        Route::get('/inbox/{user}', [InboxThreadController::class, 'show'])
            ->whereNumber('user')
            ->name('inbox.show');

        Route::post('/users/{user}/follow-toggle', [UserFollowController::class, 'toggle']);

        Route::get('/profile', [ProfileController::class, 'edit']);
        Route::match(['patch', 'post'], '/profile', [ProfileController::class, 'update']);
        Route::delete('/profile', [ProfileController::class, 'destroy']);
        Route::put('/profile/password', [PasswordController::class, 'update']);
        Route::post('/profile/two-factor/setup', [ProfileController::class, 'twoFactorSetup']);
        Route::post('/profile/two-factor/confirm', [ProfileController::class, 'twoFactorConfirm']);
        Route::delete('/profile/two-factor', [ProfileController::class, 'twoFactorDisable']);
        Route::post('/profile/two-factor/recovery-codes', [ProfileController::class, 'regenerateTwoFactorRecoveryCodes']);
        Route::get('/profile/notification-preferences', [UserNotificationPreferenceController::class, 'show']);
        Route::match(['put', 'patch'], '/profile/notification-preferences', [UserNotificationPreferenceController::class, 'update']);
        Route::get('/profile/whatsapp-verification/status', [UserWhatsappVerificationController::class, 'status']);
        Route::post('/profile/whatsapp-verification/request', [UserWhatsappVerificationController::class, 'requestOtp'])
            ->middleware('throttle:whatsapp-otp-request');
        Route::post('/profile/whatsapp-verification/verify', [UserWhatsappVerificationController::class, 'verifyOtp'])
            ->middleware('throttle:whatsapp-otp-verify');
        Route::get('/profile/automation/kpi', [AutomationKpiController::class, 'summary']);
        Route::post('/profile/automation/workflows/{workflow}/pause', [AutomationKpiController::class, 'pause']);
        Route::post('/profile/automation/workflows/{workflow}/resume', [AutomationKpiController::class, 'resume']);
        Route::post('/profile/automation/events/{automationEvent}/retry', [AutomationKpiController::class, 'retryFailed']);

        Route::get('/wa/dashboard', [WaReminderController::class, 'dashboard']);
        Route::get('/wa/reminders', [WaReminderController::class, 'index']);
        Route::post('/wa/reminders', [WaReminderController::class, 'store']);
        Route::get('/wa/reminders/{id}', [WaReminderController::class, 'show']);
        Route::put('/wa/reminders/{id}', [WaReminderController::class, 'update']);
        Route::delete('/wa/reminders/{id}', [WaReminderController::class, 'destroy']);
        Route::get('/wa/reminders/{id}/logs', [WaReminderController::class, 'logs']);
        Route::get('/wa/owners/resolve', [WaReminderController::class, 'resolveOwner']);
        Route::get('/wa/templates', [WaReminderController::class, 'listTemplates']);
        Route::post('/wa/templates', [WaReminderController::class, 'createTemplate']);
        Route::put('/wa/templates/{id}', [WaReminderController::class, 'updateTemplate']);
        Route::delete('/wa/templates/{id}', [WaReminderController::class, 'deleteTemplate']);
        Route::get('/wa/settings', [WaReminderController::class, 'getSettings']);
        Route::put('/wa/settings', [WaReminderController::class, 'updateSettings']);

        Route::get('/onboarding/leads', [OnboardingController::class, 'listLeads']);
        Route::get('/onboarding/leads/{id}', [OnboardingController::class, 'showLead'])->whereNumber('id');
        Route::post('/onboarding/leads/{id}/retry', [OnboardingController::class, 'retryLead'])->whereNumber('id');
        Route::get('/onboarding/logs', [OnboardingController::class, 'logs']);

        Route::post('/channels/{channel}/membership', [ChannelMembershipController::class, 'toggle']);
        Route::post('/sabbath-school/{year}/q{quarter}/lesson/{lessonNumber}/{dayKey}/comments', [SsDayCommentController::class, 'store']);
        Route::put('/sabbath-school/{year}/q{quarter}/lesson/{lessonNumber}/{dayKey}/comments/{commentId}', [SsDayCommentController::class, 'update'])
            ->whereNumber('commentId');
        Route::delete('/sabbath-school/{year}/q{quarter}/lesson/{lessonNumber}/{dayKey}/comments/{commentId}', [SsDayCommentController::class, 'destroy'])
            ->whereNumber('commentId');
    });
});
