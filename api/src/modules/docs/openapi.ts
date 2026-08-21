import { env } from '../../config/env.js'

type Schema = Record<string, unknown>
type Operation = Record<string, unknown>
type PathItem = Record<string, Operation>

const uuid = '550e8400-e29b-41d4-a716-446655440000'
const slugPattern = '^[a-z0-9]+(?:-[a-z0-9]+)*$'
const technologyTypes = ['LANGUAGE', 'FRAMEWORK', 'LIBRARY', 'DATABASE', 'TOOL', 'OTHER']
const projectStatuses = ['DRAFT', 'PUBLISHED', 'ARCHIVED']
const commentStatuses = ['VISIBLE', 'HIDDEN']
const userRoles = ['USER', 'ADMIN']
const userStatuses = ['ACTIVE', 'BANNED']

const schema = {
  string: (extra: Schema = {}) => ({ type: 'string', ...extra }),
  object: (properties: Schema, required = Object.keys(properties), extra: Schema = {}) => ({ type: 'object', properties, required, ...extra }),
  array: (items: Schema) => ({ type: 'array', items }),
  nullable: (value: Schema) => ({ ...value, nullable: true }),
  ref: (name: string) => ({ $ref: `#/components/schemas/${name}` }),
}

const ok = <T>(data: T, meta?: Schema) => schema.object({ success: { type: 'boolean', enum: [true] }, data: data as Schema, ...(meta ? { meta } : {}) }, meta ? ['success', 'data', 'meta'] : ['success', 'data'])
const list = (name: string, item: string) => ok(schema.object({ [name]: schema.array(schema.ref(item)) }, [name]))
const paginated = (name: string, item: string) => ok(schema.object({ [name]: schema.array(schema.ref(item)) }, [name]), schema.ref('PaginationMeta'))
const err = (code: string, message: string) => ({ success: false, error: { code, message, details: [] }, requestId: 'req_example_123' })

const jsonBody = (name: string, example?: unknown) => ({
  required: true,
  content: { 'application/json': { schema: schema.ref(name), ...(example ? { example } : {}) } },
})

const multipartBody = (properties: Schema, required: string[], example?: unknown) => ({
  required: true,
  content: { 'multipart/form-data': { schema: schema.object(properties, required), ...(example ? { example } : {}) } },
})

const response = (description: string, body?: Schema, example?: unknown) => ({
  description,
  ...(body ? { content: { 'application/json': { schema: body, ...(example ? { example } : {}) } } } : {}),
})

const errors = (codes: number[]) => Object.fromEntries(codes.map((code) => [code, response(errorDescription(code), schema.ref('ApiError'), err(errorCode(code), errorMessage(code)))]))

function errorDescription(code: number) {
  return ({ 400: 'Validation or business rule error', 401: 'Missing or invalid authentication cookie', 403: 'Forbidden by role, active-user, ownership, or trusted-origin guard', 404: 'Resource not found', 409: 'Unique constraint conflict', 413: 'Uploaded file is too large', 429: 'Rate limit exceeded', 500: 'Unexpected server error' } as Record<number, string>)[code] ?? 'Error'
}

function errorCode(code: number) {
  return ({ 400: 'VALIDATION_ERROR', 401: 'UNAUTHORIZED', 403: 'FORBIDDEN', 404: 'NOT_FOUND', 409: 'CONFLICT', 413: 'MEDIA_TOO_LARGE', 429: 'RATE_LIMITED', 500: 'INTERNAL_SERVER_ERROR' } as Record<number, string>)[code] ?? 'ERROR'
}

function errorMessage(code: number) {
  return ({ 400: 'Validation failed', 401: 'Unauthorized', 403: 'Forbidden', 404: 'Resource not found', 409: 'Resource already exists', 413: 'Uploaded file is too large', 429: 'Too many requests', 500: 'Internal server error' } as Record<number, string>)[code] ?? 'Error'
}

const param = {
  id: (description: string) => ({ name: 'id', in: 'path', required: true, description, schema: schema.string({ format: 'uuid' }), example: uuid }),
  sessionId: () => ({ name: 'sessionId', in: 'path', required: true, description: 'Auth session UUID.', schema: schema.string({ format: 'uuid' }), example: uuid }),
  slug: () => ({ name: 'slug', in: 'path', required: true, description: 'Lowercase URL slug.', schema: schema.string({ pattern: slugPattern }), example: 'minld-portfolio' }),
}

const q = (name: string, s: Schema, description: string, example?: unknown) => ({ name, in: 'query', required: false, description, schema: s, ...(example === undefined ? {} : { example }) })
const projectQueries = [q('search', schema.string({ minLength: 1 }), 'Search title, summary, or content.', 'portfolio'), q('tag', schema.string({ pattern: slugPattern }), 'Filter by project tag slug.', 'backend'), q('category', schema.string({ pattern: slugPattern }), 'Alias for tag slug.', 'backend'), q('technology', schema.string({ pattern: slugPattern }), 'Filter by technology slug.', 'typescript'), q('technologyType', schema.string({ enum: technologyTypes }), 'Filter by technology type.', 'FRAMEWORK'), q('featured', schema.string({ enum: ['true', 'false'] }), 'Filter featured projects. Runtime coerces string to boolean.', 'true'), q('year', { type: 'integer', minimum: 1900, maximum: 3000 }, 'Filter by project year.', 2026), q('page', { type: 'integer', minimum: 1, default: 1 }, 'Page number.', 1), q('limit', { type: 'integer', minimum: 1, maximum: 100, default: 20 }, 'Items per page.', 20)]
const momentAdminQueries = [q('search', schema.string({ minLength: 1 }), 'Search moment content.', 'release'), q('status', schema.string({ enum: projectStatuses }), 'Filter by moment status.', 'PUBLISHED'), q('page', { type: 'integer', minimum: 1, default: 1 }, 'Page number.', 1), q('limit', { type: 'integer', minimum: 1, maximum: 100, default: 20 }, 'Items per page.', 20)]

function op(method: string, path: string, tag: string, operationId: string, summary: string, description: string, opts: { auth?: 'user' | 'admin'; params?: unknown[]; query?: unknown[]; body?: unknown; responses: Record<string | number, unknown>; rateLimit?: string } & Record<string, unknown>): [string, string, Operation] {
  const desc = `${description}\n\nAccess: ${opts.auth === 'admin' ? 'Authenticated active ADMIN.' : opts.auth === 'user' ? 'Authenticated active user unless noted.' : 'Public.'} Unsafe methods also require a trusted Origin/Sec-Fetch-Site. ${opts.rateLimit ? `Rate limit: ${opts.rateLimit}.` : ''}`.trim()
  return [path, method, { tags: [tag], operationId, summary, description: desc, ...(opts.auth ? { security: [{ accessCookieAuth: [] }] } : {}), ...(opts.params || opts.query ? { parameters: [...(opts.params ?? []), ...(opts.query ?? [])] } : {}), ...(opts.body ? { requestBody: opts.body } : {}), responses: opts.responses }]
}

function add(paths: Record<string, PathItem>, entries: [string, string, Operation][]) {
  for (const [path, method, operation] of entries) paths[path] = { ...(paths[path] ?? {}), [method]: operation }
}

