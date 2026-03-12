<?php

namespace App\Http\Controllers\Admin;

use Illuminate\Http\Response;

class BulkSchedulerTemplateController
{
    public function __invoke(): Response
    {
        $content = implode("\n", [
            'title,publish_at,content',
            'Judul Post Contoh,2026-03-01 00:01,"<p>Isi konten (boleh HTML)</p>"',
        ]) . "\n";

        return response($content, 200, [
            'Content-Type' => 'text/csv; charset=UTF-8',
            'Content-Disposition' => 'attachment; filename="bulk-scheduler-template.csv"',
        ]);
    }
}
