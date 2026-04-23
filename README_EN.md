# 🎮 Game Launcher - Tauri + React

A simple, optimized, and practical game launcher built with Tauri and React.

## ✨ **Key Features**

- 🎮 **Game Management**: Download, install, and play games
- 🔄 **Auto Update**: Automatically check and update games
- 🔧 **Repair System**: Fix corrupted game files
- 🖼️ **Dynamic Backgrounds**: Backgrounds change based on selected game
- 💻 **Windows Startup**: Automatically launch with Windows
- 🌐 **Network Check**: Check internet connection status
- 📱 **System Tray**: Minimize to system tray

## 🚀 **Getting Started**

### **1. Install Dependencies**
```bash
npm install
cd src-tauri
cargo build
```

### **2. Run Development Mode**
```bash
npm run tauri dev
```

### **3. Build for Production**
```bash
npm run tauri build
```

## 📁 **Project Structure**

```
Launcher/
├── src/                    # React Frontend
│   ├── App.tsx           # Main component
│   └── App.css           # Styles
├── src-tauri/            # Rust Backend
│   ├── src/main.rs       # Core logic
│   └── Cargo.toml        # Dependencies
├── manifest.json          # Game configuration
└── README.md             # Documentation
```

## ⚙️ **manifest.json Configuration**

`manifest.json` contains all game information and settings:

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

### **GitHub Pages (Recommended)**
1. Create a public repository
2. Upload `manifest.json`
3. Enable GitHub Pages
4. Update URL in `src-tauri/src/main.rs`

### **Netlify/Vercel**
- Drag & drop the folder containing `manifest.json`
- Use the provided URL

## 🔧 **Customization**

### **Add New Game**
1. Edit `manifest.json`
2. Add new game entry
3. Upload game files to cloud storage
4. Update `download_url`

### **Change Background**
1. Edit `backgrounds` in `manifest.json`
2. Upload new images
3. Update `image_url`

### **Update Game**
1. Increment `version` in `manifest.json`
2. Upload new game files
3. Update `changelog`

## 🎯 **Advantages**

- ✅ **Simple**: Only essential features
- ✅ **Optimized**: Clean code, high performance
- ✅ **Practical**: No unnecessary features
- ✅ **Easy Maintenance**: Clear structure
- ✅ **No Cost**: Free GitHub Pages hosting

## 🚨 **Important Notes**

- Launcher requires internet connection to work
- manifest.json must be accessible from the internet
- Game files must be uploaded to cloud storage
- Backup manifest.json before making changes

## 📞 **Support**

If you encounter issues:
1. Check your internet connection
2. Verify manifest.json URL is accessible
3. Check browser console for errors
4. Restart the launcher

---

**Game Launcher - Simple, Optimized, Practical! 🚀**