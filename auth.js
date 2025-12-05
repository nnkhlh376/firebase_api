// ===============================
//  FIREBASE INIT
// ===============================
import {
  initializeApp
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";

import {
  getAuth,
  signInWithPopup,
  GoogleAuthProvider,
  onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";

const firebaseConfig = {
  apiKey: "AIzaSyDExfMcRVKno5LJJBQu6rdzd1WEVM-OJmo",
  authDomain: "tim-poi.firebaseapp.com",
  projectId: "tim-poi"
};

const firebaseApp = initializeApp(firebaseConfig);
const auth = getAuth(firebaseApp);

// Auth functionality - Initialize after DOM loaded
(function() {
const API_URL = 'http://localhost:8000';
let currentUser = null;

// Wait for DOM to be ready
function initAuth() {
console.log('🔧 initAuth() called');

// DOM Elements
const authBtn = document.getElementById('authBtn');
console.log('✅ authBtn:', authBtn);
const authOverlay = document.getElementById('authOverlay');
const authPopup = document.getElementById('authPopup');
const authCloseBtn = document.getElementById('authCloseBtn');
const authTabs = document.querySelectorAll('.auth-tab');
const loginTab = document.getElementById('loginTab');
const registerTab = document.getElementById('registerTab');
const userInfoTab = document.getElementById('userInfoTab');
const authMessage = document.getElementById('authMessage');

// Show/Hide Auth Popup
function showAuthPopup() {
  authOverlay.classList.remove('is-hidden');
  authPopup.classList.remove('is-hidden');
}

function hideAuthPopup() {
  authOverlay.classList.add('is-hidden');
  authPopup.classList.add('is-hidden');
  hideAuthMessage();
}

// Show/Hide Message
function showAuthMessage(text, type = 'success') {
  authMessage.textContent = text;
  authMessage.className = `auth-message ${type}`;
  authMessage.classList.remove('is-hidden');
}

function hideAuthMessage() {
  authMessage.classList.add('is-hidden');
}

// Switch Auth Tabs
authTabs.forEach(tab => {
  tab.addEventListener('click', () => {
    authTabs.forEach(t => t.classList.remove('active'));
    tab.classList.add('active');

    const tabName = tab.dataset.tab;
    loginTab.classList.add('is-hidden');
    registerTab.classList.add('is-hidden');
    userInfoTab.classList.add('is-hidden');

    if (tabName === 'login') {
      loginTab.classList.remove('is-hidden');
    } else if (tabName === 'register') {
      registerTab.classList.remove('is-hidden');
    }
    hideAuthMessage();
  });
});

// Update Auth Button
function updateAuthButton(user) {
  const authIcon = document.getElementById('authIcon');
  const authText = document.getElementById('authText');
  
  if (user) {
    currentUser = user;
    authBtn.classList.add('logged-in');
    authIcon.textContent = '✓';
    authText.textContent = user.email ? user.email.split('@')[0] : 'User';
    
    // Show user info tab
    const emailEl = document.getElementById('userEmail');
    if (emailEl) emailEl.textContent = user.email || 'N/A';

    const idEl = document.getElementById('userId');
    if (idEl) {
        idEl.textContent = user.localId || user.uid || 'N/A';
    }

    // Update email verification status
    const verifiedEl = document.getElementById('userVerified');
    if (verifiedEl) {
      // Check if user has emailVerified property
      if (user.emailVerified === true) {
        verifiedEl.textContent = '✅ Đã xác thực';
        verifiedEl.style.color = '#10b981';
        verifiedEl.style.fontWeight = '600';
      } else {
        verifiedEl.textContent = '❌ Chưa xác thực';
        verifiedEl.style.color = '#ef4444';
        verifiedEl.style.fontWeight = '600';
      }
    }

    // Update profile info (displayName, photoUrl)
    updateUserInfoUI();
    
    loginTab.classList.add('is-hidden');
    registerTab.classList.add('is-hidden');
    userInfoTab.classList.remove('is-hidden');
  } else {
    currentUser = null;
    authBtn.classList.remove('logged-in');
    authIcon.textContent = '👤';
    authText.textContent = 'Đăng nhập';
  }
}

// Login Handler
document.getElementById('loginBtn').addEventListener('click', async () => {
  const email = document.getElementById('loginEmail').value;
  const password = document.getElementById('loginPassword').value;
  
  if (!email || !password) {
    showAuthMessage('Vui lòng nhập đầy đủ thông tin!', 'error');
    return;
  }

  const btn = document.getElementById('loginBtn');
  btn.disabled = true;
  btn.textContent = 'Đang đăng nhập...';

  try {
    const response = await fetch(`${API_URL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });

    const data = await response.json();

    if (response.ok && data.success) {
        showAuthMessage('Đăng nhập thành công!', 'success');
        // Gắn token từ backend
        data.user.idToken = data.token;
        currentUser = data.user;
        updateAuthButton(currentUser);
        setTimeout(() => hideAuthPopup(), 1500);
    } else {
      // Xử lý các lỗi phổ biến
      let errorMessage = 'Đăng nhập thất bại';
      const errorDetail = data.error || data.detail || '';
      
      if (errorDetail.includes('INVALID_LOGIN_CREDENTIALS') || errorDetail.includes('INVALID_PASSWORD')) {
        errorMessage = '❌ Email hoặc mật khẩu không chính xác!';
      } else if (errorDetail.includes('EMAIL_NOT_FOUND')) {
        errorMessage = '❌ Email chưa được đăng ký!';
      } else if (errorDetail.includes('USER_DISABLED')) {
        errorMessage = '❌ Tài khoản đã bị vô hiệu hóa!';
      } else if (errorDetail.includes('TOO_MANY_ATTEMPTS')) {
        errorMessage = '❌ Quá nhiều lần thử. Vui lòng thử lại sau!';
      } else if (errorDetail) {
        errorMessage = `❌ ${errorDetail}`;
      }
      
      showAuthMessage(errorMessage, 'error');
    }
  } catch (error) {
    showAuthMessage(`Lỗi kết nối: ${error.message}. Hãy chạy backend trước!`, 'error');
  } finally {
    btn.disabled = false;
    btn.textContent = 'Đăng nhập';
  }
});

// Register Handler
document.getElementById('registerBtn').addEventListener('click', async () => {
  const email = document.getElementById('registerEmail').value;
  const password = document.getElementById('registerPassword').value;
  const passwordConfirm = document.getElementById('registerPasswordConfirm').value;

  if (!email || !password || !passwordConfirm) {
    showAuthMessage('Vui lòng nhập đầy đủ thông tin!', 'error');
    return;
  }

  if (password !== passwordConfirm) {
    showAuthMessage('Mật khẩu xác nhận không khớp!', 'error');
    return;
  }

  if (password.length < 6) {
    showAuthMessage('Mật khẩu phải có ít nhất 6 ký tự!', 'error');
    return;
  }

  const btn = document.getElementById('registerBtn');
  btn.disabled = true;
  btn.textContent = 'Đang đăng ký...';

  try {
    const response = await fetch(`${API_URL}/api/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });

    const data = await response.json();

    if (response.ok && data.success) {
      showAuthMessage('✅ Đăng ký thành công! Chuyển sang đăng nhập...', 'success');
      setTimeout(() => {
        authTabs[0].click(); // Switch to login tab
        document.getElementById('loginEmail').value = email;
      }, 2000);
    } else {
      showAuthMessage(`Lỗi: ${data.error || data.detail || 'Đăng ký thất bại'}`, 'error');
    }
  } catch (error) {
    showAuthMessage(`Lỗi kết nối: ${error.message}. Hãy chạy backend trước!`, 'error');
  } finally {
    btn.disabled = false;
    btn.textContent = 'Đăng ký';
  }
});

// ===============================
//  GOOGLE LOGIN
// ===============================
document.getElementById('googleLoginBtn').addEventListener('click', async () => {
  const provider = new GoogleAuthProvider();
  
  try {
    const result = await signInWithPopup(auth, provider);
    const user = result.user;
    
    showAuthMessage('✅ Đăng nhập Google thành công!', 'success');
    
    // Get ID token
    const idToken = await user.getIdToken();
    
    // Verify token with backend
    const res = await fetch(`${API_URL}/api/auth/verify-token`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id_token: idToken })
    });
    
    const data = await res.json();
    
    if (res.ok && data.success) {
      // Update current user
      currentUser = {
        email: user.email,
        localId: user.uid,
        displayName: user.displayName,
        photoUrl: user.photoURL,
        emailVerified: user.emailVerified,
        idToken: idToken
      };
      
      updateAuthButton(currentUser);
      setTimeout(() => hideAuthPopup(), 1500);
    }
  } catch (error) {
    if (error.code === 'auth/popup-closed-by-user') {
      showAuthMessage('Đăng nhập bị hủy', 'error');
    } else {
      showAuthMessage(`Lỗi Google Login: ${error.message}`, 'error');
    }
  }
});

// Verify Email Handler
document.getElementById('verifyEmailBtn').addEventListener('click', async () => {
  if (!currentUser || !currentUser.idToken) {
    showAuthMessage('Không tìm thấy token người dùng', 'error');
    return;
  }

  try {
    const response = await fetch(`${API_URL}/api/auth/send-verification`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id_token: currentUser.idToken })
    });

    const data = await response.json();

    if (response.ok) {
      showAuthMessage('✅ Email xác minh đã được gửi!', 'success');
    } else {
      showAuthMessage(`Lỗi: ${data.detail || 'Không thể gửi email'}`, 'error');
    }
  } catch (error) {
    showAuthMessage(`Lỗi kết nối: ${error.message}`, 'error');
  }
});

