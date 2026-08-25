import { defineConfig } from 'vite';
import stylex from '@stylexjs/unplugin';

export default defineConfig({
  plugins: [
    stylex.vite({
      useCSSLayers: true,
    }),
  ],
  server: {
    host: '0.0.0.0',
    port: 5173,
  },
});
