# MinLD.PFL — Backend Engineering Roadmap & AI Context

> **Project:** MinLD.PFL  
> **Backend:** MinLD.PFL API  
> **Architecture:** Clean Modular Monolith  
> **Reference architecture:** Follow the engineering style of the author's ThesiFlow Express API, simplified for a personal portfolio.  
> **Stack:** Node.js + Express.js + TypeScript + Prisma + PostgreSQL + Docker Compose + Cloudinary  
> **This file is the single source of truth.**

---

# 0. CURRENT CONTEXT

```yaml
project: MinLD.PFL
backend: MinLD.PFL API

status: IN_PROGRESS

architecture: CLEAN_MODULAR_MONOLITH
data_access_policy: REPOSITORY_ONLY
api_response_policy: STANDARD_ENVELOPE
database: PostgreSQL
database_runtime: Docker Compose
orm: Prisma
validation: Zod
media_storage: Cloudinary

current_phase: PHASE_8
current_task: P8-001
current_task_status: TODO

last_completed_task: P7-003
next_task: P8-001
```

## Why the roadmap is being rebased

An earlier roadmap allowed Prisma calls directly in services and did not define enough shared infrastructure.

That is no longer allowed.

Before continuing feature development, the AI must audit the code already created and rebase it onto the architecture in this document.

**DO NOT delete working code and restart blindly.**

`P2-R00` exists specifically to migrate the current partial implementation safely.

---

# 1. NON-NEGOTIABLE ENGINEERING RULES

These rules override older roadmap decisions.

## 1.1 Repository is mandatory for database-backed modules

**Service MUST NOT import Prisma directly.**

Forbidden:

```ts
// project.service.ts
import { prisma } from "../../database/prisma";

await prisma.project.findMany();
```

Required flow:

```text
Controller
   ↓
Service
   ↓
Repository
   ↓
Prisma
```

Example:

```ts
// project.service.ts
const projects = await projectRepository.findPublished(query);
```

```ts
// project.repository.ts
return prisma.project.findMany(...);
```

Repository is responsible for:

- Prisma queries
- persistence-specific includes/selects
- DB writes
- transaction-aware query functions

Service is responsible for:

- business rules
- authorization decisions
- ownership
- orchestration
- transactions across repository operations
- deciding what should happen, not how Prisma syntax works

Repositories should accept an optional Prisma transaction client when atomic workflows need it.

---

## 1.2 DTO + Mapper are mandatory at API boundaries

Never return raw Prisma models from controllers.

Flow:

```text
Repository model
   ↓
Service/domain result
   ↓
Mapper
   ↓
DTO
   ↓
Response helper
```

Mapper prevents leaking:

```text
passwordHash
refreshTokenHash
tokenHash
Cloudinary secret/internal data
private moderation data
database-only relations
```

---

## 1.3 Standard API Response is mandatory

Create shared reusable response utilities.

Recommended:

```text
src/common/responses/api-response.ts
```

Success envelope:

```json
{
  "success": true,
  "data": {},
  "meta": {}
}
```

Error envelope:

```json
{
  "success": false,
  "error": {
    "code": "SOME_ERROR",
    "message": "Human readable message",
    "details": []
  },
  "requestId": "..."
}
```

Reusable helpers:

```ts
sendSuccess()
sendCreated()
sendPaginated()
sendNoContent()
```

Controllers should not repeatedly construct response envelopes manually.

---

## 1.4 Central AppError is mandatory

Use:

```text
src/common/errors/AppError.ts
```

Each expected application error should have:

```text
HTTP status
machine-readable code
safe message
optional details
```

Do not leak Prisma errors or stack traces to clients.

---

## 1.5 Zod validation is mandatory

All request:

```text
body
params
query
```

must be validated through reusable middleware.

Recommended:

```text
src/common/validation/validate-request.ts
```

Routes call:

```ts
validateRequest({
  body: schema,
  params: schema,
  query: schema,
})
```

Do not cast unvalidated `req.body` and trust it.

---

# 2. ACTORS

There is ONE public identity model.

There is NO separate Admin table.

## Roles

```text
USER
ADMIN
```

## Status

```text
ACTIVE
BANNED
```

## Email state

Verification is represented separately:

```text
emailVerifiedAt: DateTime?
```

An account can be:

```text
ACTIVE + verified
ACTIVE + unverified
BANNED
```

Public registration can NEVER choose role or status.

---

# 3. PERMISSION MATRIX

| Feature | Guest | USER | ADMIN |
|---|---:|---:|---:|
| Read public Portfolio | ✅ | ✅ | ✅ |
| Read/search Projects | ✅ | ✅ | ✅ |
| Read Moments | ✅ | ✅ | ✅ |
| Register/Login | ✅ | ✅ | ✅ |
| Manage own sessions | ❌ | ✅ | ✅ |
| Update own profile | ❌ | ✅ | ✅ |
| Comment Project | ❌ | ✅ | ✅ |
| Edit/Delete own Project comment | ❌ | ✅ | ✅ |
| Like Moment | ❌ | ✅ | ✅ |
| Comment Moment | ❌ | ✅ | ✅ |
| Edit/Delete own Moment comment | ❌ | ✅ | ✅ |
| CRUD Categories | ❌ | ❌ | ✅ |
| CRUD Technologies | ❌ | ❌ | ✅ |
| CRUD Projects | ❌ | ❌ | ✅ |
| CRUD Moment Tags | ❌ | ❌ | ✅ |
| CRUD Moments | ❌ | ❌ | ✅ |
| Moderate all comments | ❌ | ❌ | ✅ |
| User moderation | ❌ | ❌ | ✅ |
| Dashboard | ❌ | ❌ | ✅ |

---

# 4. TARGET PROJECT STRUCTURE

```text
src/
├── app.ts
├── server.ts
│
├── config/
│   ├── env.ts
│   ├── logger.ts
│   └── cloudinary.ts
│
├── database/
│   ├── prisma.ts
│   └── transaction.ts
│
├── common/
│   ├── auth/
│   │   ├── cookie.ts
│   │   ├── jwt.ts
│   │   ├── password.ts
│   │   └── auth-context.ts
│   │
│   ├── errors/
│   │   └── AppError.ts
│   │
│   ├── responses/
│   │   └── api-response.ts
│   │
│   ├── validation/
│   │   └── validate-request.ts
│   │
│   ├── middleware/
│   │   ├── error-handler.ts
│   │   ├── not-found.ts
│   │   ├── request-id.ts
│   │   ├── authenticate.ts
│   │   ├── authorize.ts
│   │   ├── require-active-user.ts
│   │   ├── trusted-origin.ts
│   │   └── security.ts
│   │
│   ├── rate-limit/
│   │   ├── rate-limit.factory.ts
│   │   ├── global.rate-limit.ts
│   │   ├── auth.rate-limit.ts
│   │   └── interaction.rate-limit.ts
│   │
│   ├── mail/
│   │   ├── mailer.ts
│   │   ├── mail.types.ts
│   │   └── templates/
│   │       ├── verify-email.template.ts
│   │       └── reset-password.template.ts
│   │
│   ├── pagination/
│   │   └── pagination.ts
│   │
│   └── types/
│
└── modules/
    ├── health/
    │
    ├── auth/
    │   ├── auth.routes.ts
    │   ├── auth.controller.ts
    │   ├── auth.service.ts
    │   ├── auth.repository.ts
    │   ├── auth.schema.ts
    │   ├── auth.dto.ts
    │   ├── auth.mapper.ts
    │   ├── account-token.service.ts
    │   └── session.service.ts
    │
    ├── users/
    │   ├── user.routes.ts
    │   ├── user.controller.ts
    │   ├── user.service.ts
    │   ├── user.repository.ts
    │   ├── user.schema.ts
    │   ├── user.dto.ts
    │   └── user.mapper.ts
    │
    ├── categories/
    │   ├── category.routes.ts
    │   ├── category.controller.ts
    │   ├── category.service.ts
    │   ├── category.repository.ts
    │   ├── category.schema.ts
    │   ├── category.dto.ts
    │   └── category.mapper.ts
    │
    ├── technologies/
    ├── projects/
    ├── project-comments/
    ├── media/
    ├── moment-tags/
    ├── moments/
    ├── moment-likes/
    ├── moment-comments/
    └── admin/
```

## Module contract

Any database-backed feature module normally contains:

```text
routes
controller
service
repository
schema
dto
mapper
```

Do not create empty files just to satisfy naming.

But **Repository is required if the module reads/writes database data.**

---

# 5. LAYER RESPONSIBILITIES

## Route

Allowed:

```text
path
HTTP method
validation middleware
authentication middleware
authorization middleware
rate limit middleware
controller binding
```

Forbidden:

```text
Prisma
business logic
password hashing
response mapping
```

---

## Controller

Allowed:

```text
HTTP request extraction
authenticated context extraction
calling Service
cookie set/clear through shared cookie helper
response helper invocation
```

Forbidden:

```text
Prisma
business rules
ownership checks
complex data transformation
```

---

## Service

Allowed:

```text
business logic
workflow orchestration
authorization/ownership rules
calling repositories
calling mail/media helpers
opening transaction and passing tx to repositories
```

Forbidden:

```text
direct Prisma import
Express Request/Response
manual HTTP response
```

---

## Repository

Allowed:

```text
Prisma only
database query composition
select/include
create/update/delete
transaction-aware DB operations
```

Repository MUST NOT:

```text
send HTTP responses
decide HTTP status codes
contain Express objects
send mail
set cookie
```

---

## Schema

