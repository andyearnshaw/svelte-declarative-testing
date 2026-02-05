import { defineConfig } from 'vitest/config';
import { svelteTesting } from '@testing-library/svelte/vite';
import { svelte } from '@sveltejs/vite-plugin-svelte';
import getPlugins from './src/plugins/vitest';

export default defineConfig({
  logLevel: 'warn',
  plugins: [svelte(), svelteTesting(), getPlugins()],
  test: {
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html'],
    },
    environment: 'happy-dom',
    expect: {
      requireAssertions: true,
    },
    globals: true,
    include: ['examples/**/*.{test,spec}.svelte', 'src/**/*.{test,spec}.ts'],
  },
});
