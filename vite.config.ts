import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
  // Carrega variáveis de ambiente (incluindo as do sistema como API_KEY)
  const env = loadEnv(mode, (process as any).cwd(), '');
  
  return {
    plugins: [react()],
    define: {
      // Polyfill para process.env para que o SDK do Google funcione no navegador
      'process.env': {
        API_KEY: env.API_KEY
      }
    },
    server: {
      port: 3000,
      // Proxy apenas para ambiente de desenvolvimento local
      proxy: {
        '/api': {
          target: 'http://localhost:3001',
          changeOrigin: true,
          ws: true
        }
      }
    },
    build: {
      outDir: 'dist',
      sourcemap: false
    }
  };
});