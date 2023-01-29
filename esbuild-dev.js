import { context } from 'esbuild';
import { typecheckPlugin } from '@jgoz/esbuild-plugin-typecheck';

import fs from 'fs';
const json = JSON.parse(fs.readFileSync('package.json', 'utf8'));
let deps = Object.keys(json.dependencies);

context({
  platform: 'node',
  logLevel: 'info',
  entryPoints: ['src/index.ts'],
  bundle: true,
  minify: false,
  format: 'esm',
  target: 'node16',
  outdir: 'dist',
  external: deps,
  plugins: [typecheckPlugin({
    watch: true
  })]
}).then(ctx => ctx.watch().catch(() => process.exit(1)));
