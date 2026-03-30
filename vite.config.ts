import type { IncomingMessage, ServerResponse } from 'node:http'
import type { Plugin } from 'vite'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

const NB_UPSTREAM_API = 'https://api.nanobananaapi.ai/api/v1/nanobanana'

function readRequestBody(req: IncomingMessage): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const chunks: Buffer[] = []
    req.on('data', (c: Buffer) => chunks.push(Buffer.from(c)))
    req.on('end', () => resolve(Buffer.concat(chunks)))
    req.on('error', reject)
  })
}

/**
 * Dev-only: forward NanoBanana REST calls same-origin so large JSON+data-URL bodies are less
 * likely to hit net::ERR_CONNECTION_CLOSED than a direct browser → api.nanobananaapi.ai POST.
 * Disable with VITE_NANOBANANA_DIRECT=true in .env.local if you need to debug direct calls.
 */
function nanobananaApiProxy(): Plugin {
  return {
    name: 'nanobanana-api-proxy',
    configureServer(server) {
      const prefix = '/api/nb-proxy'
      server.middlewares.use(async (req, res, next) => {
        const url = req.url ?? ''
        if (!url.startsWith(prefix)) {
          next()
          return
        }
        const rest = url.slice(prefix.length)
        const upstream = `${NB_UPSTREAM_API}${rest}`
        const method = req.method ?? 'GET'
        const headers: Record<string, string> = {}
        const auth = req.headers.authorization
        if (auth) headers.Authorization = Array.isArray(auth) ? auth[0] : auth
        const ct = req.headers['content-type']
        if (ct) headers['Content-Type'] = Array.isArray(ct) ? ct[0] : ct

        const out = res as ServerResponse
        try {
          let body: Buffer | undefined
          if (method !== 'GET' && method !== 'HEAD') {
            body = await readRequestBody(req)
          }
          const upstreamRes = await fetch(upstream, {
            method,
            headers,
            body: body?.length ? new Uint8Array(body) : undefined,
          })
          out.statusCode = upstreamRes.status
          const skip = new Set(['content-encoding', 'transfer-encoding'])
          upstreamRes.headers.forEach((v, k) => {
            if (!skip.has(k.toLowerCase())) out.setHeader(k, v)
          })
          out.end(Buffer.from(await upstreamRes.arrayBuffer()))
        } catch (e) {
          console.error('[nanobanana-api-proxy] upstream failed', upstream, e)
          out.statusCode = 502
          out.setHeader('Content-Type', 'application/json; charset=utf-8')
          out.end(
            JSON.stringify({
              code: 502,
              msg: 'Dev proxy could not reach NanoBanana API (network or TLS).',
            })
          )
        }
      })
    },
  }
}

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
  plugins: [react(), nanobananaApiProxy(), nanobananaAssetProxy()],
  server: { port: 5173 },
})