Zod request validation only.

---

## DTO

Stable API contract types.

---

## Mapper

Transforms DB/domain results into DTOs.

---

# 6. SHARED HTTP RESPONSE CONTRACT

Create:

```text
src/common/responses/api-response.ts
```

Required API:

```ts
sendSuccess(res, data, status?)
sendCreated(res, data)
sendPaginated(res, data, meta)
sendNoContent(res)
```

Recommended contracts:

```ts
type ApiSuccess<T> = {
  success: true;
  data: T;
  meta?: Record<string, unknown>;
};

type ApiFailure = {
  success: false;
  error: {
    code: string;
    message: string;
    details?: unknown;
  };
  requestId?: string;
};
```

All modules must reuse this.

---

# 7. SECURITY BASELINE

Security is FOUNDATION, not a final phase.

Required from the beginning:

```text
helmet
CORS allow-list
credentials: true
JSON body size limit
cookie-parser
request ID
global rate limit
auth-specific rate limits
trusted-origin protection
central error handler
```

## Global rate limit

Example starting policy:

```text
100–300 requests / 15 min / IP
```

Must be env-configurable.

Do not treat these exact numbers as immutable production tuning.

---

# 8. AUTH RATE LIMIT POLICY

At minimum provide separate limiters for:

```text
register
login
refresh
verify email
resend verification
forgot password
reset password
```

Suggested starting values:

```text
register:            5 / 15 min / IP
login:              10 / 15 min / IP
refresh:            60 / 15 min / IP
verify-email:       20 / 15 min / IP
resend-verification: 5 / 15 min / IP
forgot-password:     5 / 15 min / IP
reset-password:     10 / 15 min / IP
```

Comment/like endpoints also get interaction-specific rate limits later.

All values should be configurable or centralized.

Do NOT scatter `rateLimit({...})` objects throughout route files.

---

# 9. COOKIE + BROWSER CONTRACT

Refresh token must be stored in a browser **httpOnly cookie**.

Create:

```text
src/common/auth/cookie.ts
```

Required helpers:

```ts
getRefreshCookieOptions()
setRefreshCookie()
clearRefreshCookie()
```

Cookie baseline:

```ts
{
  httpOnly: true,
  secure: NODE_ENV === "production",
  sameSite: "lax",
  path: "/api/v1/auth",
  maxAge: REFRESH_TOKEN_TTL
}
```

If frontend/backend are intentionally deployed cross-site:

```text
SameSite=None
Secure=true
HTTPS required
```

Do not blindly use `SameSite=None` locally.

## Browser flow

### Login

```text
Browser
   ↓ POST /api/v1/auth/login
   ↓ credentials: "include"

API verifies credentials
   ↓
API creates refresh session
   ↓
API sends:
Set-Cookie: refresh_token=...; HttpOnly; ...

Browser stores cookie automatically
```

JavaScript must NOT read refresh token.

### Refresh

Frontend:

```ts
fetch("/api/v1/auth/refresh", {
  method: "POST",
  credentials: "include",
});
```

Browser automatically sends the httpOnly cookie.

### CORS

Backend MUST use:

```ts
cors({
  origin: allowedFrontendOrigin,
  credentials: true,
});
```

Do NOT use:

```text
Access-Control-Allow-Origin: *
```

with credential cookies.

### CSRF / trusted origin

Endpoints that rely on refresh cookies must enforce trusted Origin / Fetch Metadata policy.

At minimum:

```text
POST /auth/refresh
POST /auth/logout
POST /auth/logout-all
DELETE /auth/sessions/:id
```

should use trusted-origin protection.

---

# 10. PASSWORD + EMAIL SECURITY

Passwords:

```text
bcrypt or argon2
```

Never store plain passwords.

For this project, use one selected algorithm consistently.

Password-reset and email-verification tokens:

- cryptographically random
- raw token sent only to the user
- database stores only token hash
- token has expiry
- token is single-use
- token purpose is explicit

---

# 11. MAIL INFRASTRUCTURE

Portfolio auth includes real email workflows.

Use SMTP via Nodemailer or equivalent simple SMTP client.

Environment:

```env
SMTP_HOST=
SMTP_PORT=
SMTP_SECURE=
SMTP_USER=
SMTP_PASS=
MAIL_FROM=
FRONTEND_URL=
```

Required email templates:

```text
Email Verification
Password Reset
```

Mail errors must be handled safely.

Do not expose whether a forgot-password email exists in the database.

Forgot-password endpoint should return the same generic success response for existing/non-existing emails.

---

# 12. DATABASE — DOCKER COMPOSE

PostgreSQL MUST run through Docker Compose locally.

```text
docker-compose.yml
```

Service:

```text
postgres
```

Requirements:

- PostgreSQL 16+
- persistent named volume
- healthcheck
- configurable port
- env credentials

Example:

```yaml
ports:
  - "${POSTGRES_PORT:-5432}:5432"
```

Environment:

```env
POSTGRES_USER=minld
POSTGRES_PASSWORD=change-me
POSTGRES_DB=minld_pfl
POSTGRES_PORT=5432

DATABASE_URL=postgresql://minld:change-me@localhost:5432/minld_pfl?schema=public
```

Normal commands:

```bash
docker compose up -d
docker compose ps
docker compose logs -f postgres
docker compose down
```

Do not routinely use:

```bash
docker compose down -v
```

---

# 13. CORE AUTH DATABASE DESIGN

## User

```text
User
├── id UUID
├── email UNIQUE
├── displayName
├── avatarUrl?
├── emailVerifiedAt?
├── role USER | ADMIN
├── status ACTIVE | BANNED
├── lastLoginAt?
├── createdAt
└── updatedAt
```

## UserCredential

Keep authentication secrets separated from public profile data.

```text
UserCredential
├── userId PK/FK
├── passwordHash
├── passwordUpdatedAt
├── createdAt
└── updatedAt
```

Relation:

```text
User 1:1 UserCredential
```

## AuthSession

```text
AuthSession
├── id UUID
├── userId
├── familyId UUID
├── refreshTokenHash UNIQUE
├── expiresAt
├── revokedAt?
├── rotatedFromSessionId?
├── userAgent?
├── ipAddress?
├── createdAt
└── updatedAt
```

Purpose:

```text
refresh rotation
logout
logout all
list sessions
revoke individual session
reuse detection foundation
```

## AccountToken

```text
AccountToken
├── id UUID
├── userId
├── purpose
├── tokenHash UNIQUE
├── expiresAt
├── consumedAt?
├── createdAt
└── updatedAt
```

Purpose enum:

```text
EMAIL_VERIFICATION
PASSWORD_RESET
```

---

# 14. COMPLETE AUTH API CONTRACT

Phase 2 is NOT complete until these routes exist.

```http
POST   /api/v1/auth/register
POST   /api/v1/auth/verify-email
POST   /api/v1/auth/resend-verification

POST   /api/v1/auth/login
POST   /api/v1/auth/refresh
POST   /api/v1/auth/logout

POST   /api/v1/auth/forgot-password
POST   /api/v1/auth/reset-password
POST   /api/v1/auth/change-password

GET    /api/v1/auth/me

GET    /api/v1/auth/sessions
DELETE /api/v1/auth/sessions/:sessionId
POST   /api/v1/auth/logout-all
```

Auth routes should resemble:

```ts
authRouter.post(
  "/register",
  registerRateLimit,
  validateRequest({ body: registerSchema }),
  registerController,
);

authRouter.post(
  "/verify-email",
  verifyEmailRateLimit,
  validateRequest({ body: verifyEmailSchema }),
  verifyEmailController,
);

authRouter.post(
  "/resend-verification",
  resendVerificationRateLimit,
  validateRequest({ body: resendVerificationSchema }),
  resendVerificationController,
);

authRouter.post(
  "/login",
  loginRateLimit,
  validateRequest({ body: loginSchema }),
  loginController,
);

authRouter.post(
  "/refresh",
  refreshRateLimit,
  requireTrustedOrigin,
  refreshController,
);

authRouter.post(
  "/logout",
  requireTrustedOrigin,
  logoutController,
);

authRouter.post(
  "/forgot-password",
  forgotPasswordRateLimit,
  validateRequest({ body: forgotPasswordSchema }),
  forgotPasswordController,
);

authRouter.post(
  "/reset-password",
  resetPasswordRateLimit,
  validateRequest({ body: resetPasswordSchema }),
  resetPasswordController,
);

authRouter.post(
  "/change-password",
  requireAuth,
  requireActiveUser,
  validateRequest({ body: changePasswordSchema }),
  changePasswordController,
);

authRouter.get("/me", requireAuth, meController);

authRouter.get("/sessions", requireAuth, sessionsController);

authRouter.delete(
  "/sessions/:sessionId",
  requireAuth,
  requireTrustedOrigin,
  revokeSessionController,
);

authRouter.post(
  "/logout-all",
  requireAuth,
  requireTrustedOrigin,
  logoutAllController,
);
```

---

# 15. AUTH RESPONSE RULE

Login body returns only:

```json
{
  "success": true,
  "data": {
    "user": {
      "id": "...",
      "email": "...",
      "displayName": "...",
      "avatarUrl": null,
      "role": "USER",
      "status": "ACTIVE",
      "emailVerified": true
    },
    "accessToken": "..."
  }
}
```

Refresh token is **NOT in JSON**.

It is sent only via:

```text
Set-Cookie
```

The browser stores it.

---

# 16. PROJECT DOMAIN

## Category

```text
Category
id
name
slug unique
description?
createdAt
updatedAt
```

## Technology

