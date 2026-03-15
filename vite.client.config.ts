import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import path from 'path'

// Client-side React SPA build
// 注意：根目录 tsconfig.json 的 jsxImportSource 是 hono/jsx（给 worker 用的），
// 这里必须通过 esbuild.jsxImportSource 显式覆盖为 react，
// 并排除 hono 进入客户端 bundle。
export default defineConfig({
  root: path.resolve(__dirname, 'client'),
  plugins: [
    react(),
    tailwindcss(),
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'client/src'),
    },
  },
  esbuild: {
    jsxImportSource: 'react',
  },
  optimizeDeps: {
    exclude: ['hono', 'hono/jsx', 'hono/jsx/jsx-dev-runtime', 'hono/jsx/jsx-runtime'],
  },
  build: {
    outDir: path.resolve(__dirname, 'dist'),
    emptyOutDir: false, // Don't wipe worker build
    rollupOptions: {
      external: ['hono', /^hono\//],
    },
  },
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:8787',
        changeOrigin: true,
      },
    },
  },
})