const userExample = { id: uuid, email: 'minld@example.com', displayName: 'MinLD', avatarUrl: null, role: 'USER', status: 'ACTIVE', emailVerified: true }
const projectExample = { id: uuid, title: 'MinLD Portfolio', slug: 'minld-portfolio', summary: 'Personal portfolio built with Vue and Express.', content: 'Project detail content...', thumbnailUrl: null, demoUrl: 'https://example.com', githubUrl: 'https://github.com/example/project', sourceUrl: null, status: 'PUBLISHED', featured: true, year: 2026, publishedAt: '2026-08-21T00:00:00.000Z', createdAt: '2026-08-20T00:00:00.000Z', updatedAt: '2026-08-21T00:00:00.000Z', tags: [], technologies: [] }
const momentExample = { id: uuid, content: 'Shipped a cleaner OpenAPI contract.', status: 'PUBLISHED', publishedAt: '2026-08-21T00:00:00.000Z', createdAt: '2026-08-20T00:00:00.000Z', updatedAt: '2026-08-21T00:00:00.000Z', images: [], tags: [] }

const components = {
  securitySchemes: {
    accessCookieAuth: { type: 'apiKey', in: 'cookie', name: env.ACCESS_TOKEN_COOKIE_NAME, description: 'HttpOnly access-token cookie set by POST /api/v1/auth/login or /api/v1/auth/refresh.' },
    refreshCookieAuth: { type: 'apiKey', in: 'cookie', name: env.REFRESH_TOKEN_COOKIE_NAME, description: 'HttpOnly refresh-token cookie scoped to /api/v1/auth.' },
  },
  schemas: {
    ApiError: schema.object({ success: { type: 'boolean', enum: [false] }, error: schema.object({ code: schema.string(), message: schema.string(), details: { nullable: true, oneOf: [schema.array({ type: 'object', additionalProperties: true }), { type: 'object', additionalProperties: true }] } }, ['code', 'message']), requestId: schema.string({ format: 'uuid' }) }, ['success', 'error', 'requestId']),
    PaginationMeta: schema.object({ page: { type: 'integer', minimum: 1, example: 1 }, limit: { type: 'integer', minimum: 1, maximum: 100, example: 20 }, total: { type: 'integer', minimum: 0, example: 42 }, totalPages: { type: 'integer', minimum: 0, example: 3 } }),
    Message: schema.object({ message: schema.string() }),
    Health: schema.object({ status: schema.string({ enum: ['ok'] }) }),
    Ready: schema.object({ status: schema.string({ enum: ['ok'] }), database: schema.string({ enum: ['ok'] }) }),
    User: schema.object({ id: schema.string({ format: 'uuid' }), email: schema.string({ format: 'email' }), displayName: schema.string(), avatarUrl: schema.nullable(schema.string({ format: 'uri' })), role: schema.string({ enum: userRoles }), status: schema.string({ enum: userStatuses }), emailVerified: { type: 'boolean' } }),
    Session: schema.object({ id: schema.string({ format: 'uuid' }), createdAt: schema.string({ format: 'date-time' }), expiresAt: schema.string({ format: 'date-time' }), userAgent: schema.nullable(schema.string()), ipAddress: schema.nullable(schema.string()), isCurrent: { type: 'boolean' } }),
    Category: schema.object({ id: schema.string({ format: 'uuid' }), name: schema.string(), slug: schema.string({ pattern: slugPattern }), description: schema.nullable(schema.string()), createdAt: schema.string({ format: 'date-time' }), updatedAt: schema.string({ format: 'date-time' }) }),
    ProjectTag: schema.ref('Category'),
    Technology: schema.object({ id: schema.string({ format: 'uuid' }), name: schema.string(), slug: schema.string({ pattern: slugPattern }), type: schema.string({ enum: technologyTypes }), description: schema.nullable(schema.string()), createdAt: schema.string({ format: 'date-time' }), updatedAt: schema.string({ format: 'date-time' }) }),
    Project: schema.object({ id: schema.string({ format: 'uuid' }), title: schema.string(), slug: schema.string({ pattern: slugPattern }), summary: schema.string(), content: schema.string(), thumbnailUrl: schema.nullable(schema.string({ format: 'uri' })), demoUrl: schema.nullable(schema.string({ format: 'uri' })), githubUrl: schema.nullable(schema.string({ format: 'uri' })), sourceUrl: schema.nullable(schema.string({ format: 'uri' })), status: schema.string({ enum: projectStatuses }), featured: { type: 'boolean' }, year: schema.nullable({ type: 'integer', minimum: 1900, maximum: 3000 }), publishedAt: schema.nullable(schema.string({ format: 'date-time' })), createdAt: schema.string({ format: 'date-time' }), updatedAt: schema.string({ format: 'date-time' }), tags: schema.array(schema.ref('ProjectTag')), technologies: schema.array(schema.ref('Technology')) }),
    MomentTag: schema.object({ id: schema.string({ format: 'uuid' }), name: schema.string(), slug: schema.string({ pattern: slugPattern }), createdAt: schema.string({ format: 'date-time' }), updatedAt: schema.string({ format: 'date-time' }) }),
    MomentImage: schema.object({ id: schema.string({ format: 'uuid' }), url: schema.string({ format: 'uri' }), altText: schema.nullable(schema.string()), sortOrder: { type: 'integer', minimum: 0 }, createdAt: schema.string({ format: 'date-time' }) }),
    Moment: schema.object({ id: schema.string({ format: 'uuid' }), content: schema.string(), status: schema.string({ enum: projectStatuses }), publishedAt: schema.nullable(schema.string({ format: 'date-time' })), createdAt: schema.string({ format: 'date-time' }), updatedAt: schema.string({ format: 'date-time' }), images: schema.array(schema.ref('MomentImage')), tags: schema.array(schema.ref('MomentTag')) }),
    CommentUser: schema.object({ id: schema.string(), displayName: schema.string(), avatarUrl: schema.nullable(schema.string({ format: 'uri' })) }),
    ProjectComment: schema.object({ id: schema.string({ format: 'uuid' }), projectId: schema.string({ format: 'uuid' }), content: schema.string(), status: schema.string({ enum: commentStatuses }), createdAt: schema.string({ format: 'date-time' }), updatedAt: schema.string({ format: 'date-time' }), user: schema.ref('CommentUser') }),
    MomentComment: schema.object({ id: schema.string({ format: 'uuid' }), momentId: schema.string({ format: 'uuid' }), content: schema.string(), status: schema.string({ enum: commentStatuses }), createdAt: schema.string({ format: 'date-time' }), updatedAt: schema.string({ format: 'date-time' }), user: schema.ref('CommentUser') }),
    UploadedImage: schema.object({ url: schema.string({ format: 'uri' }), publicId: schema.string() }),
    UploadedMomentImage: schema.object({ url: schema.string({ format: 'uri' }), publicId: schema.string() }),
    RegisterRequest: schema.object({ displayName: schema.string({ minLength: 1 }), email: schema.string({ format: 'email' }), password: schema.string({ minLength: 8 }) }),
    LoginRequest: schema.object({ email: schema.string({ format: 'email' }), password: schema.string({ minLength: 1 }) }),
    TokenRequest: schema.object({ token: schema.string({ minLength: 32 }) }),
    EmailRequest: schema.object({ email: schema.string({ format: 'email' }) }),
    ResetPasswordRequest: schema.object({ token: schema.string({ minLength: 32 }), newPassword: schema.string({ minLength: 8 }) }),
    ChangePasswordRequest: schema.object({ currentPassword: schema.string({ minLength: 1 }), newPassword: schema.string({ minLength: 8 }) }),
    UpdateProfileRequest: schema.object({ displayName: schema.string({ minLength: 1 }) }),
    CreateCategoryRequest: schema.object({ name: schema.string({ minLength: 1 }), slug: schema.string({ pattern: slugPattern }), description: schema.string({ minLength: 1 }) }, ['name', 'slug']),
    UpdateCategoryRequest: schema.object({ name: schema.string({ minLength: 1 }), slug: schema.string({ pattern: slugPattern }), description: schema.nullable(schema.string({ minLength: 1 })) }, []),
    CreateTagRequest: schema.object({ name: schema.string({ minLength: 1 }), slug: schema.string({ pattern: slugPattern }), description: schema.string({ minLength: 1 }) }, ['name']),
    CreateMomentTagRequest: schema.object({ name: schema.string({ minLength: 1 }), slug: schema.string({ pattern: slugPattern }) }),
    UpdateMomentTagRequest: schema.object({ name: schema.string({ minLength: 1 }), slug: schema.string({ pattern: slugPattern }) }, []),
    CreateTechnologyRequest: schema.object({ name: schema.string({ minLength: 1 }), slug: schema.string({ pattern: slugPattern }), type: schema.string({ enum: technologyTypes }), description: schema.string({ minLength: 1 }) }, ['name', 'type']),
    UpdateTechnologyRequest: schema.object({ name: schema.string({ minLength: 1 }), slug: schema.string({ pattern: slugPattern }), type: schema.string({ enum: technologyTypes }), description: schema.nullable(schema.string({ minLength: 1 })) }, []),
    CreateProjectRequest: schema.object({ title: schema.string({ minLength: 1 }), slug: schema.string({ pattern: slugPattern }), summary: schema.string({ minLength: 1 }), content: schema.string({ minLength: 1 }), thumbnailUrl: schema.string({ format: 'uri' }), demoUrl: schema.string({ format: 'uri' }), githubUrl: schema.string({ format: 'uri' }), sourceUrl: schema.string({ format: 'uri' }), status: schema.string({ enum: projectStatuses, default: 'DRAFT' }), featured: { type: 'boolean', default: false }, year: { type: 'integer', minimum: 1900, maximum: 3000 }, publishedAt: schema.string({ format: 'date-time' }), tagIds: schema.array(schema.string({ format: 'uuid' })), categoryIds: schema.array(schema.string({ format: 'uuid' })), technologyIds: schema.array(schema.string({ format: 'uuid' })) }, ['title', 'summary', 'content']),
    UpdateProjectRequest: schema.object({ title: schema.string({ minLength: 1 }), slug: schema.string({ pattern: slugPattern }), summary: schema.string({ minLength: 1 }), content: schema.string({ minLength: 1 }), thumbnailUrl: schema.nullable(schema.string({ format: 'uri' })), demoUrl: schema.nullable(schema.string({ format: 'uri' })), githubUrl: schema.nullable(schema.string({ format: 'uri' })), sourceUrl: schema.nullable(schema.string({ format: 'uri' })), status: schema.string({ enum: projectStatuses }), featured: { type: 'boolean' }, year: schema.nullable({ type: 'integer', minimum: 1900, maximum: 3000 }), publishedAt: schema.nullable(schema.string({ format: 'date-time' })), tagIds: schema.array(schema.string({ format: 'uuid' })), categoryIds: schema.array(schema.string({ format: 'uuid' })), technologyIds: schema.array(schema.string({ format: 'uuid' })) }, []),
    CreateMomentRequest: schema.object({ content: schema.string({ minLength: 1 }), status: schema.string({ enum: projectStatuses, default: 'DRAFT' }), publishedAt: schema.string({ format: 'date-time' }), tagIds: schema.array(schema.string({ format: 'uuid' })), images: schema.array(schema.ref('UploadedMomentImage')) }, ['content']),
    UpdateMomentRequest: schema.object({ content: schema.string({ minLength: 1 }), status: schema.string({ enum: projectStatuses }), publishedAt: schema.nullable(schema.string({ format: 'date-time' })), tagIds: schema.array(schema.string({ format: 'uuid' })), images: schema.array(schema.ref('UploadedMomentImage')) }, []),
    ReorderMomentImagesRequest: schema.object({ images: schema.array(schema.object({ id: schema.string({ format: 'uuid' }), sortOrder: { type: 'integer', minimum: 0 } })) }),
    CreateCommentRequest: schema.object({ authorName: schema.string({ minLength: 1, maxLength: 80 }), content: schema.string({ minLength: 1, maxLength: 2000 }) }),
    UpdateCommentRequest: schema.object({ content: schema.string({ minLength: 1, maxLength: 2000 }) }),
    UpdateCommentStatusRequest: schema.object({ status: schema.string({ enum: commentStatuses }) }),
    AdminUserStatusRequest: schema.object({ status: schema.string({ enum: userStatuses }) }),
    Dashboard: schema.object({ users: { type: 'integer' }, projects: { type: 'integer' }, publishedProjects: { type: 'integer' }, projectComments: { type: 'integer' }, moments: { type: 'integer' }, publishedMoments: { type: 'integer' }, momentComments: { type: 'integer' } }),
  },
}

