# MinLD.PFL API

## PostgreSQL Docker

```sh
docker compose up -d
docker compose ps
docker compose logs -f postgres
docker compose down
```

## Browser Auth Cookie Contract

Refresh tokens are stored in an httpOnly cookie. Browser requests that need the refresh cookie must include credentials:

```ts
fetch('/api/v1/auth/refresh', { method: 'POST', credentials: 'include' })
```

Axios equivalent:

```ts
axios.post('/api/v1/auth/refresh', undefined, { withCredentials: true })
```
