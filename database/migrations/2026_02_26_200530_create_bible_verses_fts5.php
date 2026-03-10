<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        // FTS5 is available on SQLite only.
        if (DB::getDriverName() !== 'sqlite') {
            return;
        }

        // SQLite FTS5 virtual table.
        // We keep a separate FTS index for fast full-text searching.
        // Content is synced via triggers from `bible_verses`.
        DB::statement(<<<'SQL'
            CREATE VIRTUAL TABLE IF NOT EXISTS bible_verses_fts USING fts5(
                provider UNINDEXED,
                lang UNINDEXED,
                book_code UNINDEXED,
                chapter UNINDEXED,
                verse UNINDEXED,
                reference,
                text,
                tokenize = 'unicode61'
            );
        SQL);

        // Seed index from existing bible_verses.
        DB::statement(<<<'SQL'
            INSERT INTO bible_verses_fts (rowid, provider, lang, book_code, chapter, verse, reference, text)
            SELECT id, provider, lang, book_code, chapter, verse, reference, text
            FROM bible_verses
            WHERE id NOT IN (SELECT rowid FROM bible_verses_fts);
        SQL);

        // Triggers to keep FTS in sync.
        DB::statement(<<<'SQL'
            CREATE TRIGGER IF NOT EXISTS bible_verses_ai AFTER INSERT ON bible_verses BEGIN
              INSERT INTO bible_verses_fts(rowid, provider, lang, book_code, chapter, verse, reference, text)
              VALUES (new.id, new.provider, new.lang, new.book_code, new.chapter, new.verse, new.reference, new.text);
            END;
        SQL);

        DB::statement(<<<'SQL'
            CREATE TRIGGER IF NOT EXISTS bible_verses_ad AFTER DELETE ON bible_verses BEGIN
              DELETE FROM bible_verses_fts WHERE rowid = old.id;
            END;
        SQL);

        DB::statement(<<<'SQL'
            CREATE TRIGGER IF NOT EXISTS bible_verses_au AFTER UPDATE ON bible_verses BEGIN
              UPDATE bible_verses_fts
              SET provider = new.provider,
                  lang = new.lang,
                  book_code = new.book_code,
                  chapter = new.chapter,
                  verse = new.verse,
                  reference = new.reference,
                  text = new.text
              WHERE rowid = old.id;
            END;
        SQL);
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        if (DB::getDriverName() !== 'sqlite') {
            return;
        }

        // Drop triggers then virtual table.
        DB::statement('DROP TRIGGER IF EXISTS bible_verses_ai');
        DB::statement('DROP TRIGGER IF EXISTS bible_verses_ad');
        DB::statement('DROP TRIGGER IF EXISTS bible_verses_au');

        DB::statement('DROP TABLE IF EXISTS bible_verses_fts');
    }
};