export const runtimeEndpoints = [
  'GET /api/v1/health', 'GET /api/v1/ready',
  'POST /api/v1/auth/register', 'POST /api/v1/auth/verify-email', 'POST /api/v1/auth/resend-verification', 'POST /api/v1/auth/login', 'POST /api/v1/auth/refresh', 'POST /api/v1/auth/logout', 'POST /api/v1/auth/forgot-password', 'POST /api/v1/auth/reset-password', 'POST /api/v1/auth/change-password', 'GET /api/v1/auth/me', 'GET /api/v1/auth/sessions', 'DELETE /api/v1/auth/sessions/{sessionId}', 'POST /api/v1/auth/logout-all',
  'GET /api/v1/users/me', 'PATCH /api/v1/users/me', 'POST /api/v1/users/me/avatar', 'DELETE /api/v1/users/me/avatar',
  'GET /api/v1/categories', 'POST /api/v1/admin/categories', 'GET /api/v1/admin/categories', 'GET /api/v1/admin/categories/{id}', 'PATCH /api/v1/admin/categories/{id}', 'DELETE /api/v1/admin/categories/{id}',
  'GET /api/v1/project-tags', 'POST /api/v1/admin/project-tags', 'GET /api/v1/admin/project-tags', 'GET /api/v1/admin/project-tags/{id}', 'PATCH /api/v1/admin/project-tags/{id}', 'DELETE /api/v1/admin/project-tags/{id}',
  'GET /api/v1/technologies', 'POST /api/v1/admin/technologies', 'GET /api/v1/admin/technologies', 'GET /api/v1/admin/technologies/{id}', 'PATCH /api/v1/admin/technologies/{id}', 'DELETE /api/v1/admin/technologies/{id}',
  'GET /api/v1/projects', 'GET /api/v1/projects/{slug}', 'POST /api/v1/admin/projects', 'GET /api/v1/admin/projects', 'POST /api/v1/admin/projects/{id}/thumbnail', 'DELETE /api/v1/admin/projects/{id}/thumbnail', 'GET /api/v1/admin/projects/{id}', 'PATCH /api/v1/admin/projects/{id}', 'DELETE /api/v1/admin/projects/{id}',
  'GET /api/v1/moment-tags', 'POST /api/v1/admin/moment-tags', 'GET /api/v1/admin/moment-tags', 'GET /api/v1/admin/moment-tags/{id}', 'PATCH /api/v1/admin/moment-tags/{id}', 'DELETE /api/v1/admin/moment-tags/{id}',
  'GET /api/v1/moments', 'POST /api/v1/moments/{id}/like', 'GET /api/v1/moments/{id}/comments', 'POST /api/v1/moments/{id}/comments', 'PATCH /api/v1/moment-comments/{id}', 'DELETE /api/v1/moment-comments/{id}', 'GET /api/v1/moments/{id}', 'POST /api/v1/admin/moments', 'GET /api/v1/admin/moments', 'GET /api/v1/admin/moment-comments', 'PATCH /api/v1/admin/moment-comments/{id}/status', 'DELETE /api/v1/admin/moment-comments/{id}', 'POST /api/v1/admin/moments/{id}/images', 'PATCH /api/v1/admin/moments/{id}/images/reorder', 'DELETE /api/v1/admin/moment-images/{id}', 'GET /api/v1/admin/moments/{id}', 'PATCH /api/v1/admin/moments/{id}', 'DELETE /api/v1/admin/moments/{id}',
  'GET /api/v1/projects/{slug}/comments', 'POST /api/v1/projects/{slug}/comments', 'PATCH /api/v1/project-comments/{id}', 'DELETE /api/v1/project-comments/{id}', 'GET /api/v1/admin/project-comments', 'PATCH /api/v1/admin/project-comments/{id}/status', 'DELETE /api/v1/admin/project-comments/{id}',
  'GET /api/v1/admin/dashboard', 'GET /api/v1/admin/users', 'PATCH /api/v1/admin/users/{id}/status', 'POST /api/v1/admin/uploads/images',
  'GET /api/v1/docs', 'GET /api/v1/docs/openapi.json',
]