```text
Technology
id
name
slug unique
type
icon?
createdAt
updatedAt
```

Type:

```text
LANGUAGE
FRAMEWORK
LIBRARY
DATABASE
TOOL
OTHER
```

## Project

```text
Project
id
title
slug unique
summary
content
thumbnailUrl?
thumbnailPublicId?
demoUrl?
githubUrl?
sourceUrl?
status
featured
year?
publishedAt?
createdAt
updatedAt
```

Relations:

```text
Project N:M Category
Project N:M Technology
```

Status:

```text
DRAFT
PUBLISHED
ARCHIVED
```

---

# 17. COMMENT DOMAIN

## ProjectComment

```text
ProjectComment
id
projectId
userId
content
status
createdAt
updatedAt
```

Status:

```text
VISIBLE
HIDDEN
```

User:

- creates authenticated comment
- updates own comment
- deletes own comment

Admin:

- hides/unhides
- deletes any

---

# 18. MOMENT / LOCKET DOMAIN

Backend domain name:

```text
Moment
```

Frontend can label it:

```text
Locket
```

Models:

```text
Moment
MomentImage
MomentTag
MomentLike
MomentComment
```

MomentLike unique:

```text
momentId + userId
```

Likes require login.

No anonymous Visitor ID.

---

# 19. INTERACTION RATE LIMITS

Do not wait until final security audit.

Required when the endpoints are created.

Suggested initial policies:

```text
Project comment create:
20 / 10 min / authenticated user + IP defense

Project comment update/delete:
60 / 10 min

Moment like toggle:
60 / 1 min

Moment comment create:
20 / 10 min

Admin uploads:
30 / 1 hour
```

Use shared limiter factory.

Keep policies centralized.

---

# 20. ROADMAP TRACKER

| Phase | Task | Description | Status |
|---|---|---|---|
| Rebase | P2-R00 | Audit & rebase current Phase 0–2 implementation | DONE |
| 0 | P0-001 | App skeleton + module boundaries | DONE |
| 0 | P0-002 | Shared Error + Response + Validation + Request ID | DONE |
| 0 | P0-003 | Security baseline + CORS + Cookie Parser + Rate Limit | DONE |
| 1 | P1-001 | PostgreSQL Docker Compose | DONE |
| 1 | P1-002 | Prisma User/Credential/Session/AccountToken schema | DONE |
| 1 | P1-003 | Repository foundation + transaction contract | DONE |
| 1 | P1-004 | SMTP Mail Infrastructure | DONE |
| 1 | P1-005 | Seed verified ADMIN user | DONE |
| 2 | P2-001 | Register + send verification email | DONE |
| 2 | P2-002 | Verify email + resend verification | DONE |
| 2 | P2-003 | Login + access JWT + refresh cookie | DONE |
| 2 | P2-004 | Refresh rotation + trusted origin | DONE |
| 2 | P2-005 | Logout + `/auth/me` | DONE |
| 2 | P2-006 | Forgot Password + Reset Password | DONE |
| 2 | P2-007 | Change Password | DONE |
| 2 | P2-008 | Sessions list + revoke + logout-all | DONE |
| 2 | P2-009 | Auth integration/security verification | DONE |
| 3 | P3-001 | User profile read/update | DONE |
| 3 | P3-002 | ADMIN role guard + banned-user interaction guard | DONE |
| 4 | P4-001 | Category CRUD with repository | DONE |
| 4 | P4-002 | Technology CRUD with repository | DONE |
| 5 | P5-001 | Project schema + relations | DONE |
| 5 | P5-002 | Admin Project CRUD | DONE |
| 5 | P5-003 | Public Project list/detail | DONE |
| 5 | P5-004 | Search/filter/pagination | DONE |
| 6 | P6-001 | Project comment create/list | DONE |
| 6 | P6-002 | Project comment ownership update/delete | DONE |
| 6 | P6-003 | Project comment admin moderation | DONE |
| 7 | P7-001 | Cloudinary/Multer media infrastructure | DONE |
| 7 | P7-002 | Project thumbnail lifecycle | DONE |
| 7 | P7-003 | User avatar lifecycle | DONE |
| 8 | P8-001 | Moment schema | TODO |
| 8 | P8-002 | MomentTag CRUD | TODO |
| 8 | P8-003 | Admin Moment CRUD | TODO |
| 8 | P8-004 | Multiple Moment image lifecycle | TODO |
| 8 | P8-005 | Public Moment feed/detail | TODO |
| 9 | P9-001 | Moment like/unlike | TODO |
| 9 | P9-002 | Moment comment create/list | TODO |
| 9 | P9-003 | Own Moment comment update/delete | TODO |
| 9 | P9-004 | Admin Moment comment moderation | TODO |
| 10 | P10-001 | Admin dashboard | TODO |
| 10 | P10-002 | Admin user list + ban/unban | TODO |
| 11 | P11-001 | Full integration test pass | TODO |
| 11 | P11-002 | Security/performance audit | TODO |

---

# 21. CURRENT REBASE TASK — P2-R00

This is the next task for the existing codebase.

## Prompt

```text
TASK P2-R00 — Audit & Rebase Existing Phase 0–2 Implementation

IMPORTANT:

Do NOT continue building new domain features.

The project was partially implemented using an older roadmap.
We are replacing that architecture contract with the current
MinLD.PFL_BACKEND_ROADMAP.md.

Read the entire roadmap first.

Then inspect ALL current backend files related to:

src/app.ts
src/server.ts

src/common/
src/config/
src/database/
src/modules/auth/
src/modules/users/ if present

prisma/schema.prisma
docker-compose.yml
.env.example
package.json

OBJECTIVE:

Determine which old Phase 0–2 work is reusable and migrate it onto
the new clean architecture without blindly deleting working code.

MANDATORY ARCHITECTURE:

Controller
 -> Service
 -> Repository
 -> Prisma

Service MUST NOT import Prisma.

Every DB-backed auth operation must use auth.repository.ts or an
appropriate repository.

Ensure shared reusable infrastructure exists:

src/common/errors/AppError.ts
src/common/responses/api-response.ts
src/common/validation/validate-request.ts
src/common/auth/cookie.ts
src/common/auth/jwt.ts
src/common/middleware/security.ts or equivalent
src/common/middleware/trusted-origin.ts
src/common/rate-limit/*
src/common/mail/*

AUTH MODULE TARGET:

auth.routes.ts
auth.controller.ts
auth.service.ts
auth.repository.ts
auth.schema.ts
auth.dto.ts
auth.mapper.ts

Supporting auth services may include:

account-token.service.ts
session.service.ts

VERIFY CURRENT ROUTES.

Phase 2 target routes are:

POST /api/v1/auth/register
POST /api/v1/auth/verify-email
POST /api/v1/auth/resend-verification
POST /api/v1/auth/login
POST /api/v1/auth/refresh
POST /api/v1/auth/logout
POST /api/v1/auth/forgot-password
POST /api/v1/auth/reset-password
POST /api/v1/auth/change-password
GET  /api/v1/auth/me
GET  /api/v1/auth/sessions
DELETE /api/v1/auth/sessions/:sessionId
POST /api/v1/auth/logout-all

DO NOT fake missing features as DONE.

SECURITY CHECK:

1. helmet exists
2. CORS uses explicit allowed origin(s)
3. CORS credentials=true
4. cookie-parser configured
5. JSON body size configured
6. global rate limiter exists
7. register limiter exists
8. login limiter exists
9. refresh limiter exists
10. verify-email limiter exists
11. resend-verification limiter exists
12. forgot-password limiter exists
13. reset-password limiter exists
14. trusted-origin protection exists for cookie-sensitive routes
15. central error handler exists
16. response helper exists
17. refresh token not returned in JSON
18. refresh token is httpOnly cookie
19. raw refresh token is not stored in database
20. raw verification/reset tokens are not stored in database

COOKIE CHECK:

Backend login must use a shared helper such as:

setRefreshCookie(res, refreshToken)

Refresh/logout must read refresh token from req.cookies.

Cookie must include:

httpOnly
secure production behavior
sameSite policy
path
maxAge

Document frontend/browser requirement:

fetch(..., { credentials: "include" })

or Axios:

withCredentials: true

DATABASE CHECK:

Target models:

User
UserCredential
AuthSession
AccountToken

Public ADMIN is represented by User.role=ADMIN.
No Admin table.

MAIL CHECK:

SMTP configuration exists.
Verification mail exists.
Password reset mail exists.

FORGOT PASSWORD:

Must not reveal whether email exists.

RESET PASSWORD:

Must:
- validate single-use token
- enforce expiry
- hash new password
- consume reset token
- revoke active sessions after successful password reset

CHANGE PASSWORD:

Must:
- require auth
- verify current password
- hash new password
- update passwordUpdatedAt
- revoke other sessions according to documented policy

SESSION MANAGEMENT:

Must support:
- list own sessions
- revoke own session
- logout all

RESPONSE CONTRACT:

All controllers must reuse shared response helper.

Do not hand-build inconsistent envelopes.

RATE LIMIT:

Use shared centralized limiters.

Do not create ad-hoc rateLimit objects inside controllers.

WORK ORDER:

A. Produce an audit report first.

Classify each required item:

PASS
PARTIAL
MISSING
BROKEN

B. Propose minimal migration steps.

C. Only after the audit section, implement the rebase.

D. Preserve compatible working code.

E. Add/fix automated tests.

VERIFICATION:

docker compose config
docker compose ps

prisma format
prisma validate

npm run lint
npm run typecheck
npm test
npm run build

Run/manual verify all implemented auth endpoints.

AT THE END:

Update this roadmap accurately.

For old tasks marked REVIEW_AFTER_REBASE:
- convert to DONE only if verified
- otherwise convert to TODO/BLOCKED

Do NOT mark the entire Phase 2 DONE if endpoints are still missing.

Set next_task to the first genuinely incomplete task.

STOP.
```

