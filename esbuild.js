import { build } from 'esbuild';
import fs from 'fs';
const json = JSON.parse(fs.readFileSync('package.json', 'utf8'));
let deps = Object.keys(json.dependencies);

const entryPoint = 'src/index.ts';

build({
  platform: 'node',
  logLevel: 'info',
  entryPoints: [entryPoint],
  bundle: true,
  minify: true,
  format: 'esm',
  target: 'node16',
  outfile: 'dist/index.js',
  external: deps,
})
  .catch(() => process.exit(1));