export function buildOpenApiDocument() {
  const paths: Record<string, PathItem> = {}
  add(paths, [
    op('get', '/api/v1/health', 'Health', 'healthCheck', 'Check API health', 'Returns process liveness.', { responses: { 200: response('API is alive.', ok(schema.ref('Health')), { success: true, data: { status: 'ok' } }), ...errors([500]) } }),
    op('get', '/api/v1/ready', 'Health', 'readinessCheck', 'Check API readiness', 'Checks database readiness.', { responses: { 200: response('API and database are ready.', ok(schema.ref('Ready')), { success: true, data: { status: 'ok', database: 'ok' } }), ...errors([500]) } }),
    op('get', '/api/v1/docs', 'Docs', 'docsSwaggerUi', 'Open Swagger UI', 'Serves the single full API Swagger UI page.', { responses: { 200: response('Swagger UI HTML.') } }),
    op('get', '/api/v1/docs/openapi.json', 'Docs', 'docsOpenApiJson', 'Get full OpenAPI document', 'Returns the full OpenAPI JSON used by Swagger UI.', { responses: { 200: response('OpenAPI JSON document.') } }),
  ])

  add(paths, [
    op('post', '/api/v1/auth/register', 'Auth', 'authRegister', 'Register an account', 'Creates a USER account and emails an email-verification token. No cookies are set.', { rateLimit: '5 per default auth window.', body: jsonBody('RegisterRequest', { displayName: 'MinLD', email: 'minld@example.com', password: 'correct-horse-battery' }), responses: { 201: response('Registered user.', ok(schema.object({ user: schema.ref('User') })), { success: true, data: { user: userExample } }), ...errors([400, 409, 429, 500]) } }),
    op('post', '/api/v1/auth/verify-email', 'Auth', 'authVerifyEmail', 'Verify email', 'Consumes an email-verification token.', { rateLimit: '20 per default auth window.', body: jsonBody('TokenRequest', { token: 'a'.repeat(64) }), responses: { 200: response('Email verified.', ok(schema.ref('Message')), { success: true, data: { message: 'Email verified.' } }), ...errors([400, 429, 500]) } }),
    op('post', '/api/v1/auth/resend-verification', 'Auth', 'authResendVerification', 'Resend verification email', 'Sends a verification email when the account exists and is unverified. Always returns a generic message.', { rateLimit: '5 per default auth window.', body: jsonBody('EmailRequest', { email: 'minld@example.com' }), responses: { 200: response('Generic delivery message.', ok(schema.ref('Message')), { success: true, data: { message: 'If the account exists, instructions have been sent.' } }), ...errors([400, 429, 500]) } }),
    op('post', '/api/v1/auth/login', 'Auth', 'authLogin', 'Log in to an account', `Validates credentials for an ACTIVE verified user. Server sets HttpOnly ${env.ACCESS_TOKEN_COOKIE_NAME} and ${env.REFRESH_TOKEN_COOKIE_NAME} cookies via Set-Cookie; tokens are not returned for frontend storage.`, { rateLimit: '50 per default auth window.', body: jsonBody('LoginRequest', { email: 'minld@example.com', password: 'correct-horse-battery' }), responses: { 200: response('Logged in; auth cookies set.', ok(schema.object({ user: schema.ref('User') })), { success: true, data: { user: userExample } }), ...errors([400, 401, 403, 429, 500]) } }),
    op('post', '/api/v1/auth/refresh', 'Auth', 'authRefresh', 'Refresh authentication cookies', `Uses the HttpOnly ${env.REFRESH_TOKEN_COOKIE_NAME} cookie, rotates the refresh session, sets new auth cookies, clears cookies on failure.`, { auth: 'user', rateLimit: '60 per default auth window.', responses: { 200: response('Session refreshed; new cookies set.', ok(schema.object({ user: schema.ref('User') })), { success: true, data: { user: userExample } }), ...errors([401, 403, 429, 500]) } }),
    op('post', '/api/v1/auth/logout', 'Auth', 'authLogout', 'Log out current refresh session', 'Revokes refresh session when refresh cookie is present and clears auth cookies.', { responses: { 200: response('Logged out; cookies cleared.', ok(schema.ref('Message')), { success: true, data: { message: 'Logged out.' } }), ...errors([403, 500]) } }),
    op('post', '/api/v1/auth/forgot-password', 'Auth', 'authForgotPassword', 'Request password reset', 'Sends a password-reset email when the account exists. Always returns a generic message.', { rateLimit: '5 per default auth window.', body: jsonBody('EmailRequest', { email: 'minld@example.com' }), responses: { 200: response('Generic delivery message.', ok(schema.ref('Message')), { success: true, data: { message: 'If the account exists, instructions have been sent.' } }), ...errors([400, 429, 500]) } }),
    op('post', '/api/v1/auth/reset-password', 'Auth', 'authResetPassword', 'Reset password', 'Consumes password-reset token, updates password, revokes all sessions.', { rateLimit: '10 per default auth window.', body: jsonBody('ResetPasswordRequest', { token: 'a'.repeat(64), newPassword: 'new-correct-horse' }), responses: { 200: response('Password reset.', ok(schema.ref('Message')), { success: true, data: { message: 'Password reset.' } }), ...errors([400, 429, 500]) } }),
    op('post', '/api/v1/auth/change-password', 'Auth', 'authChangePassword', 'Change current password', 'Requires access cookie and active user. Updates password, revokes sessions, clears cookies.', { auth: 'user', body: jsonBody('ChangePasswordRequest', { currentPassword: 'correct-horse-battery', newPassword: 'new-correct-horse' }), responses: { 200: response('Password changed; sign in again.', ok(schema.ref('Message')), { success: true, data: { message: 'Password changed. Please sign in again.' } }), ...errors([400, 401, 403, 500]) } }),
    op('get', '/api/v1/auth/me', 'Auth', 'authGetCurrentUser', 'Get current authenticated user', 'Reads user identity from access cookie.', { auth: 'user', responses: { 200: response('Current user.', ok(schema.object({ user: schema.ref('User') })), { success: true, data: { user: userExample } }), ...errors([401, 500]) } }),
    op('get', '/api/v1/auth/sessions', 'Auth', 'authListSessions', 'List own sessions', 'Lists auth sessions for current user.', { auth: 'user', responses: { 200: response('Own sessions.', ok(schema.object({ sessions: schema.array(schema.ref('Session')) })), { success: true, data: { sessions: [{ id: uuid, createdAt: '2026-08-21T00:00:00.000Z', expiresAt: '2026-08-28T00:00:00.000Z', userAgent: 'Mozilla/5.0', ipAddress: '127.0.0.1', isCurrent: true }] } }), ...errors([401, 500]) } }),
    op('delete', '/api/v1/auth/sessions/{sessionId}', 'Auth', 'authRevokeSession', 'Revoke own session', 'Revokes a session belonging to the current user.', { auth: 'user', params: [param.sessionId()], responses: { 200: response('Session revoked.', ok(schema.ref('Message')), { success: true, data: { message: 'Session revoked.' } }), ...errors([400, 401, 403, 404, 500]) } }),
    op('post', '/api/v1/auth/logout-all', 'Auth', 'authLogoutAll', 'Log out all sessions', 'Revokes all sessions for current user and clears cookies.', { auth: 'user', responses: { 200: response('All sessions revoked.', ok(schema.ref('Message')), { success: true, data: { message: 'Logged out from all sessions.' } }), ...errors([401, 403, 500]) } }),
  ])

  const userData = schema.object({ user: schema.ref('User') })
  add(paths, [
    op('get', '/api/v1/users/me', 'Users', 'usersGetOwnProfile', 'Get own profile', 'Returns current user profile from access cookie.', { auth: 'user', responses: { 200: response('Own profile.', ok(userData), { success: true, data: { user: userExample } }), ...errors([401, 404, 500]) } }),
    op('patch', '/api/v1/users/me', 'Users', 'usersUpdateOwnProfile', 'Update own profile', 'Updates display name.', { auth: 'user', body: jsonBody('UpdateProfileRequest', { displayName: 'MinLD' }), responses: { 200: response('Updated profile.', ok(userData), { success: true, data: { user: userExample } }), ...errors([400, 401, 403, 500]) } }),
    op('post', '/api/v1/users/me/avatar', 'Users', 'usersReplaceOwnAvatar', 'Upload or replace own avatar', 'multipart/form-data image upload. Field name: avatar. Allowed MIME: image/jpeg, image/png, image/webp. Max size uses MEDIA_MAX_FILE_SIZE_BYTES.', { auth: 'user', rateLimit: '30 per hour.', body: multipartBody({ avatar: { type: 'string', format: 'binary' } }, ['avatar']), responses: { 200: response('Updated user with avatar.', ok(userData), { success: true, data: { user: { ...userExample, avatarUrl: 'https://res.cloudinary.com/demo/avatar.webp' } } }), ...errors([400, 401, 403, 413, 429, 500]) } }),
    op('delete', '/api/v1/users/me/avatar', 'Users', 'usersDeleteOwnAvatar', 'Delete own avatar', 'Clears avatar fields and deletes Cloudinary asset when present.', { auth: 'user', responses: { 204: response('Avatar deleted; no body.'), ...errors([401, 403, 404, 500]) } }),
  ])

  addCrud(paths, 'Categories', 'category', 'categories', 'Category', 'CreateCategoryRequest', 'UpdateCategoryRequest', 'category', true)
  addCrud(paths, 'Project Tags', 'projectTag', 'project-tags', 'ProjectTag', 'CreateTagRequest', 'UpdateCategoryRequest', 'tag', true)
  addCrud(paths, 'Moment Tags', 'momentTag', 'moment-tags', 'MomentTag', 'CreateMomentTagRequest', 'UpdateMomentTagRequest', 'tag', true)
  addCrud(paths, 'Technologies', 'technology', 'technologies', 'Technology', 'CreateTechnologyRequest', 'UpdateTechnologyRequest', 'technology', true, [q('type', schema.string({ enum: technologyTypes }), 'Filter by technology type.', 'FRAMEWORK')])

  add(paths, [
    op('get', '/api/v1/projects', 'Projects - Public', 'projectsListPublished', 'List published projects', 'Returns published projects only. Supports filters and pagination.', { query: projectQueries, responses: { 200: response('Published projects.', paginated('projects', 'Project'), { success: true, data: { projects: [projectExample] }, meta: { page: 1, limit: 20, total: 1, totalPages: 1 } }), ...errors([400, 500]) } }),
    op('get', '/api/v1/projects/{slug}', 'Projects - Public', 'projectsGetPublishedBySlug', 'Get a published project by slug', 'Returns one published project by slug.', { params: [param.slug()], responses: { 200: response('Published project.', ok(schema.object({ project: schema.ref('Project') })), { success: true, data: { project: projectExample } }), ...errors([400, 404, 500]) } }),
    op('post', '/api/v1/admin/projects', 'Projects - Admin', 'adminProjectsCreate', 'Create a project', 'Creates a project. JSON body is supported by current route; service can also consume an uploaded file if middleware is added later, but this route currently has no Multer middleware.', { auth: 'admin', body: jsonBody('CreateProjectRequest', { title: 'MinLD Portfolio', summary: 'Personal portfolio built with Vue and Express.', content: 'Project detail content...', status: 'PUBLISHED', featured: true, year: 2026, tagIds: [], categoryIds: [], technologyIds: [] }), responses: { 201: response('Created project.', ok(schema.object({ project: schema.ref('Project') })), { success: true, data: { project: projectExample } }), ...errors([400, 401, 403, 409, 500]) } }),
    op('get', '/api/v1/admin/projects', 'Projects - Admin', 'adminProjectsList', 'List projects as admin', 'Returns all projects by filters and pagination, including draft/archived when requested.', { auth: 'admin', query: [...projectQueries, q('status', schema.string({ enum: projectStatuses }), 'Filter by project status.', 'DRAFT')], responses: { 200: response('Projects.', paginated('projects', 'Project'), { success: true, data: { projects: [projectExample] }, meta: { page: 1, limit: 20, total: 1, totalPages: 1 } }), ...errors([400, 401, 403, 500]) } }),
    op('post', '/api/v1/admin/projects/{id}/thumbnail', 'Projects - Admin', 'adminProjectsReplaceThumbnail', 'Upload or replace project thumbnail', 'multipart/form-data image upload. Field name: thumbnail. Allowed MIME: image/jpeg, image/png, image/webp. Max size uses MEDIA_MAX_FILE_SIZE_BYTES.', { auth: 'admin', rateLimit: '30 per hour.', params: [param.id('Project UUID.')], body: multipartBody({ thumbnail: { type: 'string', format: 'binary' } }, ['thumbnail']), responses: { 200: response('Project with updated thumbnail.', ok(schema.object({ project: schema.ref('Project') })), { success: true, data: { project: { ...projectExample, thumbnailUrl: 'https://res.cloudinary.com/demo/project.webp' } } }), ...errors([400, 401, 403, 404, 413, 429, 500]) } }),
    op('delete', '/api/v1/admin/projects/{id}/thumbnail', 'Projects - Admin', 'adminProjectsDeleteThumbnail', 'Delete project thumbnail', 'Clears project thumbnail fields and deletes Cloudinary asset when present.', { auth: 'admin', params: [param.id('Project UUID.')], responses: { 204: response('Thumbnail deleted; no body.'), ...errors([400, 401, 403, 404, 500]) } }),
    op('get', '/api/v1/admin/projects/{id}', 'Projects - Admin', 'adminProjectsGetById', 'Get project by ID', 'Returns a project regardless of status.', { auth: 'admin', params: [param.id('Project UUID.')], responses: { 200: response('Project.', ok(schema.object({ project: schema.ref('Project') })), { success: true, data: { project: projectExample } }), ...errors([400, 401, 403, 404, 500]) } }),
    op('patch', '/api/v1/admin/projects/{id}', 'Projects - Admin', 'adminProjectsUpdate', 'Update a project', 'Updates any supplied project fields. Nullable URL/date/year fields can clear existing values.', { auth: 'admin', params: [param.id('Project UUID.')], body: jsonBody('UpdateProjectRequest', { title: 'Updated Portfolio', featured: false, publishedAt: null, tagIds: [] }), responses: { 200: response('Updated project.', ok(schema.object({ project: schema.ref('Project') })), { success: true, data: { project: projectExample } }), ...errors([400, 401, 403, 404, 409, 500]) } }),
    op('delete', '/api/v1/admin/projects/{id}', 'Projects - Admin', 'adminProjectsDelete', 'Delete a project', 'Deletes a project by ID.', { auth: 'admin', params: [param.id('Project UUID.')], responses: { 204: response('Project deleted; no body.'), ...errors([400, 401, 403, 404, 500]) } }),
  ])

  addMomentAndCommentPaths(paths)
  addAdminPaths(paths)
  addUploadPaths(paths)

  return {
    openapi: '3.0.3',
    info: { title: 'MinLD Portfolio API Docs', version: '1.0.0', description: `Full OpenAPI contract for MinLD Portfolio backend. Authentication uses HttpOnly cookies, not Bearer tokens. Login/refresh set ${env.ACCESS_TOKEN_COOKIE_NAME} and ${env.REFRESH_TOKEN_COOKIE_NAME}. Swagger UI sends requests with credentials included.` },
    servers: [{ url: `http://localhost:${env.PORT}`, description: 'Local API server' }, { url: '/', description: 'Same-origin server' }],
    tags: ['Auth', 'Users', 'Projects - Public', 'Projects - Admin', 'Categories - Public', 'Categories - Admin', 'Project Tags - Public', 'Project Tags - Admin', 'Technologies - Public', 'Technologies - Admin', 'Moments - Public', 'Moments - Admin', 'Moment Tags - Public', 'Moment Tags - Admin', 'Project Comments', 'Admin', 'Uploads', 'Health', 'Docs'].map((name) => ({ name })),
    paths,
    components,
  }
}

