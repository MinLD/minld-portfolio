# Frontend Project Contract

## Project tags

- List public: `GET /api/v1/project-tags`
- List admin: `GET /api/v1/admin/project-tags`
- Create admin: `POST /api/v1/admin/project-tags`
- Body: `{ "name": "SaaS", "description": "optional" }`
- `slug` is optional. Backend can generate it from `name`.

## Technologies

- List admin: `GET /api/v1/admin/technologies`
- Create admin: `POST /api/v1/admin/technologies`
- Project form should render technologies as click-select options.
- Submit selected IDs as `technologyIds`.

## Projects

- Swagger/OpenAPI: `api/openapi/projects.openapi.json`
- Public list: `GET /api/v1/projects?search=&page=1&limit=20`
- Admin list: `GET /api/v1/admin/projects?search=&status=DRAFT&page=1&limit=20`
- Search uses SQL LIKE/ILIKE matching on `title`, `summary`, `content`.
- Pagination response meta: `{ page, limit, total, totalPages }`.
- Create: `POST /api/v1/admin/projects`
- Update: `PATCH /api/v1/admin/projects/:id`
- Content-Type: `multipart/form-data` when uploading an image.
- File field: `thumbnail`
- `slug` is optional. Backend generates it from `title` on create.

Fields:

```txt
title=My Project
summary=Short summary
content=Long content
status=DRAFT|PUBLISHED|ARCHIVED
featured=true|false
year=2026
publishedAt=2026-08-12T00:00:00.000Z
demoUrl=https://example.com
githubUrl=https://github.com/user/repo
sourceUrl=https://example.com/source
tagIds=uuid
technologyIds=uuid
thumbnail=<file>
```

Repeat `tagIds` / `technologyIds` for multiple selections, or send them as comma-separated strings / JSON arrays.