---

# 22. PHASE 0 TASKS — FOUNDATION

These prompts apply if P2-R00 finds the older implementation incomplete.

## P0-001 — App Skeleton

```text
Implement application/module skeleton only.

Create:

src/app.ts
src/server.ts
src/config
src/database
src/common
src/modules

Health module:

GET /api/v1/health
GET /api/v1/ready

/ready should verify database readiness only after DB phase exists.

Do not implement business domains.

Verify:
typecheck
build
health
```

---

## P0-002 — Shared HTTP Infrastructure

```text
Implement shared HTTP infrastructure.

Required:

AppError
api-response helper
request-id middleware
validation middleware
not-found middleware
error-handler middleware

api-response must provide:

sendSuccess
sendCreated
sendPaginated
sendNoContent

Standardize success/error response shape.

No module may invent a different response envelope.

Add tests for:
response helper
validation failure
not found
AppError
unexpected error
```

---

## P0-003 — Security Baseline

```text
Implement security baseline.

Required packages/config:

helmet
cors
cookie-parser
express-rate-limit

CORS:

explicit allowed origin
credentials=true

Body:

env-configurable JSON size limit

Rate limits:

global limiter
auth limiter factory

Trusted-origin middleware:

validate Origin / Sec-Fetch-Site for cookie-sensitive mutation endpoints.

Do NOT implement auth business logic yet.

Add env variables for security configuration.

Tests:
allowed CORS
denied CORS
rate limit behavior
trusted origin accepted/rejected
```

---

# 23. PHASE 1 — DATA & MAIL

## P1-001 — PostgreSQL Docker Compose

```text
Create PostgreSQL Docker Compose.

Service:
postgres

Requirements:

PostgreSQL 16+
named persistent volume
healthcheck
env credentials
configurable host port

Update .env.example.

Verify:

docker compose config
docker compose up -d
docker compose ps

Postgres must be healthy.
```

---

## P1-002 — Prisma Auth Schema

```text
Implement ONLY core auth persistence.

Enums:

UserRole:
USER
ADMIN

UserStatus:
ACTIVE
BANNED

AccountTokenPurpose:
EMAIL_VERIFICATION
PASSWORD_RESET

Models:

User
UserCredential
AuthSession
AccountToken

User:
id UUID
email unique
displayName
avatarUrl optional
emailVerifiedAt optional
role default USER
status default ACTIVE
lastLoginAt optional
timestamps

UserCredential:
userId unique/PK
passwordHash
passwordUpdatedAt
timestamps

AuthSession:
id UUID
userId
familyId
refreshTokenHash unique
expiresAt
revokedAt optional
rotatedFromSessionId optional
userAgent optional
ipAddress optional
timestamps

AccountToken:
id UUID
userId
purpose
tokenHash unique
expiresAt
consumedAt optional
timestamps

Add proper indexes.

Run migration.
```

---

## P1-003 — Repository Foundation

```text
Create repository policy and transaction support.

Create:

src/database/prisma.ts
src/database/transaction.ts

Auth repository:

src/modules/auth/auth.repository.ts

Move ALL Prisma calls used by auth out of Service.

Repository methods should support optional transaction client where needed.

Service must not import Prisma.

Add architecture verification/search:

There must be no:
import { prisma ... }
inside:
*.service.ts

unless explicitly documented exception is approved.

Test repository-backed auth flows.
```

---

## P1-004 — SMTP Mail Infrastructure

```text
Implement SMTP mail infrastructure.

Create:

src/common/mail/mailer.ts
src/common/mail/mail.types.ts

Templates:

verify-email.template.ts
reset-password.template.ts

Environment:

SMTP_HOST
SMTP_PORT
SMTP_SECURE
SMTP_USER
SMTP_PASS
MAIL_FROM
FRONTEND_URL

Required mail functions:

sendVerificationEmail(...)
sendPasswordResetEmail(...)

Do not expose SMTP errors/secrets to API clients.

Provide a test/dev strategy that does not accidentally send real mail.
```

---

## P1-005 — ADMIN Seed

```text
Seed portfolio owner as User(role=ADMIN).

ADMIN_EMAIL
ADMIN_PASSWORD
ADMIN_NAME

Create User + UserCredential atomically.

Admin seed must be:

ACTIVE
emailVerifiedAt set

Password hashed.

Idempotent.

Never create Admin table.
```

---

# 24. PHASE 2 — COMPLETE AUTH

## P2-001 — Register + Verification Email

```text
POST /api/v1/auth/register

Use:

registerRateLimit
Zod
repository
service
DTO
mapper
response helper

Input:

displayName
email
password

Never accept:

role
status
emailVerifiedAt

Create:

User(role USER)
UserCredential

Create EMAIL_VERIFICATION AccountToken.

Store only tokenHash.

Send raw token via verification email.

Do not create login session yet.

Response must not expose token in production.

Tests:
success
duplicate
role escalation
password validation
mail requested
token hash stored
response safe
```

---

## P2-002 — Verify + Resend Email

```text
POST /api/v1/auth/verify-email

Input:
token

Validate:
hash lookup
purpose
expiry
single-use

Set:
emailVerifiedAt

Consume token.

POST /api/v1/auth/resend-verification

Input:
email

Generic response.

Apply rate limit.

Invalidate/supersede old usable verification tokens according to documented policy.

Tests:
valid
invalid
expired
used
resend
rate limit
```

---

## P2-003 — Login + Browser Cookie

```text
POST /api/v1/auth/login

Use loginRateLimit.

Requirements:

verified email
ACTIVE/non-BANNED user
password verify
update lastLoginAt

Create session:
familyId
refreshTokenHash
expiry
userAgent
ipAddress

Issue:
access token in JSON
refresh token ONLY in httpOnly cookie

Controller:

setRefreshCookie(res, refreshToken)

Response:

sendSuccess(res, mappedAuthDto)

Security:

Cache-Control: no-store

Frontend contract must be documented:

fetch/axios credentials include.

Tests must assert:

Set-Cookie exists
HttpOnly exists
refresh token absent from JSON
session hash exists
```

---

## P2-004 — Refresh Rotation

```text
POST /api/v1/auth/refresh

Use:

refreshRateLimit
requireTrustedOrigin

Read token from:

req.cookies

Never request body refresh token as primary browser contract.

Validate:

token signature/format
token hash session lookup
not revoked
not expired

Rotate:
old session/token invalidated
new session/token issued
new refresh cookie set
new access token returned

Reuse of old token must fail.

Tests:
success
missing cookie
invalid
expired
revoked
rotation
reuse rejected
trusted origin
```

---

## P2-005 — Logout + Me

```text
POST /api/v1/auth/logout

Use trusted origin.

Read refresh cookie.
Revoke matching active session if present.
Clear cookie.

GET /api/v1/auth/me

Require access token authentication.

Return safe user DTO.

Tests:
logout
cookie cleared
refresh after logout fails
me valid
me missing/expired token
```

---

## P2-006 — Forgot + Reset Password

```text
POST /api/v1/auth/forgot-password

Use:
forgotPasswordRateLimit

Input:
email

Always generic success response.

If account exists:
create PASSWORD_RESET AccountToken
store hash only
send reset email

Do NOT leak account existence.

POST /api/v1/auth/reset-password

Use:
resetPasswordRateLimit

Input:
token
newPassword

Validate:
purpose
hash
expiry
single-use

Transaction:
update password hash
passwordUpdatedAt
consume token
revoke active sessions

After reset:
user must login again.

Tests:
existing email
non-existing same response
invalid token
expired
used
password changed
sessions revoked
```

---

## P2-007 — Change Password

```text
POST /api/v1/auth/change-password

Require:
requireAuth
requireActiveUser

Input:
currentPassword
newPassword

Verify current password.

Hash new password.

Update passwordUpdatedAt.

Revoke other sessions or all sessions according to documented policy.

If current session is preserved, document exactly why/how.

Tests:
correct current password
wrong password
new password policy
session policy
```

---

## P2-008 — Session Management

```text
GET /api/v1/auth/sessions

Require auth.

Return safe session DTO:

id
createdAt
expiresAt
userAgent
ipAddress or appropriately masked value
isCurrent

Do not expose refreshTokenHash.

DELETE /api/v1/auth/sessions/:sessionId

Require:
auth
trusted origin

User may revoke ONLY own session.

POST /api/v1/auth/logout-all

Require:
auth
trusted origin

Revoke all active sessions.

Clear current refresh cookie.

Tests:
list own only
revoke own
cannot revoke another user's session
logout all
```

---

## P2-009 — Auth Verification Gate

```text
Do NOT add new features.

Audit complete Phase 2.

All required auth routes must exist.

Check:

repository boundary
DTO/mapper
response helper
rate limits
CORS credentials
httpOnly cookie
trusted origin
mail
verification
forgot/reset
session management
no sensitive leakage

Run:
lint
typecheck
tests
build
Prisma validate

Manual/browser verification:

Register
Verify email
Login
Browser stores httpOnly refresh cookie
/auth/me with access token
Refresh with credentials include
Logout clears refresh cookie
Forgot password
Reset password
Login with new password
Sessions list/revoke/logout-all

Only then mark Phase 2 complete.
```

