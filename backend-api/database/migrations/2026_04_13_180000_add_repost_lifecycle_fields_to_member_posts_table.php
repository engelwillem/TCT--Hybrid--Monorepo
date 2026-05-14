<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (! Schema::hasColumn('member_posts', 'activated_at')) {
            Schema::table('member_posts', function (Blueprint $table): void {
                $table->timestamp('activated_at')->nullable()->after('created_at');
            });
        }

        if (! Schema::hasColumn('member_posts', 'status')) {
            Schema::table('member_posts', function (Blueprint $table): void {
                $table->string('status', 24)->default('active')->after('type');
            });
        }

        if (! Schema::hasColumn('member_posts', 'repost_count')) {
            Schema::table('member_posts', function (Blueprint $table): void {
                $table->unsignedInteger('repost_count')->default(0)->after('status');
            });
        }

        if (! Schema::hasColumn('member_posts', 'last_reposted_by')) {
            Schema::table('member_posts', function (Blueprint $table): void {
                $table->unsignedBigInteger('last_reposted_by')->nullable()->after('repost_count');
            });
        }

        Schema::table('member_posts', function (Blueprint $table): void {
            $table->index(['status', 'activated_at'], 'member_posts_status_activated_idx');
            $table->index(['status', 'expires_at'], 'member_posts_status_expires_idx');
        });

        // Backfill lifecycle timestamp for existing rows.
        DB::table('member_posts')
            ->whereNull('activated_at')
            ->update([
                'activated_at' => DB::raw('created_at'),
            ]);

        // Backfill status from active/archive semantics used by existing feed.
        $now = Carbon::now()->toDateTimeString();
        DB::table('member_posts')
            ->where(function ($query) use ($now) {
                $query->whereNotNull('expires_at')->where('expires_at', '<=', $now)
                    ->orWhere(function ($legacy) use ($now) {
                        $legacy->whereNull('expires_at')
                            ->where('created_at', '<=', Carbon::parse($now)->subDay()->toDateTimeString());
                    });
            })
            ->update([
                'status' => 'gallery',
            ]);
    }

    public function down(): void
    {
        Schema::table('member_posts', function (Blueprint $table): void {
            $table->dropIndex('member_posts_status_activated_idx');
            $table->dropIndex('member_posts_status_expires_idx');
        });

        if (Schema::hasColumn('member_posts', 'last_reposted_by')) {
            Schema::table('member_posts', function (Blueprint $table): void {
                $table->dropColumn('last_reposted_by');
            });
        }

        if (Schema::hasColumn('member_posts', 'repost_count')) {
            Schema::table('member_posts', function (Blueprint $table): void {
                $table->dropColumn('repost_count');
            });
        }

        if (Schema::hasColumn('member_posts', 'status')) {
            Schema::table('member_posts', function (Blueprint $table): void {
                $table->dropColumn('status');
            });
        }

        if (Schema::hasColumn('member_posts', 'activated_at')) {
            Schema::table('member_posts', function (Blueprint $table): void {
                $table->dropColumn('activated_at');
            });
        }
    }
};
