import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';
import path from 'node:path';
import { visualizer } from 'rollup-plugin-visualizer';

const isAnalyze = process.env.ANALYZE === 'true';

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      strategies: 'injectManifest',
      srcDir: 'src',
      filename: 'sw.js',
      registerType: 'autoUpdate',
      includeAssets: ['favicon.svg', 'icons.svg'],
      injectManifest: {
        globPatterns: ['**/*.{js,css,svg,png,woff2}'],
        maximumFileSizeToCacheInBytes: 4 * 1024 * 1024,
      },
      devOptions: {
        enabled: true,
        type: 'module',
      },
      manifest: {
        name: 'SIPNAM - Sistema Integrado de Partes de Novedades y Asistencias Móvil',
        short_name: 'SIPNAM',
        description:
          'Gestión de asistencias, novedades e incidentes edilicios para las escuelas de Tinogasta, Catamarca',
        theme_color: '#1e40af',
        background_color: '#f8fafc',
        display: 'standalone',
        orientation: 'portrait',
        scope: '/',
        start_url: '/',
        icons: [
          {
            src: '/pwa-192x192.png',
            sizes: '192x192',
            type: 'image/png',
          },
          {
            src: '/pwa-512x512.png',
            sizes: '512x512',
            type: 'image/png',
          },
          {
            src: '/pwa-512x512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any maskable',
          },
        ],
        shortcuts: [
          {
            name: 'Cargar asistencia',
            short_name: 'Asistencia',
            description: 'Registrar la asistencia del día',
            url: '/asistencia?source=shortcut',
            icons: [{ src: '/pwa-192x192.png', sizes: '192x192' }],
          },
          {
            name: 'Ver historial',
            short_name: 'Historial',
            description: 'Consultar registros cargados',
            url: '/historial?source=shortcut',
            icons: [{ src: '/pwa-192x192.png', sizes: '192x192' }],
          },
          {
            name: 'Centro de ayuda',
            short_name: 'Ayuda',
            description: 'Guías, preguntas frecuentes y glosario',
            url: '/ayuda?source=shortcut',
            icons: [{ src: '/pwa-192x192.png', sizes: '192x192' }],
          },
        ],
      },
    }),
    ...(isAnalyze
      ? [
          visualizer({
            open: false,
            filename: 'bundle-report.html',
            gzipSize: true,
            template: 'raw-data',
          }),
        ]
      : []),
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './src/test/setup.ts',
  },
});