---

# 25. PHASE 3 — USER & AUTHORIZATION

## P3-001 — User Profile

```http
GET   /api/v1/users/me
PATCH /api/v1/users/me
```

Update allowed:

```text
displayName
```

Avatar is handled in media phase.

Use:

user.repository.ts
user.service.ts
user.mapper.ts
user.dto.ts
user.schema.ts
```

---

## P3-002 — Role + Active User Guards

```text
requireAuth
requireRole("ADMIN")
requireActiveUser
```

ADMIN endpoint must reject USER.

BANNED users:

may read public data
cannot comment
cannot like
cannot update profile interactions
```

---

# 26. PHASE 4 — CATEGORY / TECHNOLOGY

Every module uses:

```text
routes
controller
service
repository
schema
dto
mapper
```

## P4-001 Category

Admin CRUD:

```http
POST   /api/v1/admin/categories
GET    /api/v1/admin/categories
GET    /api/v1/admin/categories/:id
PATCH  /api/v1/admin/categories/:id
DELETE /api/v1/admin/categories/:id
```

Public:

```http
GET /api/v1/categories
```

---

## P4-002 Technology

Type:

```text
LANGUAGE
FRAMEWORK
LIBRARY
DATABASE
TOOL
OTHER
```

Admin CRUD + public list/filter.

```http
GET /api/v1/technologies?type=FRAMEWORK
```

---

# 27. PHASE 5 — PROJECT

## P5-001 Schema

Project status:

```text
DRAFT
PUBLISHED
ARCHIVED
```

Relations:

```text
Project N:M Category
Project N:M Technology
```

---

## P5-002 Admin CRUD

```http
POST   /api/v1/admin/projects
GET    /api/v1/admin/projects
GET    /api/v1/admin/projects/:id
PATCH  /api/v1/admin/projects/:id
DELETE /api/v1/admin/projects/:id
```

Service calls repositories only.

Relation changes use transaction.

---

## P5-003 Public

```http
GET /api/v1/projects
GET /api/v1/projects/:slug
```

Only PUBLISHED.

---

## P5-004 Search / Filter

```text
search
category
technology
technologyType
featured
year
page
limit
```

Use DB/Prisma filtering in Repository.

No JS in-memory filtering.

---

# 28. PHASE 6 — PROJECT COMMENTS

## Create/list

```http
GET  /api/v1/projects/:slug/comments
POST /api/v1/projects/:slug/comments
```

POST:

```text
requireAuth
requireActiveUser
projectCommentCreateRateLimit
```

Never accept userId from body.

## Own edit/delete

```http
PATCH  /api/v1/project-comments/:id
DELETE /api/v1/project-comments/:id
```

Ownership in Service.

## Admin moderation

```http
GET    /api/v1/admin/project-comments
PATCH  /api/v1/admin/project-comments/:id/status
DELETE /api/v1/admin/project-comments/:id
```

---

# 29. PHASE 7 — CLOUDINARY

## Media infrastructure

Shared Cloudinary adapter/service.

Multer memory storage.

Allow:

```text
jpeg
png
webp
```

Max size:

```text
5 MB default
```

Upload rate limit required.

## Project thumbnail

Upload/replace/delete with Cloudinary cleanup.

## User avatar

Authenticated user can upload/remove own avatar.

Database stores:

```text
avatarUrl
avatarPublicId if added to schema
```

---

# 30. PHASE 8 — MOMENT / LOCKET

Admin-only creation.

Models:

```text
Moment
MomentImage
MomentTag
```

Multiple images:

```text
1..10
```

Public:

```http
GET /api/v1/moments
GET /api/v1/moments/:id
```

Only PUBLISHED.

---

# 31. PHASE 9 — INTERACTIONS

## Like

```http
POST /api/v1/moments/:id/like
```

Authenticated + active.

Unique:

```text
momentId + userId
```

Rate limit required.

## Comments

```http
GET    /api/v1/moments/:id/comments
POST   /api/v1/moments/:id/comments
PATCH  /api/v1/moment-comments/:id
DELETE /api/v1/moment-comments/:id
```

Ownership enforced in Service.

Admin moderation separate.

---

# 32. PHASE 10 — ADMIN

Dashboard.

User list/search/filter.

Ban/unban.

Do NOT allow simple status endpoint to ban current authenticated ADMIN.

Do NOT allow role editing through generic user update.

---

# 33. PHASE 11 — FINAL QUALITY

Integration test all critical flows.

Security audit:

```text
auth
authorization
cookies
CSRF/trusted-origin
CORS
rate limit
mail token security
password reset
session rotation
ownership
Cloudinary
DTO leakage
repository boundary
transactions
indexes
pagination
N+1
Docker
environment secrets
```

---

# 34. TARGET ENVIRONMENT

```env
NODE_ENV=development
PORT=4000

FRONTEND_URL=http://localhost:5173
CORS_ORIGIN=http://localhost:5173

JSON_BODY_LIMIT=1mb

RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX=200

POSTGRES_USER=minld
POSTGRES_PASSWORD=change-me
POSTGRES_DB=minld_pfl
POSTGRES_PORT=5432

DATABASE_URL=postgresql://minld:change-me@localhost:5432/minld_pfl?schema=public

ACCESS_TOKEN_SECRET=
REFRESH_TOKEN_SECRET=
ACCESS_TOKEN_TTL_MINUTES=15
REFRESH_TOKEN_TTL_DAYS=7

REFRESH_TOKEN_COOKIE_NAME=minld_pfl_refresh
COOKIE_SECURE=false

ADMIN_EMAIL=
ADMIN_PASSWORD=
ADMIN_NAME=

SMTP_HOST=
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=
SMTP_PASS=
MAIL_FROM="MinLD.PFL <no-reply@example.com>"

CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=
```

Never commit real secrets.

---

# 35. ARCHITECTURE ACCEPTANCE CHECKLIST

Before any phase is marked DONE:

- [x] No Service imports Prisma directly.
- [x] DB-backed module has Repository.
- [x] Controller is thin.
- [x] Zod validation exists.
- [x] DTO exists where response contract is non-trivial.
- [x] Mapper prevents raw DB leakage.
- [x] Shared response helper is used.
- [x] Expected errors use AppError.
- [x] Relevant rate limiter is attached.
- [x] Auth/role/ownership guard is correct.
- [x] Tests exist.
- [x] Typecheck passes.
- [x] Build passes.
- [x] Lint passes if configured.

---

# 36. AUTH ACCEPTANCE CHECKLIST

Phase 2 cannot be marked complete until ALL pass:

- [x] Register.
- [x] Verification email sent.
- [x] Verify email.
- [x] Resend verification.
- [x] Login.
- [x] Access token returned.
- [x] Refresh token NOT returned in JSON.
- [x] Refresh token set via httpOnly cookie.
- [x] CORS credentials enabled.
- [x] Frontend cookie contract documented.
- [x] Refresh rotation.
- [x] Trusted-origin guard.
- [x] Logout.
- [x] `/auth/me`.
- [x] Forgot password.
- [x] Reset password.
- [x] Reset token hash-only.
- [x] Password reset revokes sessions.
- [x] Change password.
- [x] Session list.
- [x] Revoke session.
- [x] Logout all.
- [x] Login rate limit.
- [x] Refresh rate limit.
- [x] Verify rate limit.
- [x] Forgot/reset rate limits.
- [x] Repository boundary verified.
- [x] DTO/mapper verified.
- [x] Response helper used.
- [ ] No auth secret leakage.

---

# 37. TASK COMPLETION LOG FORMAT

Append; never overwrite history.

```markdown
## YYYY-MM-DD — TASK-ID — Task Name

Status: DONE

### Scope
...

### Architecture
- Controller:
- Service:
- Repository:
- Schema:
- DTO:
- Mapper:

### Files Created
- ...

### Files Modified
- ...

### Database
- models:
- migration:

### Endpoints
- METHOD /path

### Security
- authentication:
- authorization:
- rate limit:
- cookie:
- trusted origin:

### Tests
- ...

### Commands
- ...

### Verification
- docker: PASS/N/A
- prisma: PASS/N/A
- lint: PASS
- typecheck: PASS
- tests: PASS
- build: PASS
- manual/browser: PASS/N/A

### Remaining Issues
- None

### Roadmap Update
last_completed_task:
next_task:
```

---

# 38. TASK COMPLETION HISTORY

## 2026-08-12 — P2-R00..P3-002 — Rebase Through Phase 3

Status: DONE

### Scope
Rebased the existing partial backend to the revised clean modular monolith roadmap and completed implementation through Phase 3.

### Architecture
- Controller: thin controllers call services and shared response helper.
- Service: business logic only; no Prisma imports from service files.
- Repository: database-backed auth, users, and health readiness use repositories.
- Schema: Zod validation for auth and user profile mutation inputs.
- DTO: safe auth/user/session DTOs.
- Mapper: raw DB fields such as password/token hashes are not exposed.

### Files Created
- `api/src/common/auth/*`
- `api/src/common/mail/*`
- `api/src/common/middleware/*`
- `api/src/common/rate-limit/*`
- `api/src/common/responses/api-response.ts`
- `api/src/common/validation/validate-request.ts`
- `api/src/database/transaction.ts`
- `api/src/modules/auth/auth.repository.ts`
- `api/src/modules/users/*`
- `api/prisma/migrations/20260812010000_auth_rebase/migration.sql`
- `api/prisma/migrations/20260812010100_align_auth_schema/migration.sql`

