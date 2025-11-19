import { build } from 'bun';
import { statSync, unlinkSync } from 'fs';

const result = await build({
    entrypoints: ['packages/core/src/index.ts'],
    outdir: 'dist',
    minify: true,
    target: 'browser',
    splitting: false,
    sourcemap: 'none',
});

if (!result.success) {
    console.error('Build failed');
    process.exit(1);
}

const stats = statSync('dist/index.js');
const sizeKB = stats.size / 1024;

console.log(`Bundle size: ${sizeKB.toFixed(2)}KB`);

if (sizeKB > 10) {
  console.error('ERROR: Bundle size exceeded 10KB limit!');
  process.exit(1);
} else {
  console.log('Bundle size within limit.');
}

// Cleanup
// unlinkSync('dist/index.js');
// unlinkSync('dist');
