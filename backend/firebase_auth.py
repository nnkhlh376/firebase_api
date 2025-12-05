"""
Firebase Authentication Helper
Theo hướng dẫn PDF - sử dụng firebase-rest-api
"""
import firebase
from firebase_config import FIREBASE_CONFIG

# Khởi tạo Firebase App
app = firebase.initialize_app(FIREBASE_CONFIG)
auth = app.auth()
db = app.database()


def register_user(email: str, password: str):
    """
    Đăng ký tài khoản mới
    Bước 4 trong PDF
    """
    try:
        user = auth.create_user_with_email_and_password(email, password)
        return {"success": True, "user": user, "message": "Đăng ký thành công"}
    except Exception as e:
        return {"success": False, "error": str(e)}


def login_user(email: str, password: str):
    """
    Đăng nhập tài khoản
    Bước 5 trong PDF
    """
    try:
        user = auth.sign_in_with_email_and_password(email, password)
        
        # Lấy thông tin account để có emailVerified
        id_token = user.get("idToken")
        account_info = auth.get_account_info(id_token)
        
        # Extract emailVerified từ account info
        if account_info and "users" in account_info and len(account_info["users"]) > 0:
            user["emailVerified"] = account_info["users"][0].get("emailVerified", False)
        
        return {"success": True, "user": user, "token": id_token}
    except Exception as e:
        return {"success": False, "error": str(e)}


def send_verification_email(id_token: str):
    """
    Gửi email xác minh bằng Firebase REST API
    """
    import requests
    from firebase_config import FIREBASE_CONFIG

    API_KEY = FIREBASE_CONFIG["apiKey"]

    url = f"https://identitytoolkit.googleapis.com/v1/accounts:sendOobCode?key={API_KEY}"
    payload = {
        "requestType": "VERIFY_EMAIL",
        "idToken": id_token
    }

    try:
        response = requests.post(url, json=payload)
        data = response.json()

        if "error" in data:
            return {"success": False, "error": data["error"]["message"]}

        return {"success": True, "message": "Email xác minh đã được gửi!"}
    except Exception as e:
        return {"success": False, "error": str(e)}



def save_user_data(user_id: str, data: dict, id_token: str):
    """
    Lưu dữ liệu người dùng vào Realtime Database
    Bước 7 trong PDF
    """
    try:
        db.child("users").child(user_id).set(data, id_token)
        return {"success": True, "message": "Lưu dữ liệu thành công"}
    except Exception as e:
        return {"success": False, "error": str(e)}


def get_user_data(user_id: str, id_token: str):
    """
    Lấy dữ liệu người dùng từ Database
    """
    try:
        data = db.child("users").child(user_id).get(id_token)
        return {"success": True, "data": data.val()}
    except Exception as e:
        return {"success": False, "error": str(e)}


def verify_token(id_token: str):
    """
    Xác thực token của người dùng
    """
    try:
        user_info = auth.get_account_info(id_token)
        return {"success": True, "user_info": user_info}
    except Exception as e:
        return {"success": False, "error": str(e)}


def google_sign_in(id_token: str):
    """
    Đăng nhập bằng Google OAuth token
    Firebase REST API hỗ trợ xác thực Google ID token
    """
    try:
        # Verify Google ID token với Firebase
        user_info = auth.get_account_info(id_token)
        return {"success": True, "user": user_info, "token": id_token}
    except Exception as e:
        return {"success": False, "error": str(e)}

def delete_user(id_token: str):
    """
    Xóa tài khoản người dùng
    """
    import requests
    from firebase_config import FIREBASE_CONFIG
    
    API_KEY = FIREBASE_CONFIG["apiKey"]
    url = f"https://identitytoolkit.googleapis.com/v1/accounts:delete?key={API_KEY}"
    payload = {"idToken": id_token}
    
    try:
        r = requests.post(url, json=payload)
        data = r.json()
        
        if "error" in data:
            return {"success": False, "error": data["error"]["message"]}
        
        return {"success": True, "message": "Xóa tài khoản thành công"}
    except Exception as e:
        return {"success": False, "error": str(e)}

def change_password(id_token: str, new_password: str):
    """
    Thay đổi mật khẩu người dùng
    """
    import requests
    from firebase_config import FIREBASE_CONFIG

    API_KEY = FIREBASE_CONFIG["apiKey"]
    url = f"https://identitytoolkit.googleapis.com/v1/accounts:update?key={API_KEY}"
    payload = {
        "idToken": id_token,
        "password": new_password,
        "returnSecureToken": True
    }

    try:
        r = requests.post(url, json=payload)
        data = r.json()

        if "error" in data:
            return {"success": False, "error": data["error"]["message"]}

        return {"success": True, "message": "Thay đổi mật khẩu thành công"}
    except Exception as e:
        return {"success": False, "error": str(e)}

def update_profile(id_token: str, display_name: str | None, photo_url: str | None):
    """
    Cập nhật profile người dùng (displayName, photoUrl)
    """
    import requests
    from firebase_config import FIREBASE_CONFIG
    API_KEY = FIREBASE_CONFIG["apiKey"]

    url = f"https://identitytoolkit.googleapis.com/v1/accounts:update?key={API_KEY}"

    payload = {
        "idToken": id_token,
        "returnSecureToken": True
    }

    if display_name:
        payload["displayName"] = display_name
    if photo_url:
        payload["photoUrl"] = photo_url

    try:
        r = requests.post(url, json=payload)
        data = r.json()

        if "error" in data:
            return {"success": False, "error": data["error"]["message"]}

        return {
            "success": True,
            "message": "Cập nhật hồ sơ thành công!",
            "displayName": data.get("displayName"),
            "photoUrl": data.get("photoUrl"),
            "idToken": data.get("idToken")
        }
    except Exception as e:
        return {"success": False, "error": str(e)}