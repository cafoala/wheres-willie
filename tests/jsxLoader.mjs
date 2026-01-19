import { readFile } from 'node:fs/promises';
import { transform } from 'esbuild';

export async function resolve(specifier, context, defaultResolve) {
  return defaultResolve(specifier, context, defaultResolve);
}

export async function load(url, context, defaultLoad) {
  if (url.endsWith('.jsx')) {
    const source = await readFile(new URL(url), 'utf8');
    const result = await transform(source, {
      loader: 'jsx',
      jsx: 'automatic',
      sourcemap: false,
    });
    return {
      format: 'module',
      source: result.code,
      shortCircuit: true,
    };
  }

  return defaultLoad(url, context, defaultLoad);
}