function addCrud(paths: Record<string, PathItem>, baseTag: string, idPrefix: string, route: string, dto: string, createReq: string, updateReq: string, dataName: string, publicList = false, query: unknown[] = []) {
  const publicTag = `${baseTag} - Public`
  const adminTag = `${baseTag} - Admin`
  const item = schema.object({ [dataName]: schema.ref(dto) })
  const collectionName = route === 'categories' ? 'categories' : route === 'technologies' ? 'technologies' : 'tags'
  const items = list(collectionName, dto)
  const sample = dataName === 'technology' ? { id: uuid, name: 'TypeScript', slug: 'typescript', type: 'LANGUAGE', description: null, createdAt: '2026-08-21T00:00:00.000Z', updatedAt: '2026-08-21T00:00:00.000Z' } : { id: uuid, name: 'Backend', slug: 'backend', description: null, createdAt: '2026-08-21T00:00:00.000Z', updatedAt: '2026-08-21T00:00:00.000Z' }
  const opPrefix = idPrefix === 'category' ? 'Categories' : `${cap(idPrefix)}s`
  if (publicList) add(paths, [op('get', `/api/v1/${route}`, publicTag, `${idPrefix}sListPublic`, `List ${baseTag.toLowerCase()}`, `Returns all ${baseTag.toLowerCase()} sorted by name.`, { query, responses: { 200: response(`List of ${baseTag.toLowerCase()}.`, items, { success: true, data: { [collectionName]: [sample] } }), ...errors([400, 500]) } })])
  add(paths, [
    op('post', `/api/v1/admin/${route}`, adminTag, `admin${opPrefix}Create`, `Create ${dataName}`, `Creates a ${dataName}; duplicate name/slug returns conflict.`, { auth: 'admin', body: jsonBody(createReq, dataName === 'technology' ? { name: 'TypeScript', type: 'LANGUAGE' } : { name: 'Backend', slug: 'backend' }), responses: { 201: response(`Created ${dataName}.`, ok(item), { success: true, data: { [dataName]: sample } }), ...errors([400, 401, 403, 409, 500]) } }),
    op('get', `/api/v1/admin/${route}`, adminTag, `admin${opPrefix}List`, `List ${baseTag.toLowerCase()} as admin`, `Returns all ${baseTag.toLowerCase()}.`, { auth: 'admin', query, responses: { 200: response(`List of ${baseTag.toLowerCase()}.`, items, { success: true, data: { [collectionName]: [sample] } }), ...errors([400, 401, 403, 500]) } }),
    op('get', `/api/v1/admin/${route}/{id}`, adminTag, `admin${opPrefix}GetById`, `Get ${dataName} by ID`, `Returns one ${dataName}.`, { auth: 'admin', params: [param.id(`${cap(dataName)} UUID.`)], responses: { 200: response(`${cap(dataName)}.`, ok(item), { success: true, data: { [dataName]: sample } }), ...errors([400, 401, 403, 404, 500]) } }),
    op('patch', `/api/v1/admin/${route}/{id}`, adminTag, `admin${opPrefix}Update`, `Update ${dataName}`, `Updates at least one supplied ${dataName} field.`, { auth: 'admin', params: [param.id(`${cap(dataName)} UUID.`)], body: jsonBody(updateReq, dataName === 'technology' ? { description: null } : { name: 'Updated Backend' }), responses: { 200: response(`Updated ${dataName}.`, ok(item), { success: true, data: { [dataName]: sample } }), ...errors([400, 401, 403, 404, 409, 500]) } }),
    op('delete', `/api/v1/admin/${route}/{id}`, adminTag, `admin${opPrefix}Delete`, `Delete ${dataName}`, `Deletes one ${dataName}.`, { auth: 'admin', params: [param.id(`${cap(dataName)} UUID.`)], responses: { 204: response(`${cap(dataName)} deleted; no body.`), ...errors([400, 401, 403, 404, 500]) } }),
  ])
}

