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
  logLevel: 'info'
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
      platform: 'browser'
    });

    // Popup Script
    console.log('Building popup.js...');
    await esbuild.build({
      ...buildOptions,
      entryPoints: ['popup.js'],
      outfile: 'dist/popup.js',
      platform: 'browser'
    });

    // Content Script
    console.log('Building content.js...');
    await esbuild.build({
      ...buildOptions,
      entryPoints: ['content.js'],
      outfile: 'dist/content.js',
      platform: 'browser'
    });

    // Offscreen Document
    console.log('Building offscreen.js...');
    await esbuild.build({
      ...buildOptions,
      entryPoints: ['offscreen.js'],
      outfile: 'dist/offscreen.js',
      platform: 'browser'
    });

    console.log('\n✅ Build completed successfully!');
  } catch (error) {
    console.error('❌ Build failed:', error);
    process.exit(1);
  }
}

build();
