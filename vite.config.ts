import type { Plugin } from 'vite'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

/**
 * Dev-only: fetch NanoBanana result images through the dev server so the browser
 * avoids CORS blocks and bad relative URLs when turning results into data URLs.
 */
function nanobananaAssetProxy(): Plugin {
  return {
    name: 'nanobanana-asset-proxy',
    configureServer(server) {
      server.middlewares.use('/api/nb-asset', async (req, res, next) => {
        if (req.method !== 'GET') {
          next()
          return
        }
        try {
          const q = new URL(req.url ?? '', 'http://localhost').searchParams.get('src')
          if (!q) {
            res.statusCode = 400
            res.end('missing src')
            return
          }
          const target = decodeURIComponent(q)
          if (!/^https?:\/\//i.test(target)) {
            res.statusCode = 400
            res.end('invalid url')
            return
          }
          const upstream = await fetch(target, { headers: { Accept: 'image/*,*/*' } })
          if (!upstream.ok) {
            res.statusCode = upstream.status
            res.end()
            return
          }
          const ct = upstream.headers.get('content-type') ?? 'application/octet-stream'
          const buf = Buffer.from(await upstream.arrayBuffer())
          res.setHeader('Content-Type', ct)
          res.setHeader('Cache-Control', 'private, max-age=300')
          res.end(buf)
        } catch {
          res.statusCode = 502
          res.end()
        }
      })
    },
  }
}

export default defineConfig({
  plugins: [react(), nanobananaAssetProxy()],
  server: { port: 5173 },
})