function addMomentAndCommentPaths(paths: Record<string, PathItem>) {
  add(paths, [
    op('get', '/api/v1/moments', 'Moments - Public', 'momentsListPublished', 'List published moments', 'Returns published moments with images and tags.', { responses: { 200: response('Published moments.', list('moments', 'Moment'), { success: true, data: { moments: [momentExample] } }), ...errors([500]) } }),
    op('post', '/api/v1/moments/{id}/like', 'Moments - Public', 'momentsToggleLike', 'Toggle moment like', 'Requires auth. Toggles current user like on a published moment.', { auth: 'user', rateLimit: '60 per minute.', params: [param.id('Moment UUID.')], responses: { 200: response('Like state.', ok(schema.object({ liked: { type: 'boolean' }, likeCount: { type: 'integer', minimum: 0 } })), { success: true, data: { liked: true, likeCount: 12 } }), ...errors([400, 401, 403, 404, 429, 500]) } }),
    op('get', '/api/v1/moments/{id}/comments', 'Moments - Public', 'momentsListComments', 'List visible moment comments', 'Returns visible comments for a published moment.', { params: [param.id('Moment UUID.')], responses: { 200: response('Moment comments.', list('comments', 'MomentComment'), { success: true, data: { comments: [] } }), ...errors([400, 404, 500]) } }),
    op('post', '/api/v1/moments/{id}/comments', 'Moments - Public', 'momentsCreateComment', 'Create moment comment', 'Creates an anonymous/public comment on a published moment.', { rateLimit: '20 per default window.', params: [param.id('Moment UUID.')], body: jsonBody('CreateCommentRequest', { authorName: 'Frontend Dev', content: 'Great update.' }), responses: { 201: response('Created comment.', ok(schema.object({ comment: schema.ref('MomentComment') })), { success: true, data: { comment: commentExample('momentId') } }), ...errors([400, 404, 429, 500]) } }),
    op('patch', '/api/v1/moment-comments/{id}', 'Moments - Public', 'momentCommentsUpdateOwn', 'Update own moment comment', 'Updates a comment owned by current user; anonymous comments cannot be edited by users.', { auth: 'user', params: [param.id('Moment comment UUID.')], body: jsonBody('UpdateCommentRequest', { content: 'Updated comment.' }), responses: { 200: response('Updated comment.', ok(schema.object({ comment: schema.ref('MomentComment') })), { success: true, data: { comment: commentExample('momentId') } }), ...errors([400, 401, 403, 404, 500]) } }),
    op('delete', '/api/v1/moment-comments/{id}', 'Moments - Public', 'momentCommentsDeleteOwn', 'Delete own moment comment', 'Deletes a comment owned by current user.', { auth: 'user', params: [param.id('Moment comment UUID.')], responses: { 204: response('Comment deleted; no body.'), ...errors([400, 401, 403, 404, 500]) } }),
    op('get', '/api/v1/moments/{id}', 'Moments - Public', 'momentsGetPublishedById', 'Get published moment by ID', 'Returns one published moment.', { params: [param.id('Moment UUID.')], responses: { 200: response('Published moment.', ok(schema.object({ moment: schema.ref('Moment') })), { success: true, data: { moment: momentExample } }), ...errors([400, 404, 500]) } }),
    op('post', '/api/v1/admin/moments', 'Moments - Admin', 'adminMomentsCreate', 'Create moment', 'Creates a moment with optional tag IDs and already-uploaded image metadata.', { auth: 'admin', body: jsonBody('CreateMomentRequest', { content: 'Shipped docs.', status: 'PUBLISHED', tagIds: [], images: [{ url: 'https://res.cloudinary.com/demo/moment.webp', publicId: 'moments/example' }] }), responses: { 201: response('Created moment.', ok(schema.object({ moment: schema.ref('Moment') })), { success: true, data: { moment: momentExample } }), ...errors([400, 401, 403, 500]) } }),
    op('get', '/api/v1/admin/moments', 'Moments - Admin', 'adminMomentsList', 'List moments as admin', 'Returns moments with search/status filters and pagination.', { auth: 'admin', query: momentAdminQueries, responses: { 200: response('Moments.', paginated('moments', 'Moment'), { success: true, data: { moments: [momentExample] }, meta: { page: 1, limit: 20, total: 1, totalPages: 1 } }), ...errors([400, 401, 403, 500]) } }),
    op('get', '/api/v1/admin/moment-comments', 'Moments - Admin', 'adminMomentCommentsList', 'List all moment comments', 'Returns all moment comments regardless of status.', { auth: 'admin', responses: { 200: response('Moment comments.', list('comments', 'MomentComment'), { success: true, data: { comments: [] } }), ...errors([401, 403, 500]) } }),
    op('patch', '/api/v1/admin/moment-comments/{id}/status', 'Moments - Admin', 'adminMomentCommentsUpdateStatus', 'Update moment comment status', 'Sets comment visibility.', { auth: 'admin', params: [param.id('Moment comment UUID.')], body: jsonBody('UpdateCommentStatusRequest', { status: 'HIDDEN' }), responses: { 200: response('Updated comment.', ok(schema.object({ comment: schema.ref('MomentComment') })), { success: true, data: { comment: commentExample('momentId') } }), ...errors([400, 401, 403, 404, 500]) } }),
    op('delete', '/api/v1/admin/moment-comments/{id}', 'Moments - Admin', 'adminMomentCommentsDelete', 'Delete moment comment as admin', 'Deletes any moment comment.', { auth: 'admin', params: [param.id('Moment comment UUID.')], responses: { 204: response('Comment deleted; no body.'), ...errors([400, 401, 403, 404, 500]) } }),
    op('post', '/api/v1/admin/moments/{id}/images', 'Moments - Admin', 'adminMomentsAddImages', 'Upload moment images', 'multipart/form-data image upload. Field name: images. Up to 10 files per request; moment can have at most 10 images total. Allowed MIME: image/jpeg, image/png, image/webp.', { auth: 'admin', rateLimit: '30 per hour.', params: [param.id('Moment UUID.')], body: multipartBody({ images: { type: 'array', items: { type: 'string', format: 'binary' }, maxItems: 10 } }, ['images']), responses: { 200: response('Moment with images.', ok(schema.object({ moment: schema.ref('Moment') })), { success: true, data: { moment: momentExample } }), ...errors([400, 401, 403, 404, 413, 429, 500]) } }),
    op('patch', '/api/v1/admin/moments/{id}/images/reorder', 'Moments - Admin', 'adminMomentsReorderImages', 'Reorder moment images', 'Updates image sort orders for a moment.', { auth: 'admin', params: [param.id('Moment UUID.')], body: jsonBody('ReorderMomentImagesRequest', { images: [{ id: uuid, sortOrder: 0 }] }), responses: { 200: response('Reordered moment.', ok(schema.object({ moment: schema.ref('Moment') })), { success: true, data: { moment: momentExample } }), ...errors([400, 401, 403, 404, 500]) } }),
    op('delete', '/api/v1/admin/moment-images/{id}', 'Moments - Admin', 'adminMomentImagesDelete', 'Delete moment image', 'Deletes a moment image row and Cloudinary asset.', { auth: 'admin', params: [param.id('Moment image UUID.')], responses: { 204: response('Image deleted; no body.'), ...errors([400, 401, 403, 404, 500]) } }),
    op('get', '/api/v1/admin/moments/{id}', 'Moments - Admin', 'adminMomentsGetById', 'Get moment by ID', 'Returns any moment regardless of status.', { auth: 'admin', params: [param.id('Moment UUID.')], responses: { 200: response('Moment.', ok(schema.object({ moment: schema.ref('Moment') })), { success: true, data: { moment: momentExample } }), ...errors([400, 401, 403, 404, 500]) } }),
    op('patch', '/api/v1/admin/moments/{id}', 'Moments - Admin', 'adminMomentsUpdate', 'Update moment', 'Updates moment fields. Nullable publishedAt clears publication date. Supplied images are appended from existing uploaded image metadata.', { auth: 'admin', params: [param.id('Moment UUID.')], body: jsonBody('UpdateMomentRequest', { content: 'Updated moment.', publishedAt: null, images: [{ url: 'https://res.cloudinary.com/demo/moment.webp', publicId: 'moments/example' }] }), responses: { 200: response('Updated moment.', ok(schema.object({ moment: schema.ref('Moment') })), { success: true, data: { moment: momentExample } }), ...errors([400, 401, 403, 404, 500]) } }),
    op('delete', '/api/v1/admin/moments/{id}', 'Moments - Admin', 'adminMomentsDelete', 'Delete moment', 'Deletes a moment.', { auth: 'admin', params: [param.id('Moment UUID.')], responses: { 204: response('Moment deleted; no body.'), ...errors([400, 401, 403, 404, 500]) } }),
  ])

  add(paths, [
    op('get', '/api/v1/projects/{slug}/comments', 'Project Comments', 'projectCommentsList', 'List visible project comments', 'Returns visible comments for a published project.', { params: [param.slug()], responses: { 200: response('Project comments.', list('comments', 'ProjectComment'), { success: true, data: { comments: [] } }), ...errors([400, 404, 500]) } }),
    op('post', '/api/v1/projects/{slug}/comments', 'Project Comments', 'projectCommentsCreate', 'Create project comment', 'Creates an anonymous/public comment on a published project.', { rateLimit: '20 per default window.', params: [param.slug()], body: jsonBody('CreateCommentRequest', { authorName: 'Frontend Dev', content: 'Useful project.' }), responses: { 201: response('Created comment.', ok(schema.object({ comment: schema.ref('ProjectComment') })), { success: true, data: { comment: commentExample('projectId') } }), ...errors([400, 404, 429, 500]) } }),
    op('patch', '/api/v1/project-comments/{id}', 'Project Comments', 'projectCommentsUpdateOwn', 'Update own project comment', 'Updates a comment owned by current user; anonymous comments cannot be edited by users.', { auth: 'user', params: [param.id('Project comment UUID.')], body: jsonBody('UpdateCommentRequest', { content: 'Updated comment.' }), responses: { 200: response('Updated comment.', ok(schema.object({ comment: schema.ref('ProjectComment') })), { success: true, data: { comment: commentExample('projectId') } }), ...errors([400, 401, 403, 404, 500]) } }),
    op('delete', '/api/v1/project-comments/{id}', 'Project Comments', 'projectCommentsDeleteOwn', 'Delete own project comment', 'Deletes a comment owned by current user.', { auth: 'user', params: [param.id('Project comment UUID.')], responses: { 204: response('Comment deleted; no body.'), ...errors([400, 401, 403, 404, 500]) } }),
    op('get', '/api/v1/admin/project-comments', 'Project Comments', 'adminProjectCommentsList', 'List all project comments', 'Returns all project comments regardless of status.', { auth: 'admin', responses: { 200: response('Project comments.', list('comments', 'ProjectComment'), { success: true, data: { comments: [] } }), ...errors([401, 403, 500]) } }),
    op('patch', '/api/v1/admin/project-comments/{id}/status', 'Project Comments', 'adminProjectCommentsUpdateStatus', 'Update project comment status', 'Sets comment visibility.', { auth: 'admin', params: [param.id('Project comment UUID.')], body: jsonBody('UpdateCommentStatusRequest', { status: 'HIDDEN' }), responses: { 200: response('Updated comment.', ok(schema.object({ comment: schema.ref('ProjectComment') })), { success: true, data: { comment: commentExample('projectId') } }), ...errors([400, 401, 403, 404, 500]) } }),
    op('delete', '/api/v1/admin/project-comments/{id}', 'Project Comments', 'adminProjectCommentsDelete', 'Delete project comment as admin', 'Deletes any project comment.', { auth: 'admin', params: [param.id('Project comment UUID.')], responses: { 204: response('Comment deleted; no body.'), ...errors([400, 401, 403, 404, 500]) } }),
  ])
}

