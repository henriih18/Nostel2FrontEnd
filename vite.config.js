/* import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
})
 */

import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    // Divide los chunks grandes
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules')) {
            return 'vendor'; // Separa las dependencias en un chunk separado
          }
        },
      },
    },
    // Reduce el tamaño de los chunks (opcional, ajusta según necesidad)
    chunkSizeWarningLimit: 600, // Aumenta el límite a 600 kB si es necesario
  },
  // Asegura compatibilidad con módulos ES
  esbuild: {
    supported: {
      'top-level-await': true, // Habilita top-level await si lo usas
    },
  },
  // Define la base URL para el despliegue (ajusta según el dominio de Vercel)
  base: '/', // O usa '/subruta' si despliegas en un subdirectorio
});