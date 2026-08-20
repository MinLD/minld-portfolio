import { readFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { Router } from 'express'
import swaggerUi from 'swagger-ui-express'

const openApiDir = resolve(dirname(fileURLToPath(import.meta.url)), '../../../openapi')
const fullSpec = JSON.parse(readFileSync(resolve(openApiDir, 'full.openapi.json'), 'utf8')) as Record<string, unknown>
const projectsSpec = JSON.parse(readFileSync(resolve(openApiDir, 'projects.openapi.json'), 'utf8')) as Record<string, unknown>
const momentsSpec = JSON.parse(readFileSync(resolve(openApiDir, 'moments.openapi.json'), 'utf8')) as Record<string, unknown>

export const docsRouter = Router()

docsRouter.use('/docs', (_req, res, next) => {
  res.setHeader('Content-Security-Policy', "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self' data:; connect-src 'self'")
  next()
})

docsRouter.get('/docs/projects.json', (_req, res) => res.json(projectsSpec))
docsRouter.get('/docs/moments.json', (_req, res) => res.json(momentsSpec))
docsRouter.get('/docs/full.json', (_req, res) => res.json(fullSpec))
docsRouter.use(
  '/docs',
  swaggerUi.serve,
  swaggerUi.setup(undefined, {
    explorer: true,
    swaggerOptions: {
      urls: [
        { url: '/api/v1/docs/full.json', name: 'Full API' },
        { url: '/api/v1/docs/projects.json', name: 'Projects' },
        { url: '/api/v1/docs/moments.json', name: 'Moments' },
      ],
      urlsPrimaryName: 'Full API',
      persistAuthorization: true,
    },
    customSiteTitle: 'MinLD API Docs',
  }),
)