function addAdminPaths(paths: Record<string, PathItem>) {
  add(paths, [
    op('get', '/api/v1/admin/dashboard', 'Admin', 'adminGetDashboard', 'Get admin dashboard counts', 'Returns aggregate counts for users, projects, comments, and moments.', { auth: 'admin', responses: { 200: response('Dashboard counts.', ok(schema.object({ dashboard: schema.ref('Dashboard') })), { success: true, data: { dashboard: { users: 10, projects: 5, publishedProjects: 3, projectComments: 12, moments: 8, publishedMoments: 4, momentComments: 9 } } }), ...errors([401, 403, 500]) } }),
    op('get', '/api/v1/admin/users', 'Admin', 'adminUsersList', 'List users as admin', 'Returns users with search, role/status filters, and pagination.', { auth: 'admin', query: [q('search', schema.string({ minLength: 1 }), 'Search email or display name.', 'minld'), q('role', schema.string({ enum: userRoles }), 'Filter by role.', 'USER'), q('status', schema.string({ enum: userStatuses }), 'Filter by status.', 'ACTIVE'), q('page', { type: 'integer', minimum: 1, default: 1 }, 'Page number.', 1), q('limit', { type: 'integer', minimum: 1, maximum: 100, default: 20 }, 'Items per page.', 20)], responses: { 200: response('Users.', paginated('users', 'User'), { success: true, data: { users: [userExample] }, meta: { page: 1, limit: 20, total: 1, totalPages: 1 } }), ...errors([400, 401, 403, 500]) } }),
    op('patch', '/api/v1/admin/users/{id}/status', 'Admin', 'adminUsersUpdateStatus', 'Update user status', 'Sets user ACTIVE/BANNED. Current admin cannot ban self.', { auth: 'admin', params: [param.id('User UUID.')], body: jsonBody('AdminUserStatusRequest', { status: 'BANNED' }), responses: { 200: response('Updated user.', ok(schema.object({ user: schema.ref('User') })), { success: true, data: { user: { ...userExample, status: 'BANNED' } } }), ...errors([400, 401, 403, 404, 500]) } }),
  ])
}

