# Auth flow Vue + BE HttpOnly cookies

1. `login/register` gọi từ component.
2. Component gọi `auth.store.js`.
3. Store gọi `auth.service.js`.
4. Service gọi `api/auth.js`.
5. API dùng `api/http.js` để fetch BE.

## Login

- FE gọi `POST /api/v1/auth/login`.
- BE set access + refresh token bằng cookie `HttpOnly`.
- Response chỉ trả `user`, không trả token.
- FE chỉ giữ `user/auth state` trong Pinia.

## Reload trang

- F5 không xóa cookie, browser giữ access + refresh cookie đến khi hết hạn hoặc server clear.
- App gọi `authStore.restoreSession()` một lần ở navigation guard, kể cả public page.
- Store gọi `GET /api/v1/auth/me` để khôi phục `user/auth state` từ cookie.
- Nếu access cookie hết hạn, Axios mới gọi `POST /auth/refresh`, nhận cookie mới, retry `/me`.

## API bảo vệ

- Browser tự gửi access cookie.
- Nếu access cookie hết hạn, Axios gọi một lần `POST /auth/refresh`, rồi retry request gốc.
