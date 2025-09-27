import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  optimizeDeps: {
    exclude: ['lucide-react'],
  },
  server: {
    proxy: {
      '/api/chat': {
        target: 'https://integrate.api.nvidia.com/v1',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/chat/, '/chat/completions'),
        headers: {
          'Authorization': `Bearer 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`
        }
      }
    }
  }
});
