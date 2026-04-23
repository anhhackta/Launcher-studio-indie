# 🎮 Game Launcher - Tauri + React

Một game launcher đơn giản, tối ưu và thực tế được xây dựng với Tauri và React.

## ✨ **Tính Năng Chính**

- 🎮 **Quản lý Game**: Tải, cài đặt, chơi game
- 🔄 **Auto Update**: Tự động kiểm tra và cập nhật game
- 🔧 **Repair System**: Sửa chữa file game bị lỗi
- 🖼️ **Dynamic Backgrounds**: Hình nền thay đổi theo game
- 💻 **Startup Windows**: Tự động khởi động cùng Windows
- 🌐 **Network Check**: Kiểm tra kết nối mạng
- 📱 **System Tray**: Thu nhỏ xuống system tray

## 🚀 **Cách Sử Dụng**

### **1. Cài Đặt Dependencies**
```bash
npm install
cd src-tauri
cargo build
```

### **2. Chạy Development Mode**
```bash
npm run tauri dev
```

### **3. Build Production**
```bash
npm run tauri build
```

## 📁 **Cấu Trúc Project**

```
Laucher/
├── src/                    # React Frontend
│   ├── App.tsx           # Main component
│   └── App.css           # Styles
├── src-tauri/            # Rust Backend
│   ├── src/main.rs       # Core logic
│   └── Cargo.toml        # Dependencies
├── manifest.json          # Game configuration
└── README.md             # This file
```

## ⚙️ **Cấu Hình Manifest.json**

`manifest.json` chứa tất cả thông tin game và cấu hình:

```json
{
  "games": [
    {
      "id": "stellar_quest",
      "name": "Stellar Quest",
      "version": "2.2.3",
      "status": "available",
      "download_url": "https://your-url.com/game.zip",
      "executable_path": "Game.exe",
      "image_url": "https://your-url.com/image.png",
      "description": "Game description",
      "file_size": "1.2GB",
      "release_date": "2023-01-01",
      "changelog": "Update notes",
      "is_coming_soon": false,
      "repair_enabled": true
    }
  ]
}
```

## 🌐 **Deploy Manifest**

### **GitHub Pages (Khuyến Nghị)**
1. Tạo repository public
2. Upload `manifest.json`
3. Enable GitHub Pages
4. Cập nhật URL trong `src-tauri/src/main.rs`

### **Netlify/Vercel**
- Drag & drop folder chứa `manifest.json`
- Sử dụng URL được cung cấp

## 🔧 **Tùy Chỉnh**

### **Thêm Game Mới**
1. Edit `manifest.json`
2. Thêm entry game mới
3. Upload game files lên cloud
4. Cập nhật `download_url`

### **Thay Đổi Background**
1. Edit `backgrounds` trong `manifest.json`
2. Upload hình ảnh mới
3. Cập nhật `image_url`

### **Cập Nhật Game**
1. Tăng `version` trong `manifest.json`
2. Upload game files mới
3. Cập nhật `changelog`

## 🎯 **Ưu Điểm**

- ✅ **Đơn giản**: Chỉ những tính năng cần thiết
- ✅ **Tối ưu**: Code sạch, hiệu suất cao
- ✅ **Thực tế**: Không có tính năng thừa
- ✅ **Dễ bảo trì**: Cấu trúc rõ ràng
- ✅ **Không cần visa**: Sử dụng GitHub Pages miễn phí

## 🚨 **Lưu Ý**

- Launcher cần internet để hoạt động
- Manifest.json phải accessible từ internet
- Game files phải được upload lên cloud storage
- Backup manifest.json trước khi thay đổi

## 📞 **Hỗ Trợ**

Nếu có vấn đề:
1. Kiểm tra kết nối mạng
2. Kiểm tra URL manifest.json
3. Kiểm tra console errors
4. Restart launcher

---

**Game Launcher - Đơn giản, Tối ưu, Thực tế! 🚀**
