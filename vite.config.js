import { defineConfig } from 'vite';

export default defineConfig({
  // Base public path - utilise le nom du repo pour GitHub Pages
  // Change cette valeur si ton repo a un nom différent
  base: '/will-you-be-my-valentines/',
  
  // Build options
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    minify: 'terser',
    sourcemap: false
  },
  
  // Dev server
  server: {
    port: 3000,
    open: true
  }
});