// Change Password Handler
document.getElementById('changePasswordBtn').addEventListener('click', async () => {
  if (!currentUser || !currentUser.idToken) {
    showAuthMessage('Không tìm thấy token người dùng', 'error');
    return;
  }

  const newPassword = document.getElementById('newPassword').value;
  const confirmNewPassword = document.getElementById('confirmNewPassword').value;

  if (!newPassword || !confirmNewPassword) {
    showAuthMessage('Vui lòng nhập đầy đủ thông tin!', 'error');
    return;
  }

  if (newPassword !== confirmNewPassword) {
    showAuthMessage('Mật khẩu xác nhận không khớp!', 'error');
    return;
  }

  if (newPassword.length < 6) {
    showAuthMessage('Mật khẩu phải có ít nhất 6 ký tự!', 'error');
    return;
  }

  const btn = document.getElementById('changePasswordBtn');
  btn.disabled = true;
  btn.textContent = 'Đang đổi...';

  try {
    const response = await fetch(`${API_URL}/api/auth/change-password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        id_token: currentUser.idToken,
        new_password: newPassword
      })
    });

    const data = await response.json();

    if (response.ok && data.success) {
      showAuthMessage('✅ Đổi mật khẩu thành công!', 'success');
      // Clear form and hide section
      document.getElementById('newPassword').value = '';
      document.getElementById('confirmNewPassword').value = '';
      setTimeout(() => {
        document.getElementById('changePasswordSection').classList.add('is-hidden');
        document.getElementById('userInfoDisplay').classList.remove('is-hidden');
      }, 1500);
    } else {
      showAuthMessage(`Lỗi: ${data.error || data.detail || 'Đổi mật khẩu thất bại'}`, 'error');
    }
  } catch (error) {
    showAuthMessage(`Lỗi kết nối: ${error.message}`, 'error');
  } finally {
    btn.disabled = false;
    btn.textContent = 'Đổi mật khẩu';
  }
});

// Show Change Password Section
document.getElementById('showChangePasswordBtn').addEventListener('click', () => {
  document.getElementById('userInfoDisplay').classList.add('is-hidden');
  document.getElementById('changePasswordSection').classList.remove('is-hidden');
  hideAuthMessage();
});

// Cancel Change Password
document.getElementById('cancelChangePasswordBtn').addEventListener('click', () => {
  document.getElementById('changePasswordSection').classList.add('is-hidden');
  document.getElementById('userInfoDisplay').classList.remove('is-hidden');
  document.getElementById('newPassword').value = '';
  document.getElementById('confirmNewPassword').value = '';
  hideAuthMessage();
});

// Update User Info UI (displayName, photoUrl)
function updateUserInfoUI() {
  if (!currentUser) return;

  const displayNameEl = document.getElementById('userDisplayName');
  if (displayNameEl) {
    displayNameEl.textContent = currentUser.displayName || 'Chưa đặt tên';
  }

  const photoEl = document.getElementById('userPhoto');
  const photoRowEl = document.getElementById('userPhotoRow');
  if (currentUser.photoUrl && photoEl && photoRowEl) {
    photoEl.src = currentUser.photoUrl;
    photoRowEl.style.display = 'flex';
  } else if (photoRowEl) {
    photoRowEl.style.display = 'none';
  }
}

// Update User Info UI (displayName, photoUrl)
function updateUserInfoUI() {
  if (!currentUser) return;

  const displayNameEl = document.getElementById('userDisplayName');
  if (displayNameEl) {
    displayNameEl.textContent = currentUser.displayName || 'Chưa đặt tên';
  }

  const photoEl = document.getElementById('userPhoto');
  const photoRowEl = document.getElementById('userPhotoRow');
  if (currentUser.photoUrl && photoEl && photoRowEl) {
    photoEl.src = currentUser.photoUrl;
    photoRowEl.style.display = 'flex';
  } else if (photoRowEl) {
    photoRowEl.style.display = 'none';
  }
}

// Update Profile Button Handler - Toggle Section
document.getElementById('updateProfileBtn').addEventListener('click', () => {
  const userInfoDisplay = document.getElementById('userInfoDisplay');
  const changePasswordSection = document.getElementById('changePasswordSection');
  const updateProfileSection = document.getElementById('updateProfileSection');

  // Ẩn các section khác
  userInfoDisplay.classList.add('is-hidden');
  changePasswordSection.classList.add('is-hidden');
  
  // Hiện section update profile
  updateProfileSection.classList.remove('is-hidden');
  
  // Điền dữ liệu hiện tại
  if (currentUser) {
    document.getElementById('profileDisplayName').value = currentUser.displayName || '';
    document.getElementById('profilePhotoURL').value = currentUser.photoUrl || '';
  }
});

// Cancel Profile Button Handler
document.getElementById('cancelProfileBtn').addEventListener('click', () => {
  const userInfoDisplay = document.getElementById('userInfoDisplay');
  const updateProfileSection = document.getElementById('updateProfileSection');
  
  updateProfileSection.classList.add('is-hidden');
  userInfoDisplay.classList.remove('is-hidden');
});
// Save Profile Button Handler
document.getElementById('saveProfileBtn').addEventListener('click', async () => {
  if (!currentUser || !currentUser.idToken) {
    showAuthMessage('Không tìm thấy token người dùng', 'error');
    return;
  }

  const displayName = document.getElementById('profileDisplayName').value.trim();
  const photoUrl = document.getElementById('profilePhotoURL').value.trim();

  if (!displayName && !photoUrl) {
    showAuthMessage('Vui lòng nhập ít nhất một thông tin', 'error');
    return;
  }

  const saveBtn = document.getElementById('saveProfileBtn');
  saveBtn.disabled = true;
  saveBtn.textContent = '⏳ Đang lưu...';

  try {
    const res = await fetch(`${API_URL}/api/auth/update-profile`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        id_token: currentUser.idToken,
        display_name: displayName || null,
        photo_url: photoUrl
      })
    });

    const data = await res.json();

    if (res.ok && data.success) {
      showAuthMessage('✅ Cập nhật hồ sơ thành công!', 'success');

      // Cập nhật thông tin mới
      currentUser.displayName = data.displayName;
      currentUser.photoUrl = data.photoUrl;
      currentUser.idToken = data.idToken;

      // Cập nhật UI
      updateUserInfoUI();
      
      // Quay lại user info
      setTimeout(() => {
        document.getElementById('updateProfileSection').classList.add('is-hidden');
        document.getElementById('userInfoDisplay').classList.remove('is-hidden');
        hideAuthMessage();
      }, 1500);
    } else {
      showAuthMessage(`Lỗi: ${data.error || data.detail || 'Cập nhật thất bại'}`, 'error');
    }
  } catch (error) {
    showAuthMessage(`Lỗi kết nối: ${error.message}`, 'error');
  } finally {
    saveBtn.disabled = false;
    saveBtn.textContent = '💾 Lưu thay đổi';
  }
});

// Logout Handler
document.getElementById('logoutBtn').addEventListener('click', () => {
  updateAuthButton(null);
  hideAuthPopup();
  showAuthMessage('Đã đăng xuất', 'success');
  setTimeout(() => hideAuthMessage(), 2000);
  
  // Reset forms
  document.getElementById('loginEmail').value = '';
  document.getElementById('loginPassword').value = '';
  document.getElementById('registerEmail').value = '';
  document.getElementById('registerPassword').value = '';
  document.getElementById('registerPasswordConfirm').value = '';
  
  // Switch back to login tab
  authTabs[0].click();
});

// Delete Account Handler
document.getElementById('deleteAccountBtn').addEventListener('click', async () => {
  if (!currentUser || !currentUser.idToken) {
    showAuthMessage('Không tìm thấy token người dùng', 'error');
    return;
  }

  const confirmed = confirm('⚠️ BẠN CÓ CHẮC CHẮN MUỐN XÓA TÀI KHOẢN?\n\nHành động này KHÔNG THỂ HOÀN TÁC!');
  if (!confirmed) return;

  const doubleCheck = confirm('Xác nhận lần cuối: Xóa vĩnh viễn tài khoản "' + currentUser.email + '"?');
  if (!doubleCheck) return;

  try {
    const response = await fetch(`${API_URL}/api/auth/delete`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id_token: currentUser.idToken })
    });

    const data = await response.json();

    if (response.ok && data.success) {
      showAuthMessage('✅ Đã xóa tài khoản thành công!', 'success');
      setTimeout(() => {
        updateAuthButton(null);
        hideAuthPopup();
        // Reset forms
        document.getElementById('loginEmail').value = '';
        document.getElementById('loginPassword').value = '';
        document.getElementById('registerEmail').value = '';
        document.getElementById('registerPassword').value = '';
        document.getElementById('registerPasswordConfirm').value = '';
        authTabs[0].click();
      }, 2000);
    } else {
      showAuthMessage(`Lỗi: ${data.error || data.detail || 'Không thể xóa tài khoản'}`, 'error');
    }
  } catch (error) {
    showAuthMessage(`Lỗi kết nối: ${error.message}`, 'error');
  }
});

// Event Listeners
authBtn.addEventListener('click', showAuthPopup);
authCloseBtn.addEventListener('click', hideAuthPopup);
authOverlay.addEventListener('click', hideAuthPopup);

// Prevent closing when clicking inside popup
authPopup.addEventListener('click', (e) => {
  e.stopPropagation();
});

} // End initAuth

// Run when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initAuth);
} else {
  initAuth();
}

})(); // End wrapper