### Files Modified
- `api/MinLD.PFL_BACKEND_ROADMAP.md`
- `api/.env.example`
- `api/README.md`
- `api/package.json`
- `api/package-lock.json`
- `api/prisma/schema.prisma`
- `api/prisma/seed.ts`
- `api/src/app.ts`
- `api/src/config/env.ts`
- `api/src/modules/auth/*`
- `api/src/modules/health/*`

### Database
- models: `User`, `UserCredential`, `AuthSession`, `AccountToken`
- migration: `20260812010000_auth_rebase`, `20260812010100_align_auth_schema`

### Endpoints
- `GET /api/v1/health`
- `GET /api/v1/ready`
- `POST /api/v1/auth/register`
- `POST /api/v1/auth/verify-email`
- `POST /api/v1/auth/resend-verification`
- `POST /api/v1/auth/login`
- `POST /api/v1/auth/refresh`
- `POST /api/v1/auth/logout`
- `POST /api/v1/auth/forgot-password`
- `POST /api/v1/auth/reset-password`
- `POST /api/v1/auth/change-password`
- `GET /api/v1/auth/me`
- `GET /api/v1/auth/sessions`
- `DELETE /api/v1/auth/sessions/:sessionId`
- `POST /api/v1/auth/logout-all`
- `GET /api/v1/users/me`
- `PATCH /api/v1/users/me`

### Security
- authentication: JWT access token + httpOnly refresh cookie.
- authorization: `requireAuth`, `requireRole`, `requireActiveUser`.
- rate limit: global + auth-specific centralized limiters.
- cookie: shared refresh cookie helper, no refresh token in JSON.
- trusted origin: refresh/logout/session mutation endpoints protected.

### Tests
- 7 test files, 23 tests covering response, validation, security, auth, sessions, profile, guards, health.

### Commands
- `docker compose config`
- `docker compose ps`
- `npm run prisma:format`
- `npm run prisma:validate`
- `npx prisma migrate deploy`
- `npm run prisma:generate`
- `npm run prisma:seed` twice
- `npm run typecheck`
- `npm test`
- `npm run build`
- manual/browser API smoke for register, verify, login, me, refresh, forgot/reset, change password, sessions, logout-all, logout

### Verification
- docker: PASS
- prisma: PASS
- lint: N/A, no script configured
- typecheck: PASS
- tests: PASS
- build: PASS
- manual/browser: PASS

### Remaining Issues
- None

### Roadmap Update
last_completed_task: P3-002
next_task: P4-001

## 2026-08-12 — P4-001 — Category CRUD with repository

Status: DONE

### Scope
Implemented Category CRUD with repository boundary, admin-only mutation/read routes, and public category listing.

### Architecture
- Controller: `category.controller.ts` uses shared response helpers only.
- Service: `category.service.ts` handles uniqueness/not-found rules; no Prisma import.
- Repository: `category.repository.ts` owns all Prisma calls.
- Schema: `category.schema.ts` validates UUID params and create/update body.
- DTO: `CategoryDto` provides stable API shape.
- Mapper: `toCategoryDto` converts database model to safe response DTO.

### Files Created
- `api/prisma/migrations/20260812020000_add_category/migration.sql`
- `api/src/modules/categories/category.controller.ts`
- `api/src/modules/categories/category.dto.ts`
- `api/src/modules/categories/category.mapper.ts`
- `api/src/modules/categories/category.repository.ts`
- `api/src/modules/categories/category.routes.test.ts`
- `api/src/modules/categories/category.routes.ts`
- `api/src/modules/categories/category.schema.ts`
- `api/src/modules/categories/category.service.ts`

### Files Modified
- `api/MinLD.PFL_BACKEND_ROADMAP.md`
- `api/prisma/schema.prisma`
- `api/src/app.ts`

### Database
- models: `Category`
- migration: `20260812020000_add_category`

### Endpoints
- `POST /api/v1/admin/categories`
- `GET /api/v1/admin/categories`
- `GET /api/v1/admin/categories/:id`
- `PATCH /api/v1/admin/categories/:id`
- `DELETE /api/v1/admin/categories/:id`
- `GET /api/v1/categories`

### Security
- authentication: admin routes require access JWT.
- authorization: admin routes require `ADMIN` role and active user.
- rate limit: global limiter applies.
- cookie: N/A
- trusted origin: N/A

### Tests
- Admin create/list/get/update/delete.
- Public list.
- Missing token and USER role rejection.
- Validation and uniqueness conflicts.

### Commands
- `docker compose ps`
- `npm run prisma:format`
- `npm run prisma:validate`
- `npx prisma migrate deploy`
- `npm run prisma:generate`
- `npm run typecheck`
- `npm test`
- `npm run build`
- `npx prisma migrate status`
- service Prisma import audit with `rg`

### Verification
- docker: PASS
- prisma: PASS
- lint: N/A, no script configured
- typecheck: PASS
- tests: PASS
- build: PASS
- manual/browser: N/A

### Remaining Issues
- None

### Roadmap Update
last_completed_task: P4-001
next_task: P4-002

## 2026-08-12 — P4-002 — Technology CRUD with repository

Status: DONE

### Scope
Implemented Technology CRUD with repository boundary, admin-only mutation/read routes, and public technology listing with type filter.

### Architecture
- Controller: `technology.controller.ts` uses shared response helpers only.
- Service: `technology.service.ts` handles uniqueness/not-found rules; no Prisma import.
- Repository: `technology.repository.ts` owns all Prisma calls.
- Schema: `technology.schema.ts` validates UUID params, body, and `type` query.
- DTO: `TechnologyDto` provides stable API shape.
- Mapper: `toTechnologyDto` converts database model to safe response DTO.

### Files Created
- `api/prisma/migrations/20260812030000_add_technology/migration.sql`
- `api/src/modules/technologies/technology.controller.ts`
- `api/src/modules/technologies/technology.dto.ts`
- `api/src/modules/technologies/technology.mapper.ts`
- `api/src/modules/technologies/technology.repository.ts`
- `api/src/modules/technologies/technology.routes.test.ts`
- `api/src/modules/technologies/technology.routes.ts`
- `api/src/modules/technologies/technology.schema.ts`
- `api/src/modules/technologies/technology.service.ts`

### Files Modified
- `api/MinLD.PFL_BACKEND_ROADMAP.md`
- `api/prisma/schema.prisma`
- `api/src/app.ts`
- `api/src/common/validation/validate-request.ts`

### Database
- models: `Technology`
- enum: `TechnologyType`
- migration: `20260812030000_add_technology`

### Endpoints
- `POST /api/v1/admin/technologies`
- `GET /api/v1/admin/technologies`
- `GET /api/v1/admin/technologies/:id`
- `PATCH /api/v1/admin/technologies/:id`
- `DELETE /api/v1/admin/technologies/:id`
- `GET /api/v1/technologies?type=FRAMEWORK`

### Security
- authentication: admin routes require access JWT.
- authorization: admin routes require `ADMIN` role and active user.
- rate limit: global limiter applies.
- cookie: N/A
- trusted origin: N/A

### Tests
- Admin create/list/get/update/delete.
- Public list and `type` filter.
- Missing token and USER role rejection.
- Validation and uniqueness conflicts.

### Commands
- `npm run prisma:format`
- `npm run prisma:validate`
- `npx prisma migrate deploy`
- `npm run prisma:generate`
- `npm run typecheck`
- `npm test`
- `npm run build`
- `npx prisma migrate status`
- service Prisma import audit with `rg`

### Verification
- docker: PASS
- prisma: PASS
- lint: N/A, no script configured
- typecheck: PASS
- tests: PASS
- build: PASS
- manual/browser: N/A

### Remaining Issues
- None

### Roadmap Update
last_completed_task: P4-002
next_task: P5-001

## 2026-08-12 — P5-001 — Project schema + relations

Status: DONE

### Scope
Implemented Project database schema with status enum and category/technology many-to-many relations.

### Architecture
- Schema: Prisma model only for this task; no service/controller surface added.
- Relations: implicit Prisma many-to-many joins connect projects to categories and technologies.

### Files Created
- `api/prisma/migrations/20260812040000_add_project/migration.sql`

### Files Modified
- `api/MinLD.PFL_BACKEND_ROADMAP.md`
- `api/prisma/schema.prisma`

### Database
- models: `Project`
- enum: `ProjectStatus`
- relations: `Project` N:M `Category`, `Project` N:M `Technology`
- migration: `20260812040000_add_project`

### Endpoints
- N/A

### Security
- authentication: N/A
- authorization: N/A
- rate limit: N/A
- cookie: N/A
- trusted origin: N/A

### Tests
- Existing integration suite remains passing.

### Commands
- `npm run prisma:format`
- `npm run prisma:validate`
- `npx prisma migrate deploy`
- `npm run prisma:generate`
- `npm run typecheck`
- `npm test`
- `npm run build`
- `npx prisma migrate status`
- service Prisma import audit with `rg`

### Verification
- docker: PASS
- prisma: PASS
- lint: N/A, no script configured
- typecheck: PASS
- tests: PASS
- build: PASS
- manual/browser: N/A

### Remaining Issues
- None

### Roadmap Update
last_completed_task: P5-001
next_task: P5-002

## 2026-08-12 — P5-002 — Admin Project CRUD

Status: DONE

### Scope
Implemented admin Project CRUD with repository boundary and transactional relation updates.

