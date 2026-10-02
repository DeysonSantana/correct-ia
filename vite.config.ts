import { defineConfig } from 'vite';

export default defineConfig({
  // Caminho relativo para funcionar perfeitamente em subdiretórios do GitHub Pages
  base: './',
  build: {
    outDir: 'dist',
    sourcemap: false,
    minify: 'esbuild',
    rollupOptions: {
      output: {
        manualChunks: undefined
      }
    }
  }
});
