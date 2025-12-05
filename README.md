# 🗺️ Ứng dụng Tìm kiếm POI Việt Nam

Web application tìm kiếm địa điểm (POI) tại Việt Nam với Firebase Authentication và tính năng dịch nhanh.

## 📋 Tính năng

### 🔐 Xác thực người dùng (Firebase Authentication)
- ✅ Đăng ký tài khoản email/password
- ✅ Đăng nhập email/password
- ✅ Đăng nhập bằng Google
- ✅ Xác thực email
- ✅ Đổi mật khẩu
- ✅ Cập nhật hồ sơ (tên hiển thị, ảnh đại diện)
- ✅ Xóa tài khoản

### 🗺️ Bản đồ & Tìm kiếm
- 🗺️ Hiển thị bản đồ Việt Nam (OpenStreetMap + Leaflet)
- 🔍 Tìm kiếm địa điểm theo tên
- 📍 Hiển thị marker trên bản đồ
- 🧭 Tính toán đường đi

### 🌐 Dịch thuật
- 🔄 Dịch văn bản nhanh (Google Translate API)
- 🇻🇳 Hỗ trợ nhiều ngôn ngữ

---

## 🚀 Hướng dẫn chạy dự án

### 📦 Yêu cầu hệ thống
- **Python:** 3.10 trở lên
- **Browser:** Chrome, Firefox, Edge (bản mới nhất)

---

## ⚙️ Cài đặt & Chạy

### **Bước 1: Clone repository**
```bash
git clone https://github.com/nnkhlh376/firebase_api.git
cd firebase_api
```

### **Bước 2: Cài đặt Backend**

#### 2.1. Tạo Virtual Environment
```bash
cd backend
python -m venv .venv
```

#### 2.2. Kích hoạt Virtual Environment (Windows PowerShell)
```powershell
.\.venv\Scripts\Activate.ps1
```

#### 2.3. Cài đặt dependencies
```bash
pip install -r requirements.txt
```

#### 2.4. Chạy Backend Server
```bash
uvicorn main:app --reload --port 8000
```

✅ Backend đang chạy tại: **http://localhost:8000**

---

### **Bước 3: Chạy Frontend**

#### 3.1. Mở terminal mới, ở thư mục gốc firebase_api
```bash
# Nếu đang ở translate_backend, quay lại
cd ..
```

#### 3.2. Chạy Live Server

**Cách 1: VS Code Live Server Extension (Khuyên dùng)**
1. Cài extension "Live Server" trong VS Code
2. Chuột phải vào file `index.html`
3. Chọn **"Open with Live Server"**

**Cách 2: Python HTTP Server**
```bash
python -m http.server 5501
```

✅ Frontend đang chạy tại: **http://127.0.0.1:5501**

---

## 🔥 Firebase Configuration

### Firebase Project: **tim-poi**

**Providers đã enable:**
- ✅ Email/Password Authentication
- ✅ Google Sign-In

**Lưu ý:** Để dùng Google Sign-In, cần thêm domain vào Firebase Console:
- Authentication → Settings → Authorized domains
- Thêm: `127.0.0.1` và `localhost`

---

## 📂 Cấu trúc thư mục

```
firebase_api/
├── index.html              # Trang chính
├── style.css               # Styles
├── auth.js                 # Firebase Authentication
├── app.js                  # Map & POI search
├── 24127197.txt           # Thông tin sinh viên
├── README.md              # File này
└── translate_backend/     # Backend FastAPI
    ├── main.py            # API endpoints
    ├── firebase_auth.py   # Firebase functions
    ├── firebase_config.py # Firebase credentials
    ├── requirements.txt   # Dependencies
    └── .venv/             # Virtual env (tự tạo)
```

---

## 🧪 Test các tính năng

### Trên giao diện web:
1. Mở http://127.0.0.1:5501
2. Click **"Đăng nhập"**
3. Đăng ký tài khoản mới
4. Thử tìm kiếm địa điểm: "Hà Nội", "Đà Nẵng"
5. Thử dịch văn bản
6. Cập nhật hồ sơ với ảnh từ Postimages

---

## 🐛 Troubleshooting

### ❌ Lỗi: Module 'fastapi' not found
```bash
cd translate_backend
.\.venv\Scripts\Activate.ps1
pip install -r requirements.txt
```

### ❌ Lỗi: Firebase unauthorized-domain
Thêm `127.0.0.1` vào Firebase Console → Authentication → Authorized domains

### ❌ Lỗi: 404 API
Kiểm tra backend đang chạy: http://localhost:8000/docs

---

## 📝 Thông tin sinh viên

**MSSV:** 24127197  
**GitHub:** https://github.com/nnkhlh376/firebase_api

---

## 📚 Công nghệ

**Frontend:** HTML5, CSS3, JavaScript ES6+, Leaflet.js, Firebase SDK  
**Backend:** FastAPI, Firebase Admin, Google Translate API  

---

**🎉 Chúc thầy chấm bài vui vẻ!**
