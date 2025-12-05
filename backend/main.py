from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from fastapi.middleware.cors import CORSMiddleware
import httpx
from firebase_auth import (
    register_user,
    login_user,
    send_verification_email,
    save_user_data,
    get_user_data,
    verify_token,
    delete_user,
    change_password,
    update_profile
)

app = FastAPI(title="Translate Backend with Firebase", version="2.0.0")

# CORS cho frontend chạy Live Server
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://127.0.0.1:5501",
        "http://localhost:5501",
        "http://127.0.0.1:5500",
        "http://localhost:5500",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


class TranslateReq(BaseModel):
    source_lang: str
    target_lang: str
    text: str


class TranslateResp(BaseModel):
    translated_text: str | None
    src: str | None = None
    dest: str | None = None
    error: str | None = None


def google_translate_raw(text: str, src: str, dest: str) -> tuple[str, str]:
    """
    Gọi trực tiếp endpoint translate.googleapis.com,
    trả về (translated_text, detected_source_lang)
    """
    url = "https://translate.googleapis.com/translate_a/single"
    params = {
        "client": "gtx",
        "sl": src,
        "tl": dest,
        "dt": "t",
        "q": text,
    }

    r = httpx.get(url, params=params, timeout=10)
    r.raise_for_status()  # nếu HTTP lỗi sẽ ném ngoại lệ

    data = r.json()
    # data[0] là list các segment [[ "xin chào", "hello", ... ], ...]
    translated = "".join(part[0] for part in data[0])
    detected_src = data[2] if len(data) > 2 and isinstance(data[2], str) else src
    return translated, detected_src


@app.post("/api/translate", response_model=TranslateResp)
def translate(req: TranslateReq):
    # Nếu cùng ngôn ngữ thì trả nguyên văn
    if req.source_lang == req.target_lang:
        return TranslateResp(
            translated_text=req.text,
            src=req.source_lang,
            dest=req.target_lang,
            error=None,
        )

    try:
        translated, detected_src = google_translate_raw(
            req.text, req.source_lang, req.target_lang
        )
        return TranslateResp(
            translated_text=translated,
            src=detected_src,
            dest=req.target_lang,
            error=None,
        )
    except Exception as e:
        # Trả lỗi về cho frontend hiển thị dòng đỏ
        return TranslateResp(
            translated_text=None,
            src=req.source_lang,
            dest=req.target_lang,
            error=str(e),
        )


@app.get("/api/health")
def health():
    return {"status": "ok"}


# ============= FIREBASE AUTHENTICATION ENDPOINTS =============

class RegisterRequest(BaseModel):
    email: str
    password: str


class LoginRequest(BaseModel):
    email: str
    password: str


class VerifyEmailRequest(BaseModel):
    id_token: str


class SaveDataRequest(BaseModel):
    user_id: str
    data: dict
    id_token: str


class GetDataRequest(BaseModel):
    user_id: str
    id_token: str


class ChangePasswordRequest(BaseModel):
    id_token: str
    new_password: str


class UpdateProfileRequest(BaseModel):
    id_token: str
    display_name: str | None = None
    photo_url: str | None = None


@app.post("/api/auth/register")
def register(req: RegisterRequest):
    """
    Đăng ký tài khoản mới
    Bước 4: auth.create_user_with_email_and_password(email, password)
    """
    result = register_user(req.email, req.password)
    if not result["success"]:
        raise HTTPException(status_code=400, detail=result["error"])
    return result


@app.post("/api/auth/login")
def login(req: LoginRequest):
    """
    Đăng nhập tài khoản
    Bước 5: user = auth.sign_in_with_email_and_password(email, password)
    """
    result = login_user(req.email, req.password)
    if not result["success"]:
        raise HTTPException(status_code=401, detail=result["error"])
    return result


@app.post("/api/auth/send-verification")
def send_verification(req: VerifyEmailRequest):
    """
    Gửi email xác minh
    Bước 6: auth.send_email_verification(user["idToken"])
    """
    result = send_verification_email(req.id_token)
    if not result["success"]:
        raise HTTPException(status_code=400, detail=result["error"])
    return result


@app.post("/api/database/save")
def save_data(req: SaveDataRequest):
    """
    Lưu dữ liệu người dùng vào Database
    Bước 7: db.child("users").push(data, user['idToken'])
    """
    result = save_user_data(req.user_id, req.data, req.id_token)
    if not result["success"]:
        raise HTTPException(status_code=400, detail=result["error"])
    return result


@app.post("/api/database/get")
def get_data(req: GetDataRequest):
    """
    Lấy dữ liệu người dùng từ Database
    """
    result = get_user_data(req.user_id, req.id_token)
    if not result["success"]:
        raise HTTPException(status_code=400, detail=result["error"])
    return result


@app.post("/api/auth/verify-token")
def verify_user_token(req: VerifyEmailRequest):
    """
    Xác thực token của người dùng
    """
    result = verify_token(req.id_token)
    if not result["success"]:
        raise HTTPException(status_code=401, detail=result["error"])
    return result

@app.post("/api/auth/delete")
def delete(req: VerifyEmailRequest):
    result = delete_user(req.id_token)
    if not result["success"]:
        raise HTTPException(status_code=400, detail=result["error"])
    return result

@app.post("/api/auth/change-password")
def api_change_password(req: ChangePasswordRequest):
    result = change_password(req.id_token, req.new_password)
    if not result["success"]:
        raise HTTPException(status_code=400, detail=result["error"])
    return result

@app.post("/api/auth/update-profile")
def api_update_profile(req: UpdateProfileRequest):
    """
    Cập nhật displayName và photoUrl của người dùng
    """
    result = update_profile(req.id_token, req.display_name, req.photo_url)
    if not result["success"]:
        raise HTTPException(status_code=400, detail=result["error"])
    return result
