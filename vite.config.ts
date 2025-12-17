
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
  // Carrega variáveis de ambiente baseadas no modo (development/production)
  const env = loadEnv(mode, (process as any).cwd(), '');
  
  return {
    plugins: [react()],
    // Define variáveis globais para serem substituídas durante o build
    define: {
      'process.env.API_KEY': JSON.stringify(env.API_KEY),
      'process.env.SUPABASE_URL': JSON.stringify(env.SUPABASE_URL),
      'process.env.SUPABASE_KEY': JSON.stringify(env.SUPABASE_KEY)
    },
    server: {
      port: 3000,
    },
    build: {
      outDir: 'dist',
      assetsDir: 'assets',
      sourcemap: false,
      chunkSizeWarningLimit: 1600, // Ajuste para 1600kb para suprimir avisos
      // Otimizações para reduzir tamanho do bundle
      rollupOptions: {
        output: {
          manualChunks: {
            vendor: ['react', 'react-dom', 'leaflet', 'recharts', 'lucide-react', '@supabase/supabase-js'],
          },
        },
      },
    }
  };
});
