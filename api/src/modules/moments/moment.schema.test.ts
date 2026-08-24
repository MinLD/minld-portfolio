import { describe, expect, test } from 'vitest'
import { createMomentSchema, updateMomentSchema } from './moment.schema.js'

describe('moment schemas', () => {
  test('defaults create images but does not default update images', () => {
    expect(createMomentSchema.parse({ body: { content: 'hello' } }).body.images).toEqual([])
    expect(updateMomentSchema.parse({ params: { id: '550e8400-e29b-41d4-a716-446655440000' }, body: { content: 'hello' } }).body.images).toBeUndefined()
  })
})
