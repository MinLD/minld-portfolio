import { describe, expect, it } from 'vitest'
import { buildOpenApiDocument, runtimeEndpoints } from './openapi.js'

describe('OpenAPI coverage', () => {
  it('documents every runtime endpoint and has no stale endpoint', () => {
    const spec = buildOpenApiDocument()
    const documented = Object.entries(spec.paths).flatMap(([path, item]) => Object.keys(item).map((method) => `${method.toUpperCase()} ${path}`)).sort()
    const runtime = [...runtimeEndpoints].sort()

    expect(documented).toEqual(runtime)
  })

  it('uses unique operation IDs', () => {
    const spec = buildOpenApiDocument()
    const operationIds = Object.values(spec.paths).flatMap((item) => Object.values(item).map((operation) => operation.operationId))

    expect(new Set(operationIds).size).toBe(operationIds.length)
  })

  it('does not contain broken component schema refs', () => {
    const spec = buildOpenApiDocument()
    const refs = JSON.stringify(spec).match(/#\/components\/schemas\/[A-Za-z0-9_]+/g) ?? []
    const schemaNames = new Set(Object.keys(spec.components.schemas))

    for (const ref of refs) expect(schemaNames.has(ref.split('/').at(-1) ?? '')).toBe(true)
  })
})
