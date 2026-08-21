import { createRequire } from 'node:module'
import express, { Router } from 'express'
import { buildOpenApiDocument } from './openapi.js'

export const docsRouter = Router()
const require = createRequire(import.meta.url)
const swaggerUiDist = require('swagger-ui-dist') as { getAbsoluteFSPath: () => string }
const csp = "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self' data:; connect-src 'self'"
const initScript = `    window.ui = SwaggerUIBundle({
  url: '/api/v1/docs/openapi.json',
  dom_id: '#swagger-ui',
  deepLinking: true,
  filter: true,
  displayRequestDuration: true,
  persistAuthorization: true,
  docExpansion: 'none',
  defaultModelsExpandDepth: 1,
  requestInterceptor: (request) => {
    request.credentials = 'include'
    return request
  },
})`

docsRouter.use('/docs/assets', Router().use((_req, res, next) => {
  res.setHeader('Cache-Control', 'public, max-age=86400')
  next()
}, express.static(swaggerUiDist.getAbsoluteFSPath())))

docsRouter.use('/docs', (_req, res, next) => {
  res.setHeader('Content-Security-Policy', csp)
  next()
})

docsRouter.get('/docs/openapi.json', (_req, res) => {
  res.json(buildOpenApiDocument())
})

docsRouter.get('/docs', (_req, res) => {
  res.type('html').send(`<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>MinLD Portfolio API Docs</title>
  <link rel="stylesheet" href="/api/v1/docs/assets/swagger-ui.css" />
</head>
<body>
  <div id="swagger-ui"></div>
  <script src="/api/v1/docs/assets/swagger-ui-bundle.js"></script>
  <script>
${initScript}
  </script>
</body>
</html>`)
})
