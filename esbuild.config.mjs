import esbuild from 'esbuild';
import process from 'process';

const prod = process.argv[2] === 'production';

esbuild.build({
    entryPoints: ['main.ts'],
    bundle: true,
    external: ['obsidian', 'electron', 'crypto', 'buffer'],
    format: 'cjs',
    platform: 'node',
    target: 'es2020',
    logLevel: 'info',
    sourcemap: prod ? false : 'inline',
    treeShaking: true,
    outfile: 'main.js',
    minify: prod,
}).catch(() => process.exit(1));