### Architecture
- Controller: `project.controller.ts` uses shared response helpers only.
- Service: `project.service.ts` handles uniqueness, not-found, relation validation, and transactions; no Prisma import.
- Repository: `project.repository.ts` owns all Prisma calls and relation connect/set writes.
- Schema: `project.schema.ts` validates UUID params, create/update body, URLs, enum, dates, and relation IDs.
- DTO: `ProjectDto` provides stable API shape with category and technology DTOs.
- Mapper: `toProjectDto` converts database model to safe response DTO.

### Files Created
- `api/src/modules/projects/project.controller.ts`
- `api/src/modules/projects/project.dto.ts`
- `api/src/modules/projects/project.mapper.ts`
- `api/src/modules/projects/project.repository.ts`
- `api/src/modules/projects/project.routes.test.ts`
- `api/src/modules/projects/project.routes.ts`
- `api/src/modules/projects/project.schema.ts`
- `api/src/modules/projects/project.service.ts`

### Files Modified
- `api/MinLD.PFL_BACKEND_ROADMAP.md`
- `api/src/app.ts`

### Database
- models: existing `Project`, `Category`, `Technology`
- relations: create/update uses transaction for project relation writes.
- migration: N/A

### Endpoints
- `POST /api/v1/admin/projects`
- `GET /api/v1/admin/projects`
- `GET /api/v1/admin/projects/:id`
- `PATCH /api/v1/admin/projects/:id`
- `DELETE /api/v1/admin/projects/:id`

### Security
- authentication: admin routes require access JWT.
- authorization: admin routes require `ADMIN` role and active user.
- rate limit: global limiter applies.
- cookie: N/A
- trusted origin: N/A

### Tests
- Admin create/list/get/update/delete.
- Category and technology relation create/update.
- Missing token and USER role rejection.
- Validation, duplicate slug, and missing relation checks.

### Commands
- `npm run prisma:format`
- `npm run prisma:validate`
- `npx prisma migrate status`
- `npm run prisma:generate`
- `npm run typecheck`
- `npm test`
- `npm run build`
- service Prisma import audit with `rg`

### Verification
- docker: PASS
- prisma: PASS
- lint: N/A, no script configured
- typecheck: PASS
- tests: PASS
- build: PASS
- manual/browser: N/A

### Remaining Issues
- None

### Roadmap Update
last_completed_task: P5-002
next_task: P5-003

## 2026-08-12 — P5-003 — Public Project list/detail

Status: DONE

### Scope
Implemented public Project list/detail routes that expose only published projects.

### Architecture
- Controller: public handlers use shared response helpers only.
- Service: public logic lives in `project.service.ts`; no Prisma import.
- Repository: public DB filtering by `PUBLISHED` happens in `project.repository.ts`.
- Schema: slug params validated with Zod.
- DTO: public routes reuse safe `ProjectDto` mapping.

### Files Created
- N/A

### Files Modified
- `api/MinLD.PFL_BACKEND_ROADMAP.md`
- `api/src/app.ts`
- `api/src/modules/projects/project.controller.ts`
- `api/src/modules/projects/project.repository.ts`
- `api/src/modules/projects/project.routes.test.ts`
- `api/src/modules/projects/project.routes.ts`
- `api/src/modules/projects/project.schema.ts`
- `api/src/modules/projects/project.service.ts`

### Database
- models: existing `Project`
- migration: N/A

### Endpoints
- `GET /api/v1/projects`
- `GET /api/v1/projects/:slug`

### Security
- authentication: N/A
- authorization: only `PUBLISHED` projects are returned.
- rate limit: global limiter applies.
- cookie: N/A
- trusted origin: N/A

### Tests
- Public list includes published projects.
- Public list excludes drafts.
- Public detail returns published project by slug.
- Public detail rejects draft/malformed slug.

### Commands
- `npm run typecheck`
- `npm test`
- `npm run build`
- service Prisma import audit with `rg`

### Verification
- docker: PASS
- prisma: N/A
- lint: N/A, no script configured
- typecheck: PASS
- tests: PASS
- build: PASS
- manual/browser: N/A

### Remaining Issues
- None

### Roadmap Update
last_completed_task: P5-003
next_task: P5-004

## 2026-08-12 — P5-004 — Search/filter/pagination

Status: DONE

### Scope
Implemented public Project search/filter/pagination using Prisma DB filters.

### Architecture
- Controller: uses `sendPaginated` for public list responses.
- Service: passes validated filters to repository; no Prisma import.
- Repository: applies DB-side filters for search, category, technology, technology type, featured, year, page, and limit.
- Schema: validates and coerces query params with Zod.

### Files Created
- N/A

### Files Modified
- `api/MinLD.PFL_BACKEND_ROADMAP.md`
- `api/src/modules/projects/project.controller.ts`
- `api/src/modules/projects/project.repository.ts`
- `api/src/modules/projects/project.routes.test.ts`
- `api/src/modules/projects/project.routes.ts`
- `api/src/modules/projects/project.schema.ts`
- `api/src/modules/projects/project.service.ts`

### Database
- models: existing `Project`, `Category`, `Technology`
- migration: N/A

### Endpoints
- `GET /api/v1/projects?search=&category=&technology=&technologyType=&featured=&year=&page=&limit=`

### Security
- authentication: N/A
- authorization: only `PUBLISHED` projects are returned.
- rate limit: global limiter applies.
- cookie: N/A
- trusted origin: N/A

### Tests
- Search filter.
- Category slug filter.
- Technology slug filter.
- Technology type filter.
- Featured/year filters.
- Page/limit metadata.
- Invalid enum rejection.

### Commands
- `npm run typecheck`
- `npm test`
- `npm run build`
- service Prisma import audit with `rg`

### Verification
- docker: PASS
- prisma: N/A
- lint: N/A, no script configured
- typecheck: PASS
- tests: PASS
- build: PASS
- manual/browser: N/A

### Remaining Issues
- None

### Roadmap Update
last_completed_task: P5-004
next_task: P6-001

## 2026-08-12 — P6-001 — Project comment create/list

Status: DONE

### Scope
Implemented ProjectComment schema plus public visible-comment listing and authenticated comment creation.

### Architecture
- Controller: `project-comment.controller.ts` uses shared response helpers only.
- Service: validates published project by slug and never accepts `userId` from body; no Prisma import.
- Repository: `project-comment.repository.ts` owns all Prisma calls.
- Schema: Zod validates slug params and comment content.
- DTO: `ProjectCommentDto` exposes safe comment/user fields.
- Mapper: `toProjectCommentDto` converts DB result to DTO.

### Files Created
- `api/prisma/migrations/20260812050000_add_project_comment/migration.sql`
- `api/src/common/rate-limit/project-comment.rate-limit.ts`
- `api/src/modules/project-comments/project-comment.controller.ts`
- `api/src/modules/project-comments/project-comment.dto.ts`
- `api/src/modules/project-comments/project-comment.mapper.ts`
- `api/src/modules/project-comments/project-comment.repository.ts`
- `api/src/modules/project-comments/project-comment.routes.test.ts`
- `api/src/modules/project-comments/project-comment.routes.ts`
- `api/src/modules/project-comments/project-comment.schema.ts`
- `api/src/modules/project-comments/project-comment.service.ts`

### Files Modified
- `api/MinLD.PFL_BACKEND_ROADMAP.md`
- `api/prisma/schema.prisma`
- `api/src/app.ts`

### Database
- models: `ProjectComment`
- enum: `ProjectCommentStatus`
- migration: `20260812050000_add_project_comment`

### Endpoints
- `GET /api/v1/projects/:slug/comments`
- `POST /api/v1/projects/:slug/comments`

### Security
- authentication: create requires access JWT.
- authorization: create requires active user; only published projects accept comments; hidden comments excluded from list.
- rate limit: `projectCommentCreateRateLimit` applies to create.
- cookie: N/A
- trusted origin: N/A

### Tests
- Authenticated active user creates comment.
- Visible comments list by published project.
- Hidden comments excluded.
- Missing token, invalid body, and draft project rejected.

### Commands
- `npm run prisma:format`
- `npm run prisma:validate`
- `npx prisma migrate deploy`
- `npm run prisma:generate`
- `npm run typecheck`
- `npm test`
- `npm run build`
- `npx prisma migrate status`
- service Prisma import audit with `rg`

### Verification
- docker: PASS
- prisma: PASS
- lint: N/A, no script configured
- typecheck: PASS
- tests: PASS
- build: PASS
- manual/browser: N/A

### Remaining Issues
- None

### Roadmap Update
last_completed_task: P6-001
next_task: P6-002

## 2026-08-12 — P6-002 — Project comment ownership update/delete

Status: DONE

### Scope
Implemented authenticated owner update/delete for project comments.

### Architecture
- Controller: update/delete handlers use shared response helpers.
- Service: ownership enforced before mutation; no Prisma import.
- Repository: `findById`, `update`, and `delete` own Prisma calls.
- Schema: Zod validates comment UUID params and content body.

### Files Created
- N/A

### Files Modified
- `api/MinLD.PFL_BACKEND_ROADMAP.md`
- `api/src/modules/project-comments/project-comment.controller.ts`
- `api/src/modules/project-comments/project-comment.repository.ts`
- `api/src/modules/project-comments/project-comment.routes.test.ts`
- `api/src/modules/project-comments/project-comment.routes.ts`
- `api/src/modules/project-comments/project-comment.schema.ts`
- `api/src/modules/project-comments/project-comment.service.ts`

### Database
- models: existing `ProjectComment`
- migration: N/A

### Endpoints
- `PATCH /api/v1/project-comments/:id`
- `DELETE /api/v1/project-comments/:id`

