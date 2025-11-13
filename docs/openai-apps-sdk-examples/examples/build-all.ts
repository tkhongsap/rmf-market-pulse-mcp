/**
 * Build Script for Widget Bundles
 *
 * This script builds all widgets and generates versioned asset files.
 * Based on openai/openai-apps-sdk-examples build process.
 *
 * Usage:
 *   tsx build-all.ts
 */

import { build } from 'vite';
import { resolve } from 'path';
import { writeFileSync, mkdirSync, existsSync } from 'fs';

// ============================================================================
// Configuration
// ============================================================================

interface WidgetConfig {
  name: string;
  entry: string;
  template: string;
}

const widgets: WidgetConfig[] = [
  {
    name: 'rmf-fund-detail',
    entry: 'src/rmf-fund-detail/main.tsx',
    template: 'src/rmf-fund-detail/index.html'
  },
  {
    name: 'rmf-fund-comparison',
    entry: 'src/rmf-fund-comparison/main.tsx',
    template: 'src/rmf-fund-comparison/index.html'
  },
  {
    name: 'rmf-performance-chart',
    entry: 'src/rmf-performance-chart/main.tsx',
    template: 'src/rmf-performance-chart/index.html'
  }
];

const OUTPUT_DIR = 'assets';
const MANIFEST_FILE = 'widget-manifest.json';

// ============================================================================
// Helper Functions
// ============================================================================

function ensureDir(dir: string) {
  if (!existsSync(dir)) {
    mkdirSync(dir, { recursive: true });
  }
}

function logStep(step: string, widget?: string) {
  const prefix = widget ? `[${widget}]` : '';
  console.log(`${prefix} ${step}`);
}

function logSuccess(message: string) {
  console.log(`✅ ${message}`);
}

function logError(message: string, error?: Error) {
  console.error(`❌ ${message}`);
  if (error) {
    console.error(error);
  }
}

// ============================================================================
// Build Function
// ============================================================================

async function buildWidget(widget: WidgetConfig): Promise<void> {
  logStep('Building...', widget.name);

  try {
    const result = await build({
      configFile: false,
      root: process.cwd(),

      build: {
        outDir: OUTPUT_DIR,
        emptyOutDir: false,

        rollupOptions: {
          input: {
            [widget.name]: resolve(process.cwd(), widget.template)
          },
          output: {
            entryFileNames: `${widget.name}-[hash].js`,
            chunkFileNames: `${widget.name}-chunk-[hash].js`,
            assetFileNames: `${widget.name}-[hash][extname]`
          }
        },

        sourcemap: true,
        minify: 'esbuild',
        target: 'es2020'
      },

      plugins: [
        // Add any necessary plugins
      ]
    });

    logSuccess(`Built ${widget.name}`);
  } catch (error) {
    logError(`Failed to build ${widget.name}`, error as Error);
    throw error;
  }
}

// ============================================================================
// Manifest Generation
// ============================================================================

interface WidgetManifest {
  version: string;
  buildTime: string;
  widgets: {
    [key: string]: {
      name: string;
      entryPoint: string;
      template: string;
      assets: string[];
    };
  };
}

function generateManifest(): WidgetManifest {
  const manifest: WidgetManifest = {
    version: '1.0.0',
    buildTime: new Date().toISOString(),
    widgets: {}
  };

  widgets.forEach(widget => {
    manifest.widgets[widget.name] = {
      name: widget.name,
      entryPoint: widget.entry,
      template: widget.template,
      assets: []
    };
  });

  return manifest;
}

function saveManifest(manifest: WidgetManifest) {
  const manifestPath = resolve(OUTPUT_DIR, MANIFEST_FILE);
  writeFileSync(
    manifestPath,
    JSON.stringify(manifest, null, 2),
    'utf-8'
  );
  logSuccess(`Generated manifest: ${MANIFEST_FILE}`);
}

// ============================================================================
// Main Build Process
// ============================================================================

async function main() {
  console.log('🚀 Building OpenAI Apps SDK Widgets\n');
  console.log(`Output directory: ${OUTPUT_DIR}`);
  console.log(`Widgets to build: ${widgets.length}\n`);

  // Ensure output directory exists
  ensureDir(OUTPUT_DIR);

  // Build each widget
  for (const widget of widgets) {
    try {
      await buildWidget(widget);
    } catch (error) {
      logError(`Build failed for ${widget.name}`, error as Error);
      process.exit(1);
    }
  }

  // Generate manifest
  const manifest = generateManifest();
  saveManifest(manifest);

  // Summary
  console.log('\n✨ Build Complete!\n');
  console.log('Next steps:');
  console.log('1. Start asset server: npm run serve');
  console.log('2. Start MCP server: npm run server:node or npm run server:python');
  console.log('3. Expose with ngrok: ngrok http 8000');
  console.log('4. Connect to ChatGPT\n');
}

// ============================================================================
// Execute
// ============================================================================

main().catch(error => {
  logError('Build process failed', error);
  process.exit(1);
});
