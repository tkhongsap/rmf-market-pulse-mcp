/**
 * Vite Configuration for Widget Development
 *
 * This configuration is used for:
 * - Building widget bundles
 * - Development server with HMR
 * - TypeScript and React support
 */

import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';

export default defineConfig({
  plugins: [
    react()
  ],

  // Build configuration
  build: {
    // Output directory for built assets
    outDir: 'assets',

    // Generate sourcemaps for debugging
    sourcemap: true,

    // Minification
    minify: 'esbuild',

    // Target modern browsers
    target: 'es2020',

    // Rollup options
    rollupOptions: {
      input: {
        // Define your widget entry points here
        'rmf-fund-detail': resolve(__dirname, 'src/rmf-fund-detail/index.html'),
        'rmf-fund-comparison': resolve(__dirname, 'src/rmf-fund-comparison/index.html'),
        'rmf-performance-chart': resolve(__dirname, 'src/rmf-performance-chart/index.html'),
      },
      output: {
        // Naming pattern for output files
        entryFileNames: '[name]-[hash].js',
        chunkFileNames: '[name]-[hash].js',
        assetFileNames: '[name]-[hash][extname]'
      }
    },

    // Chunk size warnings
    chunkSizeWarningLimit: 1000
  },

  // Development server
  server: {
    port: 3000,
    host: true,
    cors: true,
    open: false
  },

  // Preview server (for testing builds)
  preview: {
    port: 4444,
    host: true,
    cors: true
  },

  // Path resolution
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
      '@shared': resolve(__dirname, 'shared')
    }
  },

  // CSS configuration
  css: {
    postcss: {
      plugins: [
        require('tailwindcss'),
        require('autoprefixer')
      ]
    }
  },

  // Dependency optimization
  optimizeDeps: {
    include: ['react', 'react-dom']
  }
});
