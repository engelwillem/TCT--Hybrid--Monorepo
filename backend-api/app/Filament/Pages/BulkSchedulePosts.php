<?php

namespace App\Filament\Pages;

use App\Models\Channel;
use App\Models\Post;
use BackedEnum;
use Filament\Forms\Components\FileUpload;
use Filament\Forms\Components\Select;
use Filament\Forms\Components\Toggle;
use Filament\Forms\Concerns\InteractsWithForms;
use Filament\Notifications\Notification;
use Filament\Pages\Page;
use Filament\Schemas\Schema;
use Illuminate\Support\Carbon;
use League\Csv\Reader;
use UnitEnum;

class BulkSchedulePosts extends Page
{
    use InteractsWithForms;

    protected static string|BackedEnum|null $navigationIcon = 'heroicon-o-calendar-days';

    protected static string|UnitEnum|null $navigationGroup = 'Content';

    protected static ?string $navigationLabel = 'Bulk Scheduler';

    protected static ?int $navigationSort = 3;

    protected string $view = 'filament.pages.bulk-schedule-posts';

    public ?array $data = [];

    public function mount(): void
    {
        $this->form->fill([
            'dry_run' => true,
        ]);
    }

    public function form(Schema $schema): Schema
    {
        return $schema
            ->schema([
                Select::make('channel_id')
                    ->label('Weekly Channel')
                    ->options(
                        Channel::query()
                            ->where('type', 'weekly')
                            ->orderBy('title')
                            ->pluck('title', 'id')
                    )
                    ->required(),

                FileUpload::make('csv')
                    ->label('CSV file')
                    ->helperText('Header wajib: title,publish_at,content (publish_at format: YYYY-MM-DD HH:MM atau ISO).')
                    ->acceptedFileTypes([
                        'text/csv',
                        'text/plain',
                        'application/vnd.ms-excel',
                    ])
                    ->disk('local')
                    ->directory('imports')
                    ->preserveFilenames()
                    ->required(),

                Toggle::make('dry_run')
                    ->label('Dry run (preview only, no database writes)')
                    ->default(true),
            ])
            ->statePath('data');
    }

    public function submit(): void
    {
        $state = $this->form->getState();

        $channelId = (int) $state['channel_id'];
        $relativePath = $state['csv'];
        $dryRun = (bool) ($state['dry_run'] ?? true);

        $fullPath = storage_path('app/' . $relativePath);

        $reader = Reader::createFromPath($fullPath);
        $reader->setHeaderOffset(0);

        $records = $reader->getRecords();

        $created = 0;
        $errors = [];

        // Track duplicate dates inside the CSV itself (same channel)
        $seenDates = [];

        foreach ($records as $index => $row) {
            $rowNumber = $index + 2; // header = 1

            $title = trim((string) ($row['title'] ?? ''));
            $publishAtRaw = trim((string) ($row['publish_at'] ?? ''));
            $content = (string) ($row['content'] ?? '');

            if ($title === '' || $publishAtRaw === '') {
                $errors[] = "Row {$rowNumber}: title/publish_at wajib.";
                continue;
            }

            try {
                $publishAt = Carbon::parse($publishAtRaw);
            } catch (\Throwable $e) {
                $errors[] = "Row {$rowNumber}: publish_at invalid ({$publishAtRaw}).";
                continue;
            }

            $publishDateKey = $publishAt->toDateString();

            // 1) Duplicate inside the CSV
            if (isset($seenDates[$publishDateKey])) {
                $prevRow = $seenDates[$publishDateKey];
                $errors[] = "Row {$rowNumber}: tanggal {$publishDateKey} dobel di CSV (sudah dipakai di row {$prevRow}).";
                continue;
            }
            $seenDates[$publishDateKey] = $rowNumber;

            // 2) Duplicate with existing DB data (same channel, same date)
            $exists = Post::query()
                ->where('channel_id', $channelId)
                ->whereDate('publish_at', $publishAt)
                ->exists();

            if ($exists) {
                $errors[] = "Row {$rowNumber}: sudah ada post di channel ini pada tanggal {$publishDateKey}.";
                continue;
            }

            if (! $dryRun) {
                Post::query()->create([
                    'channel_id' => $channelId,
                    'title' => $title,
                    'content' => $content,
                    'publish_at' => $publishAt,
                    'status' => 'scheduled',
                    'published_at' => null,
                ]);
            }

            $created++;
        }

        if ($errors) {
            Notification::make()
                ->title('Import selesai dengan error')
                ->body("Created/parsed: {$created}. Errors: " . implode(' | ', array_slice($errors, 0, 5)) . (count($errors) > 5 ? ' ...' : ''))
                ->danger()
                ->send();

            return;
        }

        Notification::make()
            ->title($dryRun ? 'Dry run selesai' : 'Import sukses')
            ->body($dryRun
                ? "Parsed {$created} row(s). Tidak ada data yang disimpan (dry run)."
                : "Created {$created} scheduled post(s).")
            ->success()
            ->send();
    }

}
