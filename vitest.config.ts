import { defineConfig } from 'vitest/config'
import vue from '@vitejs/plugin-vue'
import { fileURLToPath, URL } from 'node:url'

export default defineConfig({
  plugins: [vue()],
  test: {
    environment: 'jsdom',
    globals: true,
    include: ['src/**/*.{test,spec}.{js,ts}'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: [
        'src/main.ts',
        'src/App.vue',
        'src/router/**',
        'src/types/**',
        'e2e/**',
        'src/components/Editor/CanvasEditor.vue',
        'src/components/Watermark/**',
        'src/components/Frame/**',
        'src/components/Collage/**',
        'src/views/**',
        'src/utils/fabric.ts',
        'dist/**',
        'node_modules/**',
        'coverage/**',
        'test-results/**',
        '**/*.config.ts',
        '**/*.d.ts',
        'eslint.config.js',
      ],
      thresholds: {
        lines: 80,
        functions: 90,
        branches: 80,
        statements: 80,
      },
    },
  },
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
})