function addUploadPaths(paths: Record<string, PathItem>) {
  add(paths, [
    op('post', '/api/v1/admin/uploads/images', 'Uploads', 'adminUploadsImage', 'Upload image', 'Generic admin image upload. multipart/form-data field name: image; optional folder matches /^[a-z0-9/_-]+$/i and defaults to uploads. Allowed MIME: image/jpeg, image/png, image/webp.', { auth: 'admin', rateLimit: '30 per hour.', body: multipartBody({ image: { type: 'string', format: 'binary' }, folder: schema.string({ pattern: '^[a-z0-9/_-]+$', default: 'uploads' }) }, ['image'], { folder: 'uploads' }), responses: { 201: response('Uploaded image.', ok(schema.object({ image: schema.ref('UploadedImage') })), { success: true, data: { image: { url: 'https://res.cloudinary.com/demo/image.webp', publicId: 'uploads/image' } } }), ...errors([400, 401, 403, 413, 429, 500]) } }),
  ])
}

function commentExample(parent: 'projectId' | 'momentId') {
  return { id: uuid, [parent]: uuid, content: 'Useful update.', status: 'VISIBLE', createdAt: '2026-08-21T00:00:00.000Z', updatedAt: '2026-08-21T00:00:00.000Z', user: { id: '', displayName: 'Frontend Dev', avatarUrl: null } }
}

function cap(value: string) {
  return `${value.charAt(0).toUpperCase()}${value.slice(1)}`
}
