# 📦 Manifest R2 Cloudflare — Hướng Dẫn Sử Dụng

## Tổng Quan

Manifest là file JSON chứa toàn bộ dữ liệu game, tin tức, và cấu hình launcher. File được host trên **Cloudflare R2** để launcher tải về khi khởi động.

**Endpoint hiện tại:**
```
https://pub-72a5a57231ae489cb74409bdc120cb93.r2.dev/manifest.json
```

---

## Cấu Trúc Manifest

```jsonc
{
  "manifest_version": "2.0",
  "last_updated": "2026-01-06T00:00:00Z",
  "manifest_signature": "",       // SHA-256 signature (tương lai)

  "launcher_config": { ... },     // Cấu hình cập nhật launcher
  "news": [ ... ],                // Danh sách tin tức
  "categories": [ ... ],          // Thể loại game
  "backgrounds": { ... },         // Background images
  "games": [ ... ],               // Danh sách game
  "social_links": [ ... ],        // Link mạng xã hội
  "settings": { ... }             // Cài đặt mặc định
}
```

---

## Thêm Game Mới

Thêm object mới vào mảng `games`:

```json
{
  "id": "game_id_unique",
  "name": "Game Name",
  "version": "1.0.0",
  "developer": "Studio Name",
  "publisher": "Publisher Name",
  "category_id": "action",
  "status": "available",
  "download_url": "https://pub-xxx.r2.dev/game.zip",
  "download_checksum": "sha256:abc123...",
  "executable_path": null,
  "image_url": "https://...",
  "logo_url": "https://...",
  "banner_url": "https://...",
  "background_id": "game_bg",
  "description": "Mô tả ngắn",
  "description_long": "Mô tả chi tiết",
  "file_size": "100 MB",
  "file_size_bytes": 104857600,
  "release_date": "2026-01-01",
  "last_updated": "2026-01-01",
  "changelog": "v1.0.0: Initial release",
  "tags": ["action", "rpg"],
  "screenshots": ["https://..."],
  "trailer_url": "https://www.youtube.com/watch?v=VIDEO_ID",
  "system_requirements": {
    "os": "Windows 10+",
    "ram": "8 GB",
    "storage": "2 GB"
  },
  "is_coming_soon": false,
  "repair_enabled": true
}
```

### Các field quan trọng cho PanelMain

| Field | Hiển thị tại | Mô tả |
|-------|-------------|-------|
| `developer` | **pmg-developer** (góc trên trái) | Tên hãng phát triển |
| `name` | **pmg-namegame** (dưới trái) | Tên game viết hoa |
| `version` | **pmg-namegame** | Phiên bản hiện tại |
| `banner_url` | **pmg-bg-img** | Ảnh nền hero chính |
| `screenshots[0]` | **paneltrailergame** | Ảnh thumbnail trailer |
| `trailer_url` | **Trailer modal** | YouTube URL để xem trailer |
| `executable_path` | **pmg-play** | Nếu có → nút Play, nếu null → nút Download |

---

## Thêm Tin Tức

Thêm vào mảng `news`:

```json
{
  "id": "news_004",
  "title": "Tiêu đề tin tức",
  "content": "Nội dung chi tiết...",
  "image_url": "https://...",
  "date": "2026-02-01",
  "type": "update",
  "game_id": "game_id",
  "pinned": false
}
```

**Loại tin (`type`)**: `announcement`, `update`, `event`

> Tin tức hiển thị trong **panelnewsgame** dạng carousel slide ngang, tự chuyển mỗi 5 giây.

---

## Upload Lên R2

### Bằng Wrangler CLI

```bash
# Cài đặt
npm install -g wrangler

# Đăng nhập
wrangler login

# Upload manifest
wrangler r2 object put antchill-launcher/manifest.json --file=manifest.json --content-type="application/json"

# Upload game file
wrangler r2 object put antchill-launcher/game.zip --file=game.zip
```

### Bằng Dashboard

1. Truy cập [Cloudflare Dashboard](https://dash.cloudflare.com) → R2
2. Chọn bucket `antchill-launcher`
3. Upload file → Chọn `manifest.json`
4. Đảm bảo bucket có **Public Access** enabled

---

## Cập Nhật Game

1. Tăng `version` trong game object
2. Upload file game mới lên R2
3. Cập nhật `download_url` nếu URL thay đổi
4. Tính `download_checksum` mới:
   ```bash
   certutil -hashfile game.zip SHA256
   ```
5. Cập nhật `changelog`
6. Set `last_updated` thành ngày hiện tại
7. Upload `manifest.json` mới lên R2

---

## Lưu Ý

- **Cache**: R2 public access có cache ~1 giờ. Nếu cần cập nhật ngay, thêm `?v=timestamp` vào URL
- **CORS**: Manifest URL đã được whitelist trong `tauri.conf.json` CSP
- **Checksum**: Luôn cập nhật `download_checksum` khi thay đổi file game để đảm bảo tính toàn vẹn
- **Kích thước**: Manifest nên < 100KB. Tách dữ liệu lớn (screenshots, descriptions) ra URL riêng
