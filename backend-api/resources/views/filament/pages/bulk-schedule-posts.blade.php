<x-filament-panels::page>
    <form wire:submit="submit" class="space-y-6">
        {{ $this->form }}

        <div class="flex flex-wrap items-center gap-3">
            <x-filament::button type="submit">
                Run import
            </x-filament::button>

            <x-filament::button
                type="button"
                color="gray"
                outlined
                tag="a"
                href="{{ url('/admintalk/bulk-schedule-posts/template.csv') }}"
            >
                Download CSV template
            </x-filament::button>
        </div>
    </form>
</x-filament-panels::page>
