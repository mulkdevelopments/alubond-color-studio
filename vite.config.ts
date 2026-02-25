import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import type { Connect } from 'vite'
import { runEnhance } from './vite-enhance-middleware'

function readBody(req: Connect.IncomingMessage): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const chunks: Buffer[] = []
    req.on('data', (chunk) => chunks.push(Buffer.from(chunk)))
    req.on('end', () => resolve(Buffer.concat(chunks)))
    req.on('error', reject)
  })
}

function enhanceApiMiddleware(): Connect.NextHandleFunction {
  return async (req, res, next) => {
    if (req.method !== 'POST' || req.url !== '/api/enhance') return next()

    const raw = await readBody(req)
    const body = JSON.parse(raw.toString('utf8')) as {
      imageDataUrl?: string
      prompt?: string
    }

    const key = process.env.FAL_KEY || process.env.VITE_FAL_KEY
    if (!key?.trim()) {
      res.statusCode = 500
      res.setHeader('Content-Type', 'application/json')
      res.end(
        JSON.stringify({
          error: 'FAL_KEY (or VITE_FAL_KEY for dev) is not set. Add it to .env',
        })
      )
      return
    }

    if (!body?.imageDataUrl || typeof body.imageDataUrl !== 'string') {
      res.statusCode = 400
      res.setHeader('Content-Type', 'application/json')
      res.end(JSON.stringify({ error: 'Missing or invalid imageDataUrl in request body.' }))
      return
    }

    try {
      const dataUrl = await runEnhance(body.imageDataUrl, key, body.prompt)
      res.statusCode = 200
      res.setHeader('Content-Type', 'application/json')
      res.end(JSON.stringify({ dataUrl }))
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Enhancement failed'
      console.error('Fal enhance error:', err)
      res.statusCode = 502
      res.setHeader('Content-Type', 'application/json')
      res.end(JSON.stringify({ error: message }))
    }
  }
}

export default defineConfig({
  plugins: [
    react(),
    {
      name: 'enhance-api',
      configureServer(server) {
        server.middlewares.use(enhanceApiMiddleware())
      },
    },
  ],
  server: { port: 5173 },
})
