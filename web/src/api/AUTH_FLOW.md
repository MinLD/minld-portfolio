# Auth flow Vue + BE cookie

1. `login/register` gọi từ component.
2. Component gọi `auth.store.js`.
3. Store gọi `auth.service.js`.
4. Service gọi `api/auth.js`.
5. API dùng `api/http.js` để fetch BE.

## Login

- FE gọi `POST /api/v1/auth/login`.
- BE trả `accessToken` trong JSON.
- BE tự set refresh token vào cookie `HttpOnly`.
- FE chỉ giữ `accessToken` trong memory, không lưu `localStorage`.

## Reload trang

- Memory mất `accessToken`.
- `authStore.boot()` gọi `POST /api/v1/auth/refresh`.
- Browser tự gửi cookie vì `credentials: 'include'`.
- BE trả access token mới.
- FE gọi `GET /api/v1/auth/me` để lấy user.

## API bảo vệ

- Gửi `Authorization: Bearer <accessToken>`.
- Nếu access token hết hạn, gọi refresh rồi gọi lại API.
