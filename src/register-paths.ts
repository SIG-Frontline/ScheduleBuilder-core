import { register } from 'tsconfig-paths';
import { resolve } from 'path';

const baseUrl = resolve(__dirname, '..');

register({
  baseUrl,
  paths: {
    'src/*': ['src/*'],
    'schemas/*': ['schemas/*'],
  },
});
