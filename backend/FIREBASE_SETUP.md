# HƯỚNG DẪN CÀI ĐẶT VÀ SỬ DỤNG FIREBASE

## Bước 1: Cài đặt thư viện

```powershell
cd translate_backend
.\.venv\Scripts\Activate.ps1
pip install -r requirements.txt
```

## Bước 2: Lấy cấu hình Firebase

1. Vào [Firebase Console](https://console.firebase.google.com)
2. Chọn project hoặc tạo mới
3. Vào **Project Settings** → **General** → **Your apps**
4. Click vào biểu tượng **Web (</>)**
5. Copy toàn bộ config object

## Bước 3: Cập nhật firebase_config.py

Mở file `firebase_config.py` và thay thế các giá trị:

```python
FIREBASE_CONFIG = {
    "apiKey": "AIzaSy...",  # Thay bằng API key của bạn
    "authDomain": "your-project.firebaseapp.com",
    "databaseURL": "https://your-project-default-rtdb.firebaseio.com",
    "projectId": "your-project-id",
    "storageBucket": "your-project.appspot.com",
    "messagingSenderId": "123456789",
    "appId": "1:123456789:web:abc123"
}
```

## Bước 4: Bật Authentication trong Firebase

1. Vào Firebase Console → **Authentication**
2. Click **Get Started**
3. Chọn **Email/Password** → Enable → Save

## Bước 5: Bật Realtime Database (nếu cần lưu dữ liệu)

1. Vào Firebase Console → **Realtime Database**
2. Click **Create Database**
3. Chọn region → Start in **test mode** (cho development)

## Bước 6: Chạy server

```powershell
uvicorn main:app --reload --port 8000
```

## Bước 7: Test API

### Đăng ký tài khoản:
```bash
POST http://localhost:8000/api/auth/register
{
  "email": "test@example.com",
  "password": "password123"
}
```

### Đăng nhập:
```bash
POST http://localhost:8000/api/auth/login
{
  "email": "test@example.com",
  "password": "password123"
}
```

### Gửi email xác minh:
```bash
POST http://localhost:8000/api/auth/send-verification
{
  "id_token": "eyJhbGci..."
}
```

### Lưu dữ liệu:
```bash
POST http://localhost:8000/api/database/save
{
  "user_id": "user123",
  "data": {"name": "Nguyen Van A", "age": 20},
  "id_token": "eyJhbGci..."
}
```

## API Endpoints có sẵn:

- `POST /api/auth/register` - Đăng ký tài khoản
- `POST /api/auth/login` - Đăng nhập
- `POST /api/auth/send-verification` - Gửi email xác minh
- `POST /api/auth/verify-token` - Xác thực token
- `POST /api/database/save` - Lưu dữ liệu người dùng
- `POST /api/database/get` - Lấy dữ liệu người dùng
- `POST /api/translate` - Dịch văn bản (có sẵn từ trước)
- `GET /api/health` - Kiểm tra server

## Lưu ý:

- **Không commit file `firebase_config.py`** lên Git (thêm vào `.gitignore`)
- Đổi Database rules sang **test mode** khi development
- Production nên dùng rules bảo mật: chỉ user đã đăng nhập mới đọc/ghi được
