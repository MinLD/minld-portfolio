# Cấu trúc thư mục Vue 3

```txt
web/
├─ src/                         # Source code chính
│  ├─ api/                       # Request API, HTTP client, endpoint BE
│  ├─ assets/                    # Ảnh, icon, font, style asset
│  ├─ components/                # Component tái sử dụng
│  │  ├─ auth/                   # Component riêng cho login/register
│  │  ├─ layout/                 # Header, footer, sidebar
│  │  ├─ shared/                 # Component dùng chung hiện có
│  │  └─ ui/                     # UI nhỏ: button, modal, input
│  ├─ composables/               # Custom hooks Vue Composition API
│  ├─ directives/                # Custom directives: v-focus, v-click-outside
│  ├─ layouts/                   # Layout page: Default, Admin, Auth
│  ├─ router/                    # Vue Router config, routes, guards
│  ├─ services/                  # Business logic gọi API
│  ├─ store/                     # Store theo ảnh mẫu
│  ├─ stores/                    # Pinia store app đang dùng
│  ├─ styles/                    # CSS/SCSS tách riêng
│  └─ views/                     # Page chính
├─ public/                       # File tĩnh root của Vite
└─ tests/                        # Unit/e2e tests
```
