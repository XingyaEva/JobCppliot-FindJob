import build from '@hono/vite-build/cloudflare-pages'
import devServer from '@hono/vite-dev-server'
import adapter from '@hono/vite-dev-server/cloudflare'
import { defineConfig } from 'vite'

// Server-side Hono worker build (API only)
export default defineConfig({
  plugins: [
    build({
      entry: 'src/index.tsx',
      output: 'dist/_worker.js',
    }),
    devServer({
      adapter,
      entry: 'src/index.tsx'
    })
  ]
})
