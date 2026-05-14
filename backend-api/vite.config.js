import { defineConfig } from 'vite';
import laravel from 'laravel-vite-plugin';
import react from '@vitejs/plugin-react';
import { fileURLToPath } from 'node:url';
import { visualizer } from "rollup-plugin-visualizer";

export default defineConfig({
    resolve: {
        alias: {
            '@': fileURLToPath(new URL('./resources/js', import.meta.url)),
        },
    },
    plugins: [
        laravel({
            input: ['resources/js/app.tsx', 'resources/css/app.css'],
            refresh: true,
        }),
        react(),
     visualizer({
      filename: "dist/stats.html",
      open: false,
      gzipSize: true,
      brotliSize: true,
     })
    ],
});
