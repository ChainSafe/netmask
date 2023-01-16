import { esbuildPlugin } from '@web/dev-server-esbuild';

export default {
  files: ['src/**/*.ts', 'test/**/*.spec.ts'],
  plugins: [esbuildPlugin({ ts: true })],
};