### Security
- authentication: access JWT required.
- authorization: active user required; owner-only mutations.
- rate limit: global limiter applies.
- cookie: N/A
- trusted origin: N/A

### Tests
- Owner can update comment.
- Owner can delete comment.
- Non-owner receives 403.
- Missing comment receives 404.

### Commands
- `npm run typecheck`
- `npm test`
- `npm run build`
- service Prisma import audit with `rg`

### Verification
- docker: PASS
- prisma: N/A
- lint: N/A, no script configured
- typecheck: PASS
- tests: PASS
- build: PASS
- manual/browser: N/A

### Remaining Issues
- None

### Roadmap Update
last_completed_task: P6-002
next_task: P6-003

## 2026-08-12 — P6-003 — Project comment admin moderation

Status: DONE

### Scope
Implemented admin project comment listing, hide/unhide, and deletion.

### Architecture
- Controller: admin handlers use shared response helpers.
- Service: moderation uses repository only; no Prisma import.
- Repository: admin list/status/delete Prisma calls stay in repository.
- Schema: Zod validates comment UUID params and status enum.

### Files Created
- N/A

### Files Modified
- `api/MinLD.PFL_BACKEND_ROADMAP.md`
- `api/src/app.ts`
- `api/src/modules/project-comments/project-comment.controller.ts`
- `api/src/modules/project-comments/project-comment.repository.ts`
- `api/src/modules/project-comments/project-comment.routes.test.ts`
- `api/src/modules/project-comments/project-comment.routes.ts`
- `api/src/modules/project-comments/project-comment.schema.ts`
- `api/src/modules/project-comments/project-comment.service.ts`

### Database
- models: existing `ProjectComment`
- migration: N/A

### Endpoints
- `GET /api/v1/admin/project-comments`
- `PATCH /api/v1/admin/project-comments/:id/status`
- `DELETE /api/v1/admin/project-comments/:id`

### Security
- authentication: access JWT required.
- authorization: active `ADMIN` required.
- rate limit: global limiter applies.
- cookie: N/A
- trusted origin: N/A

### Tests
- ADMIN lists comments.
- ADMIN hides comments.
- ADMIN deletes comments.
- USER role rejected.
- Invalid status rejected.

### Commands
- `npm run typecheck`
- `npm test`
- `npm run build`
- service Prisma import audit with `rg`

### Verification
- docker: PASS
- prisma: N/A
- lint: N/A, no script configured
- typecheck: PASS
- tests: PASS
- build: PASS
- manual/browser: N/A

### Remaining Issues
- None

### Roadmap Update
last_completed_task: P6-003
next_task: P7-001

## 2026-08-12 — P7-001 — Cloudinary/Multer media infrastructure

Status: DONE

### Scope
Implemented shared Cloudinary adapter, Multer memory image upload middleware, media service, and admin upload rate limit.

### Architecture
- Adapter: `cloudinary.adapter.ts` owns Cloudinary SDK calls and safe output mapping.
- Middleware: `upload.middleware.ts` uses Multer memory storage with jpeg/png/webp allow-list and 5 MB default limit.
- Service: `media.service.ts` exposes upload/delete operations for feature modules.
- Rate limit: `adminUploadRateLimit` centralizes admin upload policy.
- Error handling: media validation and Multer file-size errors use standard error envelope.

### Files Created
- `api/src/common/media/cloudinary.adapter.ts`
- `api/src/common/media/media.errors.ts`
- `api/src/common/media/media.service.ts`
- `api/src/common/media/upload.middleware.test.ts`
- `api/src/common/media/upload.middleware.ts`
- `api/src/common/rate-limit/upload.rate-limit.ts`

### Files Modified
- `api/MinLD.PFL_BACKEND_ROADMAP.md`
- `api/.env.example`
- `api/package.json`
- `api/package-lock.json`
- `api/src/common/middleware/error-handler.ts`
- `api/src/config/env.ts`

### Database
- migration: N/A

### Endpoints
- N/A

### Security
- authentication: N/A
- authorization: N/A
- rate limit: `adminUploadRateLimit` available for upload routes.
- cookie: N/A
- trusted origin: N/A

### Tests
- Image upload middleware accepts png in memory.
- Unsupported media type rejected.
- Missing Cloudinary config rejected safely.

### Commands
- `npm install cloudinary multer @types/multer`
- `npm run typecheck`
- `npm test`
- `npm run build`
- service Prisma import audit with `rg`

### Verification
- docker: PASS
- prisma: N/A
- lint: N/A, no script configured
- typecheck: PASS
- tests: PASS
- build: PASS
- manual/browser: N/A

### Remaining Issues
- None

### Roadmap Update
last_completed_task: P7-001
next_task: P7-002

## 2026-08-12 — P7-002 — Project thumbnail lifecycle

Status: DONE

### Scope
Implemented admin project thumbnail upload/replace/delete with Cloudinary cleanup.

### Architecture
- Controller: thumbnail handlers use shared response helpers.
- Service: upload/replace/delete orchestration and cleanup live in `project.service.ts`; no Prisma import.
- Repository: thumbnail DB writes stay in `project.repository.ts`.
- Middleware: route uses Multer image memory upload and admin upload rate limit.

### Files Created
- N/A

### Files Modified
- `api/MinLD.PFL_BACKEND_ROADMAP.md`
- `api/src/modules/projects/project.controller.ts`
- `api/src/modules/projects/project.repository.ts`
- `api/src/modules/projects/project.routes.test.ts`
- `api/src/modules/projects/project.routes.ts`
- `api/src/modules/projects/project.service.ts`

### Database
- models: existing `Project.thumbnailUrl`, `Project.thumbnailPublicId`
- migration: N/A

### Endpoints
- `POST /api/v1/admin/projects/:id/thumbnail`
- `DELETE /api/v1/admin/projects/:id/thumbnail`

### Security
- authentication: access JWT required.
- authorization: active `ADMIN` required.
- rate limit: `adminUploadRateLimit` on upload.
- cookie: N/A
- trusted origin: N/A

### Tests
- ADMIN replaces thumbnail.
- Old Cloudinary asset cleaned after replacement.
- ADMIN deletes thumbnail.
- New Cloudinary asset cleaned if DB update fails path is coded.

### Commands
- `npm run typecheck`
- `npm test`
- `npm run build`
- service Prisma import audit with `rg`

### Verification
- docker: PASS
- prisma: N/A
- lint: N/A, no script configured
- typecheck: PASS
- tests: PASS
- build: PASS
- manual/browser: N/A

### Remaining Issues
- None

### Roadmap Update
last_completed_task: P7-002
next_task: P7-003

## 2026-08-12 — P7-003 — User avatar lifecycle

Status: DONE

### Scope
Implemented authenticated user avatar upload/replace/delete with Cloudinary cleanup.

### Architecture
- Controller: avatar handlers use shared response helpers.
- Service: upload/replace/delete orchestration and cleanup live in `user.service.ts`; no Prisma import.
- Repository: avatar DB writes stay in `user.repository.ts`.
- Middleware: route uses Multer image memory upload and upload rate limit.

### Files Created
- `api/prisma/migrations/20260812060000_add_user_avatar_public_id/migration.sql`

### Files Modified
- `api/MinLD.PFL_BACKEND_ROADMAP.md`
- `api/prisma/schema.prisma`
- `api/src/common/rate-limit/upload.rate-limit.ts`
- `api/src/modules/users/user.controller.ts`
- `api/src/modules/users/user.repository.ts`
- `api/src/modules/users/user.routes.test.ts`
- `api/src/modules/users/user.routes.ts`
- `api/src/modules/users/user.service.ts`

### Database
- models: `User.avatarPublicId`
- migration: `20260812060000_add_user_avatar_public_id`

### Endpoints
- `POST /api/v1/users/me/avatar`
- `DELETE /api/v1/users/me/avatar`

### Security
- authentication: access JWT required.
- authorization: active user required.
- rate limit: `userUploadRateLimit` on upload.
- cookie: N/A
- trusted origin: N/A

### Tests
- Active user replaces avatar.
- Old Cloudinary asset cleaned after replacement.
- Active user deletes avatar.
- Missing token, banned user, and invalid image rejected.

### Commands
- `npm run prisma:format`
- `npm run prisma:validate`
- `npx prisma migrate deploy`
- `npm run prisma:generate`
- `npm run typecheck`
- `npm test`
- `npm run build`
- `npx prisma migrate status`
- service Prisma import audit with `rg`

### Verification
- docker: PASS
- prisma: PASS
- lint: N/A, no script configured
- typecheck: PASS
- tests: PASS
- build: PASS
- manual/browser: N/A

### Remaining Issues
- None

### Roadmap Update
last_completed_task: P7-003
next_task: P8-001

---

# 39. RESUME PROMPT FOR NEW AI SESSION

```text
Read MinLD.PFL_BACKEND_ROADMAP.md completely.

This file is the source of truth.

Do not code yet.

Report:

1. current project status
2. current phase
3. current task
4. last completed task
5. next task
6. architecture violations found
7. services that import Prisma directly
8. database-backed modules missing repository
9. controllers not using shared response helper
10. auth endpoints currently implemented
11. required auth endpoints currently missing
12. rate-limit coverage
13. httpOnly refresh-cookie coverage
14. mail/forgot/reset coverage

Then wait for approval.
```

---

# 40. NEXT ACTION

Do NOT move to Projects yet.

Current mandatory task:

```text
P4-001 — Category CRUD with repository
```

Reason:

Foundation, data/mail, complete auth, and Phase 3 user/authorization are verified.

Next development should start Phase 4 Category CRUD with repository.
