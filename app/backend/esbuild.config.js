import * as esbuild from 'esbuild';

await esbuild.build({
  entryPoints: ['./src/server.ts'],
  bundle: true,
  platform: 'node',
  target: 'node18',
  outdir: 'dist',
  format: 'esm',
  banner: {
    js: "import { createRequire } from 'module';const require = createRequire(import.meta.url);",
  },
  external: [
    // Add any packages that should not be bundled
    'pg-native',
    'puppeteer',
  ],
});

console.log('Build complete');
