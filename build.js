/**
 * Chrome拡張機能ビルドスクリプト
 */
import * as esbuild from 'esbuild';

const buildOptions = {
  bundle: true,
  minify: true,
  sourcemap: false,
  target: 'es2020',
  format: 'esm',
  logLevel: 'info',
  platform: 'browser'
};

async function build() {
  try {
    console.log('📦 Building Chrome Extension...\n');

    // Background Service Worker
    console.log('Building background.js...');
    await esbuild.build({
      ...buildOptions,
      entryPoints: ['background.js'],
      outfile: 'dist/background.js',
    });

    // Popup Script
    console.log('Building popup.js...');
    await esbuild.build({
      ...buildOptions,
      entryPoints: ['popup.js'],
      outfile: 'dist/popup.js',
    });

    // Content Script
    console.log('Building content.js...');
    await esbuild.build({
      ...buildOptions,
      entryPoints: ['content.js'],
      outfile: 'dist/content.js',
    });

    // Offscreen Document
    console.log('Building offscreen.js...');
    await esbuild.build({
      ...buildOptions,
      entryPoints: ['offscreen.js'],
      outfile: 'dist/offscreen.js',
    });

    // Auth Page
    console.log('Building auth.js...');
    await esbuild.build({
      ...buildOptions,
      entryPoints: ['auth.js'],
      outfile: 'dist/auth.js',
    });

    console.log('\n✅ Build completed successfully!');
  } catch (error) {
    console.error('❌ Build failed:', error);
    process.exit(1);
  }
}

build();
