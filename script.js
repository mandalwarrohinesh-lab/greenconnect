// App State
let currentScreen = 'homeScreen';
let posts = [];
let products = [];
let reportStep = 1;
let currentUser = null;
let authToken = null;
let notifications = [];

// API Base URL
const API_BASE_URL = 'http://localhost:3000/api';

// Initialize App
document.addEventListener('DOMContentLoaded', function() {
    showSplashScreen();
});

function showSplashScreen() {
    // Show splash screen for 3 seconds
    setTimeout(() => {
        const splashScreen = document.getElementById('splashScreen');
        splashScreen.classList.add('hidden');
        
        // Initialize app after splash screen
        setTimeout(() => {
            checkAuthStatus();
            initializeApp();
            loadPosts();
            loadProducts();
            setupEventListeners();
            loadThemePreference();
            initNotificationSystem();
        }, 500);
    }, 3000);
}

// Authentication Functions
async function checkAuthStatus() {
    authToken = localStorage.getItem('authToken');
    const userData = localStorage.getItem('userData');
    
    if (authToken && userData) {
        currentUser = JSON.parse(userData);
        
        // Validate token with server
        try {
            const response = await fetch(`${API_BASE_URL}/users/me`, {
                headers: {
                    'Authorization': `Bearer ${authToken}`
                }
            });
            
            if (response.ok) {
                // Token is valid, update user data
                const data = await response.json();
                currentUser = data;
                localStorage.setItem('userData', JSON.stringify(currentUser));
                updateUIForAuthenticatedUser();
            } else if (response.status === 401) {
                // Token invalid or user not found - clear auth
                console.log('Session expired or user not found');
                localStorage.removeItem('authToken');
                localStorage.removeItem('userData');
                authToken = null;
                currentUser = null;
            }
        } catch (error) {
            console.error('Auth validation error:', error);
            // Keep local auth on network error
            updateUIForAuthenticatedUser();
        }
    } else {
        currentUser = null;
        authToken = null;
    }
}

function updateUIForAuthenticatedUser() {
    // Update profile screen
    renderProfileScreen();
    
    // Update user info in post creation modal
    const userAvatar = document.querySelector('.post-details .user-avatar');
    const username = document.querySelector('.post-details .username');
    
    if (userAvatar && currentUser) {
        userAvatar.src = currentUser.avatar || 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=40&h=40&fit=crop&crop=face';
    }
    if (username && currentUser) {
        username.textContent = currentUser.name || currentUser.email;
    }
}

function renderProfileScreen() {
    const profileContainer = document.getElementById('profileContainer');
    
    if (!currentUser) {
        // Show login prompt
        profileContainer.innerHTML = `
            <div class="login-prompt">
                <div class="login-prompt-icon">
                    <i class="fas fa-user-circle"></i>
                </div>
                <h2>Welcome to GreenConnect</h2>
                <p>Login or create an account to access your profile and start making a difference!</p>
                <button class="auth-btn" onclick="showLoginModal()">
                    <i class="fas fa-sign-in-alt"></i> Login / Sign Up
                </button>
            </div>
        `;
    } else {
        // Show user profile
        profileContainer.innerHTML = `
            <div class="profile-header">
                <div class="profile-avatar">
                    <img src="${currentUser.avatar || 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=100&h=100&fit=crop&crop=face'}" alt="Profile">
                </div>
                <h2>${currentUser.name || currentUser.email}</h2>
                <p class="profile-bio">${currentUser.bio || 'Environmental advocate 🌱 | Making our planet greener'}</p>
            </div>
            
            <div class="profile-stats">
                <div class="stat-item">
                    <span class="stat-number">${currentUser.ecoPoints || 0}</span>
                    <span class="stat-label">Points</span>
                </div>
                <div class="stat-item">
                    <span class="stat-number">${currentUser.reportsCount || 0}</span>
                    <span class="stat-label">Reports</span>
                </div>
                <div class="stat-item">
                    <span class="stat-number">${currentUser.eventsJoined || 0}</span>
                    <span class="stat-label">Drives</span>
                </div>
            </div>

            <div class="achievements-section">
                <h3>🏆 Achievements</h3>
                <div class="achievements-grid">
                    <div class="achievement-badge earned">
                        <i class="fas fa-camera"></i>
                        <span>First Reporter</span>
                    </div>
                    <div class="achievement-badge earned">
                        <i class="fas fa-leaf"></i>
                        <span>Eco Warrior</span>
                    </div>
                    <div class="achievement-badge">
                        <i class="fas fa-users"></i>
                        <span>Community Leader</span>
                    </div>
                </div>
            </div>

            <div class="profile-actions">
                <button class="profile-btn" onclick="editProfile()">
                    <i class="fas fa-edit"></i> Edit Profile
                </button>
                <button class="profile-btn" onclick="openSettings()">
                    <i class="fas fa-cog"></i> Settings
                </button>
            </div>
        `;
    }
}

function showLoginModal() {
    const modal = document.getElementById('authModal');
    modal.classList.add('active');
    switchAuthTab('login');
}

function switchAuthTab(tab) {
    const loginForm = document.getElementById('loginForm');
    const signupForm = document.getElementById('signupForm');
    const tabs = document.querySelectorAll('.auth-tab');
    
    tabs.forEach(t => t.classList.remove('active'));
    
    if (tab === 'login') {
        loginForm.classList.add('active');
        signupForm.classList.remove('active');
        tabs[0].classList.add('active');
        document.getElementById('authModalTitle').textContent = 'Welcome Back!';
    } else {
        signupForm.classList.add('active');
        loginForm.classList.remove('active');
        tabs[1].classList.add('active');
        document.getElementById('authModalTitle').textContent = 'Create Account';
    }
}

async function handleLogin() {
    const email = document.getElementById('loginEmail').value.trim();
    const password = document.getElementById('loginPassword').value;
    
    if (!email || !password) {
        showNotification('Please enter email and password');
        return;
    }
    
    try {
        const response = await fetch(`${API_BASE_URL}/auth/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ email, password })
        });
        
        const data = await response.json();
        
        if (response.ok) {
            authToken = data.token;
            currentUser = data.user;
            
            localStorage.setItem('authToken', authToken);
            localStorage.setItem('userData', JSON.stringify(currentUser));
            
            showNotification('Login successful! Welcome back 🎉');
            closeModal('authModal');
            updateUIForAuthenticatedUser();
            
            // Clear form
            document.getElementById('loginEmail').value = '';
            document.getElementById('loginPassword').value = '';
        } else {
            showNotification(data.message || 'Login failed. Please check your credentials.');
        }
    } catch (error) {
        console.error('Login error:', error);
        showNotification('Login failed. Please try again.');
    }
}

async function confirmVerificationCode() {
    const email = document.getElementById('signupEmail').value.trim();
    const code = document.getElementById('verificationCode').value.trim();
    const statusEl = document.getElementById('verificationStatus');
    const confirmBtn = document.getElementById('confirmCodeBtn');

    if (!code) {
        showNotification('Please enter the verification code');
        return;
    }

    confirmBtn.disabled = true;
    confirmBtn.textContent = 'Checking...';

    try {
        const response = await fetch(`${API_BASE_URL}/auth/verify-code`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, code })
        });

        const data = await response.json();

        if (response.ok) {
            statusEl.textContent = '✅ Email verified!';
            statusEl.style.color = '#2ECC71';
            confirmBtn.textContent = '✓ Confirmed';
            confirmBtn.style.background = '#27AE60';
            showNotification('Email verified successfully! ✅');
        } else {
            statusEl.textContent = '❌ ' + (data.error?.message || 'Invalid code');
            statusEl.style.color = '#e74c3c';
            confirmBtn.disabled = false;
            confirmBtn.textContent = 'Confirm';
            showNotification(data.error?.message || 'Invalid verification code');
        }
    } catch (error) {
        statusEl.textContent = '❌ Verification failed. Try again.';
        statusEl.style.color = '#e74c3c';
        confirmBtn.disabled = false;
        confirmBtn.textContent = 'Confirm';
        showNotification('Verification failed. Please try again.');
    }
}

async function sendVerificationCode() {
    const email = document.getElementById('signupEmail').value.trim();
    const sendBtn = document.getElementById('sendCodeBtn');

    if (!email) {
        showNotification('Please enter your email first');
        return;
    }

    // Basic email format check
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        showNotification('Please enter a valid email address');
        return;
    }

    sendBtn.disabled = true;
    sendBtn.textContent = 'Sending...';

    try {
        const response = await fetch(`${API_BASE_URL}/auth/send-verification`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email })
        });

        const data = await response.json();

        if (response.ok) {
            // Show verification code input
            document.getElementById('verificationCodeGroup').style.display = 'block';
            document.getElementById('verificationStatus').textContent = '';
            document.getElementById('verificationStatus').style.color = '';
            showNotification('Verification code sent to your email! 📧');

            // Start 60s cooldown on button
            let countdown = 60;
            sendBtn.textContent = `Resend (${countdown}s)`;
            const timer = setInterval(() => {
                countdown--;
                sendBtn.textContent = `Resend (${countdown}s)`;
                if (countdown <= 0) {
                    clearInterval(timer);
                    sendBtn.disabled = false;
                    sendBtn.textContent = 'Resend';
                }
            }, 1000);
        } else {
            showNotification(data.error?.message || 'Failed to send code');
            sendBtn.disabled = false;
            sendBtn.textContent = 'Send Code';
        }
    } catch (error) {
        console.error('Send code error:', error);
        showNotification('Failed to send code. Please try again.');
        sendBtn.disabled = false;
        sendBtn.textContent = 'Send Code';
    }
}

async function handleSignup() {
    const name = document.getElementById('signupName').value.trim();
    const email = document.getElementById('signupEmail').value.trim();
    const password = document.getElementById('signupPassword').value;
    const bio = document.getElementById('signupBio').value.trim();
    const code = document.getElementById('verificationCode').value.trim();
    const statusEl = document.getElementById('verificationStatus');

    if (!name || !email || !password) {
        showNotification('Please fill in all required fields');
        return;
    }

    if (password.length < 6) {
        showNotification('Password must be at least 6 characters');
        return;
    }

    if (!code) {
        showNotification('Please enter the verification code sent to your email');
        document.getElementById('verificationCodeGroup').style.display = 'block';
        return;
    }

    // Check if email was already confirmed via the Confirm button
    const confirmBtn = document.getElementById('confirmCodeBtn');
    const alreadyVerified = confirmBtn && confirmBtn.textContent === '✓ Confirmed';

    if (!alreadyVerified) {
        showNotification('Please confirm your verification code first');
        return;
    }

    // First verify the code
    try {
        const verifyResponse = await fetch(`${API_BASE_URL}/auth/verify-code`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, code })
        });

        const verifyData = await verifyResponse.json();

        if (!verifyResponse.ok) {
            statusEl.textContent = '❌ ' + (verifyData.error?.message || 'Invalid code');
            statusEl.style.color = '#e74c3c';
            showNotification(verifyData.error?.message || 'Invalid verification code');
            return;
        }

        statusEl.textContent = '✅ Email verified!';
        statusEl.style.color = '#2ECC71';

    } catch (error) {
        showNotification('Verification failed. Please try again.');
        return;
    }

    // Now register
    try {
        const response = await fetch(`${API_BASE_URL}/auth/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name, email, password, bio })
        });

        const data = await response.json();

        if (response.ok) {
            authToken = data.token;
            currentUser = data.user;

            localStorage.setItem('authToken', authToken);
            localStorage.setItem('userData', JSON.stringify(currentUser));

            showNotification('Account created successfully! Welcome to GreenConnect 🎉');
            closeModal('authModal');
            updateUIForAuthenticatedUser();

            // Clear form
            document.getElementById('signupName').value = '';
            document.getElementById('signupEmail').value = '';
            document.getElementById('signupPassword').value = '';
            document.getElementById('signupBio').value = '';
            document.getElementById('verificationCode').value = '';
            document.getElementById('verificationCodeGroup').style.display = 'none';
            if (statusEl) statusEl.textContent = '';
            const confirmBtn = document.getElementById('confirmCodeBtn');
            if (confirmBtn) { confirmBtn.disabled = false; confirmBtn.textContent = 'Confirm'; confirmBtn.style.background = ''; }
        } else {
            showNotification(data.error?.message || data.message || 'Signup failed. Please try again.');
        }
    } catch (error) {
        console.error('Signup error:', error);
        showNotification('Signup failed. Please try again.');
    }
}

function logout() {
    if (confirm('Are you sure you want to logout?')) {
        localStorage.removeItem('authToken');
        localStorage.removeItem('userData');
        authToken = null;
        currentUser = null;
        
        showNotification('Logged out successfully');
        closeModal('settingsModal');
        renderProfileScreen();
        
        // Redirect to home screen
        showScreen('homeScreen');
        const navItems = document.querySelectorAll('.nav-item');
        navItems.forEach(item => item.classList.remove('active'));
        navItems[0].classList.add('active');
    }
}

function editProfile() {
    if (!currentUser) {
        showLoginModal();
        return;
    }
    
    // Populate form with current data
    document.getElementById('editName').value = currentUser.name || '';
    document.getElementById('editEmail').value = currentUser.email || '';
    document.getElementById('editBio').value = currentUser.bio || '';
    
    // Set profile picture preview
    const profilePreviewImage = document.getElementById('profilePreviewImage');
    if (profilePreviewImage) {
        profilePreviewImage.src = currentUser.avatar || 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=100&h=100&fit=crop&crop=face';
    }
    
    // Store current avatar in a temporary variable
    window.selectedProfileImage = currentUser.avatar || null;
    
    const modal = document.getElementById('editProfileModal');
    modal.classList.add('active');
}

// Open camera for profile picture
function openProfileCamera() {
    // Check if device supports camera
    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        // Create a temporary modal for camera
        const cameraModal = document.createElement('div');
        cameraModal.className = 'modal active';
        cameraModal.id = 'profileCameraModal';
        cameraModal.innerHTML = `
            <div class="modal-content" style="max-width: 500px;">
                <div class="modal-header">
                    <h3>Take Profile Photo</h3>
                    <button class="close-btn" onclick="closeProfileCamera()">&times;</button>
                </div>
                <div style="padding: 20px;">
                    <video id="profileCameraVideo" autoplay playsinline style="width: 100%; border-radius: 15px; background: #000;"></video>
                    <div style="display: flex; gap: 10px; margin-top: 20px; justify-content: center;">
                        <button onclick="captureProfilePhoto()" class="camera-btn" style="background: #2ECC71; color: white; border: none; padding: 12px 24px; border-radius: 25px; cursor: pointer; font-weight: 600;">
                            <i class="fas fa-camera"></i> Capture
                        </button>
                        <button onclick="closeProfileCamera()" class="camera-btn" style="background: #e74c3c; color: white; border: none; padding: 12px 24px; border-radius: 25px; cursor: pointer; font-weight: 600;">
                            <i class="fas fa-times"></i> Cancel
                        </button>
                    </div>
                </div>
            </div>
        `;
        
        document.body.appendChild(cameraModal);
        
        const video = document.getElementById('profileCameraVideo');
        
        // Request camera access
        navigator.mediaDevices.getUserMedia({ 
            video: { 
                facingMode: 'user' // Use front camera for selfie
            } 
        })
        .then(function(stream) {
            window.profileCameraStream = stream;
            video.srcObject = stream;
            showNotification('Camera ready! 📸');
        })
        .catch(function(error) {
            console.error('Camera error:', error);
            showNotification('Camera access denied. Using file picker instead.');
            closeProfileCamera();
            openProfileGallery();
        });
    } else {
        // Fallback to file input
        openProfileGallery();
    }
}

// Capture photo from camera stream
function captureProfilePhoto() {
    const video = document.getElementById('profileCameraVideo');
    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    
    const context = canvas.getContext('2d');
    context.drawImage(video, 0, 0, canvas.width, canvas.height);
    
    // Convert canvas to data URL
    const imageDataUrl = canvas.toDataURL('image/jpeg', 0.9);
    
    // Update profile picture preview
    updateProfilePicturePreview(imageDataUrl);
    
    // Close camera modal
    closeProfileCamera();
    
    showNotification('Photo captured! ✨');
}

// Close profile camera modal
function closeProfileCamera() {
    if (window.profileCameraStream) {
        window.profileCameraStream.getTracks().forEach(track => track.stop());
        window.profileCameraStream = null;
    }
    
    const cameraModal = document.getElementById('profileCameraModal');
    if (cameraModal) {
        cameraModal.remove();
    }
}

// Open gallery for profile picture
function openProfileGallery() {
    const fileInput = document.createElement('input');
    fileInput.type = 'file';
    fileInput.accept = 'image/*';
    
    fileInput.onchange = function(e) {
        const file = e.target.files[0];
        if (file) {
            // Validate file type
            if (!file.type.startsWith('image/')) {
                showNotification('Please select an image file');
                return;
            }
            
            // Validate file size (max 5MB)
            if (file.size > 5 * 1024 * 1024) {
                showNotification('Image size must be less than 5MB');
                return;
            }
            
            // Read the file
            const reader = new FileReader();
            
            reader.onload = function(e) {
                const imageDataUrl = e.target.result;
                updateProfilePicturePreview(imageDataUrl);
                showNotification('Photo selected! ✨');
            };
            
            reader.onerror = function() {
                showNotification('Failed to read image file');
            };
            
            reader.readAsDataURL(file);
        }
    };
    
    fileInput.click();
}

// Update profile picture preview
function updateProfilePicturePreview(imageDataUrl) {
    const profilePreviewImage = document.getElementById('profilePreviewImage');
    if (profilePreviewImage) {
        profilePreviewImage.src = imageDataUrl;
    }
    
    // Store the image data for saving
    window.selectedProfileImage = imageDataUrl;
}

async function saveProfile() {
    if (!currentUser || !authToken) {
        showNotification('Please login first');
        return;
    }
    
    const name = document.getElementById('editName').value.trim();
    const bio = document.getElementById('editBio').value.trim();
    const avatar = window.selectedProfileImage || currentUser.avatar || '';
    
    if (!name) {
        showNotification('Name is required');
        return;
    }
    
    try {
        const response = await fetch(`${API_BASE_URL}/users/me`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${authToken}`
            },
            body: JSON.stringify({ name, bio, avatar })
        });
        
        const data = await response.json();
        
        if (response.ok) {
            currentUser = { ...currentUser, ...data.user };
            localStorage.setItem('userData', JSON.stringify(currentUser));
            
            showNotification('Profile updated successfully! ✨');
            closeModal('editProfileModal');
            updateUIForAuthenticatedUser();
        } else if (response.status === 401) {
            // User not found or token invalid - logout and show login
            const errorMessage = data.error?.message || 'Session expired';
            showNotification(`${errorMessage}. Please login again.`);
            
            // Clear auth data
            localStorage.removeItem('authToken');
            localStorage.removeItem('userData');
            authToken = null;
            currentUser = null;
            
            // Close modal and show login
            closeModal('editProfileModal');
            renderProfileScreen();
            showLoginModal();
        } else {
            // Handle other error response structure: { error: { message: '...' } }
            const errorMessage = data.error?.message || data.message || 'Failed to update profile';
            showNotification(errorMessage);
        }
    } catch (error) {
        console.error('Update profile error:', error);
        showNotification('Failed to update profile. Please try again.');
    }
}

function openSettings() {
    if (!currentUser) {
        showLoginModal();
        return;
    }
    
    const modal = document.getElementById('settingsModal');
    modal.classList.add('active');
}

// Notification Settings Functions
function openNotificationSettings() {
    closeModal('settingsModal');
    const modal = document.getElementById('notificationSettingsModal');
    modal.classList.add('active');
    loadNotificationSettings();
}

function loadNotificationSettings() {
    // Load saved notification settings from localStorage
    const settings = JSON.parse(localStorage.getItem('notificationSettings') || '{}');
    
    // Set checkbox states
    document.getElementById('enableNotifications').checked = settings.enableNotifications !== false;
    document.getElementById('likesComments').checked = settings.likesComments !== false;
    document.getElementById('newFollowers').checked = settings.newFollowers !== false;
    document.getElementById('eventReminders').checked = settings.eventReminders !== false;
    document.getElementById('issueUpdates').checked = settings.issueUpdates !== false;
    document.getElementById('ecoPoints').checked = settings.ecoPoints !== false;
    document.getElementById('weeklySummary').checked = settings.weeklySummary === true;
    document.getElementById('newsletter').checked = settings.newsletter === true;
}

function toggleNotificationSetting(settingName) {
    const checkbox = document.getElementById(settingName);
    const settings = JSON.parse(localStorage.getItem('notificationSettings') || '{}');
    
    settings[settingName] = checkbox.checked;
    localStorage.setItem('notificationSettings', JSON.stringify(settings));
    
    showNotification(checkbox.checked ? `${settingName} enabled ✓` : `${settingName} disabled`);
}

// Privacy Settings Functions
function openPrivacySettings() {
    closeModal('settingsModal');
    const modal = document.getElementById('privacySettingsModal');
    modal.classList.add('active');
    loadPrivacySettings();
}

function loadPrivacySettings() {
    // Load saved privacy settings from localStorage
    const settings = JSON.parse(localStorage.getItem('privacySettings') || '{}');
    
    // Set checkbox states
    document.getElementById('privateAccount').checked = settings.privateAccount === true;
    document.getElementById('activityStatus').checked = settings.activityStatus !== false;
    document.getElementById('shareLocation').checked = settings.shareLocation !== false;
    document.getElementById('preciseLocation').checked = settings.preciseLocation === true;
    document.getElementById('allowComments').checked = settings.allowComments !== false;
    document.getElementById('allowSharing').checked = settings.allowSharing !== false;
    document.getElementById('analytics').checked = settings.analytics !== false;
}

function togglePrivacySetting(settingName) {
    const checkbox = document.getElementById(settingName);
    const settings = JSON.parse(localStorage.getItem('privacySettings') || '{}');
    
    settings[settingName] = checkbox.checked;
    localStorage.setItem('privacySettings', JSON.stringify(settings));
    
    showNotification(checkbox.checked ? `${settingName} enabled ✓` : `${settingName} disabled`);
}

function confirmDeleteAccount() {
    if (confirm('⚠️ Are you sure you want to delete your account?\n\nThis action cannot be undone. All your data will be permanently deleted.')) {
        if (confirm('This is your last chance. Delete account permanently?')) {
            // In a real app, this would call the backend API to delete the account
            showNotification('Account deletion requested. Processing...');
            setTimeout(() => {
                logout();
                showNotification('Account deleted successfully');
            }, 2000);
        }
    }
}

// About App Functions
function openAboutApp() {
    closeModal('settingsModal');
    const modal = document.getElementById('aboutAppModal');
    modal.classList.add('active');
}

function initializeApp() {
    // Show home screen by default
    showScreen('homeScreen');
    
    // Add smooth animations
    document.body.style.opacity = '0';
    setTimeout(() => {
        document.body.style.transition = 'opacity 0.5s ease';
        document.body.style.opacity = '1';
    }, 100);
    
    // Initialize pull-to-refresh
    initPullToRefresh();
}

// Refresh App Function (called by pull-to-refresh)
async function refreshApp() {
    showNotification('Refreshing... 🔄');
    
    try {
        // Reload posts
        await loadPosts();
        
        // Reload products
        loadProducts();
        
        // Update notification badge
        updateNotificationBadge();
        
        // Check for nearby issues if user is logged in
        if (currentUser) {
            checkNearbyIssues();
        }
        
        // Update profile if on profile screen
        if (currentScreen === 'profileScreen') {
            renderProfileScreen();
        }
        
        showNotification('Refreshed successfully! ✨');
    } catch (error) {
        console.error('Refresh error:', error);
        showNotification('Failed to refresh. Please try again.');
    }
}

// Pull to Refresh Functionality
function initPullToRefresh() {
    let startY = 0;
    let currentY = 0;
    let pulling = false;
    const threshold = 80; // Pull distance threshold
    const mainContent = document.getElementById('mainContent');
    const indicator = document.getElementById('pullToRefreshIndicator');
    const refreshText = indicator.querySelector('.refresh-text');
    
    // Touch start
    mainContent.addEventListener('touchstart', (e) => {
        // Only activate if at top of page
        if (mainContent.scrollTop === 0) {
            startY = e.touches[0].pageY;
            pulling = true;
        }
    }, { passive: true });
    
    // Touch move
    mainContent.addEventListener('touchmove', (e) => {
        if (!pulling) return;
        
        currentY = e.touches[0].pageY;
        const pullDistance = currentY - startY;
        
        // Only show indicator if pulling down
        if (pullDistance > 0) {
            const progress = Math.min(pullDistance / threshold, 1);
            
            // Show indicator
            indicator.style.top = `${-80 + (pullDistance * 0.5)}px`;
            
            // Update text based on progress
            if (progress >= 1) {
                refreshText.textContent = 'Release to refresh';
                indicator.classList.add('ready');
            } else {
                refreshText.textContent = 'Pull to refresh';
                indicator.classList.remove('ready');
            }
        }
    }, { passive: true });
    
    // Touch end
    mainContent.addEventListener('touchend', async (e) => {
        if (!pulling) return;
        
        const pullDistance = currentY - startY;
        
        // If pulled enough, trigger refresh
        if (pullDistance >= threshold) {
            indicator.classList.add('refreshing');
            refreshText.textContent = 'Refreshing...';
            
            // Trigger refresh
            await refreshApp();
            
            // Hide indicator after refresh
            setTimeout(() => {
                indicator.style.top = '-80px';
                indicator.classList.remove('refreshing', 'ready');
                refreshText.textContent = 'Pull to refresh';
            }, 500);
        } else {
            // Reset indicator
            indicator.style.top = '-80px';
            indicator.classList.remove('ready');
        }
        
        pulling = false;
        startY = 0;
        currentY = 0;
    }, { passive: true });
}

// Theme Toggle Functions
function toggleTheme() {
    const body = document.body;
    const themeIcon = document.getElementById('themeIcon');
    
    if (body.classList.contains('light-mode')) {
        // Switch to dark mode
        body.classList.remove('light-mode');
        themeIcon.classList.remove('fa-sun');
        themeIcon.classList.add('fa-moon');
        localStorage.setItem('theme', 'dark');
        showNotification('Dark mode activated 🌙');
    } else {
        // Switch to light mode
        body.classList.add('light-mode');
        themeIcon.classList.remove('fa-moon');
        themeIcon.classList.add('fa-sun');
        localStorage.setItem('theme', 'light');
        showNotification('Light mode activated ☀️');
    }
}

function loadThemePreference() {
    const savedTheme = localStorage.getItem('theme');
    const body = document.body;
    const themeIcon = document.getElementById('themeIcon');
    
    if (savedTheme === 'light') {
        body.classList.add('light-mode');
        themeIcon.classList.remove('fa-moon');
        themeIcon.classList.add('fa-sun');
    } else {
        body.classList.remove('light-mode');
        themeIcon.classList.remove('fa-sun');
        themeIcon.classList.add('fa-moon');
    }
}

function setupEventListeners() {
    // Bottom navigation
    const navItems = document.querySelectorAll('.nav-item');
    navItems.forEach(item => {
        item.addEventListener('click', function() {
            const screenId = this.getAttribute('data-screen');
            showScreen(screenId);
            updateActiveNav(this);
        });
    });

    // Search functionality
    const searchInput = document.getElementById('searchInput');
    if (searchInput) {
        searchInput.addEventListener('input', handleSearch);
    }

    // Filter buttons
    const filterBtns = document.querySelectorAll('.filter-btn');
    filterBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            updateActiveFilter(this);
            handleFilter(this.getAttribute('data-filter'));
        });
    });

    // Category buttons
    const categoryBtns = document.querySelectorAll('.category-btn');
    categoryBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            updateActiveCategory(this);
            filterProducts(this.textContent);
        });
    });

    // Add ripple effect to buttons
    addRippleEffect();
}

function showScreen(screenId) {
    // Hide all screens
    const screens = document.querySelectorAll('.screen');
    screens.forEach(screen => {
        screen.classList.remove('active');
    });

    // Show selected screen
    const targetScreen = document.getElementById(screenId);
    if (targetScreen) {
        targetScreen.classList.add('active');
        currentScreen = screenId;
        
        // Render profile screen when it's shown
        if (screenId === 'profileScreen') {
            renderProfileScreen();
        }
        
        // Add entrance animation
        targetScreen.style.transform = 'translateY(20px)';
        targetScreen.style.opacity = '0';
        setTimeout(() => {
            targetScreen.style.transition = 'all 0.3s ease';
            targetScreen.style.transform = 'translateY(0)';
            targetScreen.style.opacity = '1';
        }, 50);
    }
}

function updateActiveNav(activeItem) {
    const navItems = document.querySelectorAll('.nav-item');
    navItems.forEach(item => item.classList.remove('active'));
    activeItem.classList.add('active');
}

function updateActiveFilter(activeBtn) {
    const filterBtns = document.querySelectorAll('.filter-btn');
    filterBtns.forEach(btn => btn.classList.remove('active'));
    activeBtn.classList.add('active');
}

function updateActiveCategory(activeBtn) {
    const categoryBtns = document.querySelectorAll('.category-btn');
    categoryBtns.forEach(btn => btn.classList.remove('active'));
    activeBtn.classList.add('active');
}

// Load Posts Data
async function loadPosts() {
    try {
        const response = await fetch(`${API_BASE_URL}/posts/feed`, {
            headers: authToken ? {
                'Authorization': `Bearer ${authToken}`
            } : {}
        });
        
        if (response.ok) {
            const data = await response.json();
            posts = data.posts || [];
        } else {
            posts = [];
        }
    } catch (error) {
        console.error('Error loading posts:', error);
        posts = [];
    }
    
    renderPosts();
}

function renderPosts() {
    const postsFeed = document.getElementById('postsFeed');
    if (!postsFeed) return;

    if (posts.length === 0) {
        postsFeed.innerHTML = `
            <div class="empty-feed">
                <div class="empty-icon">📱</div>
                <h3>No posts yet</h3>
                <p>Be the first to share your environmental journey!</p>
                <button class="auth-btn" onclick="openCamera()" style="max-width: 250px; margin: 20px auto;">
                    <i class="fas fa-plus"></i> Create Your First Post
                </button>
            </div>
        `;
        return;
    }

    postsFeed.innerHTML = posts.map(post => `
        <div class="post-card" data-post-id="${post.id}">
            <div class="post-header">
                <img src="${post.user.avatar}" alt="${post.user.name}" class="post-avatar">
                <div class="post-user-info">
                    <h4>${post.user.name}</h4>
                    <p class="post-location">📍 ${post.user.location}</p>
                </div>
            </div>
            <img src="${post.image}" alt="Post image" class="post-image" ondblclick="toggleLike(${post.id})">
            <div class="post-actions">
                <button class="action-btn ${post.liked ? 'liked' : ''}" onclick="toggleLike(${post.id})">
                    <i class="fas fa-heart"></i>
                </button>
                <button class="action-btn" onclick="openComments(${post.id})">
                    <i class="fas fa-comment"></i>
                </button>
                <button class="action-btn" onclick="sharePost(${post.id})">
                    <i class="fas fa-share"></i>
                </button>
            </div>
            <div class="post-likes">${post.likes.toLocaleString()} likes</div>
            <div class="post-caption">
                <span class="post-username">${post.user.name}</span>
                ${post.caption}
            </div>
        </div>
    `).join('');
}

// Load Products Data
function loadProducts() {
    products = [
        {
            id: 1,
            name: 'Bamboo Water Bottle',
            price: 150,
            category: 'Reusable',
            image: '🥤',
            description: 'Eco-friendly bamboo water bottle',
            rating: 4.8,
            popular: true
        },
        {
            id: 2,
            name: 'Organic Cotton Tote',
            price: 80,
            category: 'Organic',
            image: '👜',
            description: 'Sustainable cotton shopping bag',
            rating: 4.7,
            popular: false
        },
        {
            id: 3,
            name: 'Solar Power Bank',
            price: 300,
            category: 'Eco Home',
            image: '🔋',
            description: 'Solar-powered portable charger',
            rating: 4.9,
            popular: true
        },
        {
            id: 4,
            name: 'Reusable Food Wraps',
            price: 60,
            category: 'Reusable',
            image: '🥪',
            description: 'Beeswax food storage wraps',
            rating: 4.6,
            popular: false
        },
        {
            id: 5,
            name: 'Bamboo Toothbrush Set',
            price: 45,
            category: 'Organic',
            image: '🪥',
            description: 'Set of 4 bamboo toothbrushes',
            rating: 4.5,
            popular: false
        },
        {
            id: 6,
            name: 'LED Smart Bulbs',
            price: 120,
            category: 'Eco Home',
            image: '💡',
            description: 'Energy-efficient smart lighting',
            rating: 4.8,
            popular: true
        },
        {
            id: 7,
            name: 'Compost Bin',
            price: 200,
            category: 'Eco Home',
            image: '🗂️',
            description: 'Indoor composting solution',
            rating: 4.4,
            popular: false
        },
        {
            id: 8,
            name: 'Eco Cleaning Kit',
            price: 90,
            category: 'Reusable',
            image: '🧽',
            description: 'Natural cleaning supplies bundle',
            rating: 4.7,
            popular: true
        }
    ];

    renderProducts();
}

function renderProducts(filteredProducts = products) {
    const productsGrid = document.getElementById('productsGrid');
    if (!productsGrid) return;

    productsGrid.innerHTML = filteredProducts.map(product => `
        <div class="product-card" onclick="viewProduct(${product.id})">
            <div class="product-image">${product.image}</div>
            <div class="product-name">${product.name}</div>
            <div class="product-rating">
                ${'⭐'.repeat(Math.floor(product.rating))} ${product.rating}
            </div>
            <div class="product-price">🍃 ${product.price} points</div>
            ${product.popular ? '<div class="popular-badge">🔥 Popular</div>' : ''}
        </div>
    `).join('');
}

// Interactive Functions
function toggleLike(postId) {
    const post = posts.find(p => p.id === postId);
    if (post) {
        post.liked = !post.liked;
        post.likes += post.liked ? 1 : -1;
        
        // Add heart animation
        if (post.liked) {
            showHeartAnimation();
            
            // Simulate notification for post owner (for demo purposes)
            // In real app, this would be sent from backend when someone likes your post
            if (currentUser && post.user.name !== currentUser.name) {
                // This would normally be received by the post owner
                setTimeout(() => {
                    notifyPostLike(postId, currentUser.name);
                }, 1000);
            }
        }
        
        renderPosts();
    }
}

function showHeartAnimation() {
    const heart = document.createElement('div');
    heart.innerHTML = '❤️';
    heart.style.cssText = `
        position: fixed;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        font-size: 60px;
        z-index: 1000;
        pointer-events: none;
        animation: heartPop 0.8s ease;
    `;
    
    document.body.appendChild(heart);
    
    setTimeout(() => {
        document.body.removeChild(heart);
    }, 800);
}

function openComments(postId) {
    // Simulate opening comments
    showNotification('Comments feature coming soon!');
}

function sharePost(postId) {
    // Simulate sharing
    showNotification('Post shared successfully!');
}

function viewProduct(productId) {
    const product = products.find(p => p.id === productId);
    if (product) {
        showNotification(`Viewing ${product.name} - ${product.price} points`);
    }
}

function viewStory(username) {
    showNotification(`Viewing ${username}'s story`);
    // Here you would implement story viewing functionality
    // For now, just show a notification
}

function filterProducts(category) {
    if (category === 'All') {
        renderProducts();
    } else {
        const filtered = products.filter(p => p.category === category);
        renderProducts(filtered);
    }
}

// Camera and Report Functions
function openCamera() {
    const modal = document.getElementById('cameraModal');
    modal.classList.add('active');
    
    // Reset to first step
    showCreationStep('photoStep');
    resetPostForm();
}

function captureNewPhoto() {
    // Check if device supports camera
    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        // Try to open camera using MediaDevices API
        openCameraStream();
    } else {
        // Fallback to file input with camera capture
        const fileInput = document.createElement('input');
        fileInput.type = 'file';
        fileInput.accept = 'image/*';
        fileInput.capture = 'environment'; // This tells mobile devices to use camera
        
        fileInput.onchange = function(e) {
            const file = e.target.files[0];
            if (file) {
                handlePhotoSelected(file);
            }
        };
        
        fileInput.click();
    }
}

function openCameraStream() {
    const preview = document.getElementById('cameraPreview');
    
    // Create video element for camera stream
    preview.innerHTML = `
        <video id="cameraVideo" autoplay playsinline style="width: 100%; height: 100%; object-fit: cover; border-radius: 10px;"></video>
        <div style="position: absolute; bottom: 20px; left: 50%; transform: translateX(-50%); display: flex; gap: 15px;">
            <button onclick="captureFromStream()" class="camera-btn" style="background: #2ECC71; color: white; border: none; padding: 15px 30px; border-radius: 50px; cursor: pointer; font-weight: 600;">
                <i class="fas fa-camera"></i> Capture
            </button>
            <button onclick="closeCameraStream()" class="camera-btn" style="background: #e74c3c; color: white; border: none; padding: 15px 30px; border-radius: 50px; cursor: pointer; font-weight: 600;">
                <i class="fas fa-times"></i> Cancel
            </button>
        </div>
    `;
    
    const video = document.getElementById('cameraVideo');
    
    // Request camera access
    navigator.mediaDevices.getUserMedia({ 
        video: { 
            facingMode: 'environment' // Use back camera on mobile
        } 
    })
    .then(function(stream) {
        window.currentCameraStream = stream;
        video.srcObject = stream;
        showNotification('Camera ready! 📸');
    })
    .catch(function(error) {
        console.error('Camera error:', error);
        showNotification('Camera access denied. Using file picker instead.');
        closeCameraStream();
        // Fallback to file input
        const fileInput = document.createElement('input');
        fileInput.type = 'file';
        fileInput.accept = 'image/*';
        fileInput.capture = 'environment';
        fileInput.onchange = function(e) {
            const file = e.target.files[0];
            if (file) {
                handlePhotoSelected(file);
            }
        };
        fileInput.click();
    });
}

function captureFromStream() {
    const video = document.getElementById('cameraVideo');
    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    
    const context = canvas.getContext('2d');
    context.drawImage(video, 0, 0, canvas.width, canvas.height);
    
    // Convert canvas to blob
    canvas.toBlob(function(blob) {
        // Create a file from the blob
        const file = new File([blob], 'camera-photo.jpg', { type: 'image/jpeg' });
        
        // Stop camera stream
        closeCameraStream();
        
        // Handle the captured photo
        handlePhotoSelected(file);
    }, 'image/jpeg', 0.95);
}

function closeCameraStream() {
    if (window.currentCameraStream) {
        window.currentCameraStream.getTracks().forEach(track => track.stop());
        window.currentCameraStream = null;
    }
    
    // Reset preview
    const preview = document.getElementById('cameraPreview');
    preview.innerHTML = `
        <i class="fas fa-camera camera-icon"></i>
        <p>Tap to capture or upload image</p>
    `;
}

function uploadNewPhoto() {
    // Create a file input for gallery selection
    const fileInput = document.createElement('input');
    fileInput.type = 'file';
    fileInput.accept = 'image/*';
    
    fileInput.onchange = function(e) {
        const file = e.target.files[0];
        if (file) {
            handlePhotoSelected(file);
        }
    };
    
    fileInput.click();
}

function handlePhotoSelected(file) {
    // Validate file type
    if (!file.type.startsWith('image/')) {
        showNotification('Please select an image file');
        return;
    }
    
    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
        showNotification('Image size must be less than 5MB');
        return;
    }
    
    // Read the file and display preview
    const reader = new FileReader();
    
    reader.onload = function(e) {
        const imageUrl = e.target.result;
        
        // Update camera preview
        const preview = document.getElementById('cameraPreview');
        preview.innerHTML = `<img src="${imageUrl}" alt="Selected photo" style="width: 100%; height: 100%; object-fit: cover; border-radius: 10px;">`;
        preview.classList.add('has-image');
        
        // Update preview in details step
        const previewImage = document.querySelector('#previewImage img');
        previewImage.src = imageUrl;
        previewImage.style.display = 'block';
        document.querySelector('.placeholder-preview').style.display = 'none';
        
        // Store the image data for later use
        window.selectedImageData = imageUrl;
        
        showNotification('Photo selected! ✨');
        
        // Move to details step
        setTimeout(() => {
            showCreationStep('detailsStep');
        }, 500);
    };
    
    reader.onerror = function() {
        showNotification('Failed to read image file');
    };
    
    reader.readAsDataURL(file);
}

function simulatePhotoSelected() {
    // Simulate photo selection and move to details step
    const preview = document.getElementById('cameraPreview');
    preview.innerHTML = `
        <img src="https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?w=300&h=300&fit=crop" alt="Selected photo">
    `;
    preview.classList.add('has-image');
    
    // Update preview in details step
    const previewImage = document.querySelector('#previewImage img');
    previewImage.src = 'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?w=120&h=120&fit=crop';
    previewImage.style.display = 'block';
    document.querySelector('.placeholder-preview').style.display = 'none';
    
    // Move to details step
    setTimeout(() => {
        showCreationStep('detailsStep');
    }, 1000);
}

function showCreationStep(stepId) {
    // Hide all steps
    const steps = document.querySelectorAll('.creation-step');
    steps.forEach(step => step.classList.remove('active'));
    
    // Show selected step
    document.getElementById(stepId).classList.add('active');
    
    // Update share button state
    const shareBtn = document.querySelector('.share-btn');
    if (stepId === 'detailsStep') {
        shareBtn.disabled = false;
    } else {
        shareBtn.disabled = true;
    }
}

function resetPostForm() {
    // Reset form fields
    document.getElementById('postCaption').value = '';
    document.getElementById('locationInput').value = '';
    document.getElementById('captionCount').textContent = '0';
    
    // Reset preview
    const preview = document.getElementById('cameraPreview');
    preview.innerHTML = `
        <i class="fas fa-camera camera-icon"></i>
        <p>Tap to capture or upload image</p>
    `;
    preview.classList.remove('has-image');
    
    // Reset details preview
    const previewImage = document.querySelector('#previewImage img');
    previewImage.style.display = 'none';
    document.querySelector('.placeholder-preview').style.display = 'flex';
}

function shareNewPost() {
    const caption = document.getElementById('postCaption').value;
    const location = document.getElementById('locationInput').value;
    
    if (!caption.trim()) {
        showNotification('Please add a caption to your post');
        return;
    }
    
    // Simulate post creation
    showNotification('Post shared successfully! 🎉');
    closeModal('cameraModal');
    
    // Add new post to feed (simulate)
    addNewPostToFeed(caption, location);
}

function addNewPostToFeed(caption, location) {
    const newPost = {
        id: posts.length + 1,
        user: {
            name: 'Sarah Johnson',
            avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=100&h=100&fit=crop&crop=face',
            location: location || 'Current Location'
        },
        image: 'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?w=400&h=400&fit=crop',
        caption: caption,
        likes: 0,
        liked: false,
        comments: 0,
        timestamp: 'Just now'
    };
    
    posts.unshift(newPost);
    renderPosts();
}

function getCurrentLocation() {
    showNotification('Getting current location...');
    setTimeout(() => {
        document.getElementById('locationInput').value = 'Central Park, NYC';
        showNotification('Location updated');
    }, 1500);
}

function selectLocation(location) {
    document.getElementById('locationInput').value = location;
    showNotification(`Location set to ${location}`);
}

// Caption counter
document.addEventListener('DOMContentLoaded', function() {
    const captionInput = document.getElementById('postCaption');
    if (captionInput) {
        captionInput.addEventListener('input', function() {
            const count = this.value.length;
            document.getElementById('captionCount').textContent = count;
            
            // Change color when approaching limit
            const counter = document.getElementById('captionCount');
            if (count > 450) {
                counter.style.color = '#e74c3c';
            } else if (count > 400) {
                counter.style.color = '#f39c12';
            } else {
                counter.style.color = '#888';
            }
        });
    }
});

function capturePhoto() {
    // Check if device supports camera
    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        // Request camera access
        navigator.mediaDevices.getUserMedia({ 
            video: { facingMode: 'environment' } 
        })
        .then(function(stream) {
            showNotification('Camera opened! 📸');
            // In a real implementation, you would show the camera stream
            // For now, we'll simulate and move to next step
            stream.getTracks().forEach(track => track.stop());
            nextReportStep();
        })
        .catch(function(error) {
            console.error('Camera error:', error);
            showNotification('Camera access denied. Please allow camera access.');
        });
    } else {
        // Fallback to file input
        const fileInput = document.createElement('input');
        fileInput.type = 'file';
        fileInput.accept = 'image/*';
        fileInput.capture = 'environment';
        
        fileInput.onchange = function(e) {
            const file = e.target.files[0];
            if (file && file.type.startsWith('image/')) {
                showNotification('Photo captured! 📸');
                nextReportStep();
            }
        };
        
        fileInput.click();
    }
}

function uploadPhoto() {
    // Create a file input for gallery selection
    const fileInput = document.createElement('input');
    fileInput.type = 'file';
    fileInput.accept = 'image/*';
    
    fileInput.onchange = function(e) {
        const file = e.target.files[0];
        if (file && file.type.startsWith('image/')) {
            showNotification('Photo selected! 📷');
            nextReportStep();
        }
    };
    
    fileInput.click();
}

function nextReportStep() {
    const steps = document.querySelectorAll('.step');
    steps.forEach(step => step.classList.remove('active'));
    
    reportStep++;
    if (reportStep <= 3) {
        const nextStep = document.getElementById(`step${reportStep}`);
        if (nextStep) {
            nextStep.classList.add('active');
        }
    }
    
    if (reportStep === 2) {
        // Simulate AI analysis
        setTimeout(() => {
            nextReportStep();
        }, 3000);
    }
}

function submitReport() {
    showNotification('Report submitted successfully! 🎉');
    reportStep = 1;
    const steps = document.querySelectorAll('.step');
    steps.forEach(step => step.classList.remove('active'));
    document.getElementById('step1').classList.add('active');
}

// Search and Filter Functions
function handleSearch(event) {
    const query = event.target.value.toLowerCase();
    const results = document.getElementById('searchResults');
    
    if (query.length > 0) {
        // Show search in progress message
        results.innerHTML = `
            <div class="empty-search">
                <div class="empty-icon">🔍</div>
                <h3>Searching...</h3>
                <p>Looking for users matching "${query}"</p>
            </div>
        `;
        
        // In a real app, you would search the backend API here
        // For now, show no results since we removed all fake users
        setTimeout(() => {
            results.innerHTML = `
                <div class="empty-search">
                    <div class="empty-icon">😔</div>
                    <h3>No users found</h3>
                    <p>No users match your search. Try a different query.</p>
                </div>
            `;
        }, 500);
    } else {
        // Show default empty state
        results.innerHTML = `
            <div class="search-suggestions">
                <div class="suggestion-section">
                    <div class="empty-search">
                        <div class="empty-icon">🔍</div>
                        <h3>Search for Users</h3>
                        <p>Start typing to find other GreenConnect members</p>
                    </div>
                </div>
            </div>
        `;
    }
}

function switchSearchTab(tabName) {
    // Update tab buttons
    const tabBtns = document.querySelectorAll('.tab-btn');
    tabBtns.forEach(btn => btn.classList.remove('active'));
    document.querySelector(`[data-tab="${tabName}"]`).classList.add('active');
    
    // Update tab content
    const tabContents = document.querySelectorAll('.search-tab-content');
    tabContents.forEach(content => content.classList.remove('active'));
    document.getElementById(`${tabName}Tab`).classList.add('active');
}

function selectUser(username) {
    showNotification(`Viewing ${username}'s profile`);
}

function showMarkerInfo(markerId) {
    const markerInfo = {
        'cleanup1': 'Beach Cleanup Drive - Tomorrow 9:00 AM',
        'cleanup2': 'Tree Planting Event - Sunday 8:00 AM',
        'issue1': 'Plastic Waste Overflow - High Priority',
        'issue2': 'Illegal Dumping Site - Medium Priority'
    };
    
    showNotification(markerInfo[markerId] || 'Location info');
}

function handleFilter(filter) {
    showNotification(`Filtering by: ${filter}`);
}

// Modal Functions
function openNotifications() {
    const modal = document.getElementById('notificationModal');
    modal.classList.add('active');
}

function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    modal.classList.remove('active');
}

// Utility Functions
function showNotification(message) {
    const notification = document.createElement('div');
    notification.textContent = message;
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        left: 50%;
        transform: translateX(-50%);
        background: linear-gradient(135deg, #2ECC71, #27AE60);
        color: white;
        padding: 15px 25px;
        border-radius: 25px;
        z-index: 1001;
        font-weight: 600;
        box-shadow: 0 5px 20px rgba(46, 204, 113, 0.4);
        animation: slideDown 0.3s ease;
    `;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.style.animation = 'slideUp 0.3s ease';
        setTimeout(() => {
            document.body.removeChild(notification);
        }, 300);
    }, 3000);
}

function addRippleEffect() {
    const buttons = document.querySelectorAll('button, .nav-item, .post-card, .product-card');
    
    buttons.forEach(button => {
        button.addEventListener('click', function(e) {
            const ripple = document.createElement('span');
            const rect = this.getBoundingClientRect();
            const size = Math.max(rect.width, rect.height);
            const x = e.clientX - rect.left - size / 2;
            const y = e.clientY - rect.top - size / 2;
            
            ripple.style.cssText = `
                position: absolute;
                width: ${size}px;
                height: ${size}px;
                left: ${x}px;
                top: ${y}px;
                background: rgba(46, 204, 113, 0.3);
                border-radius: 50%;
                transform: scale(0);
                animation: ripple 0.6s ease;
                pointer-events: none;
            `;
            
            this.style.position = 'relative';
            this.style.overflow = 'hidden';
            this.appendChild(ripple);
            
            setTimeout(() => {
                ripple.remove();
            }, 600);
        });
    });
}

// Add CSS animations
const style = document.createElement('style');
style.textContent = `
    @keyframes heartPop {
        0% { transform: translate(-50%, -50%) scale(0); opacity: 1; }
        50% { transform: translate(-50%, -50%) scale(1.2); opacity: 1; }
        100% { transform: translate(-50%, -50%) scale(0); opacity: 0; }
    }
    
    @keyframes slideDown {
        from { transform: translateX(-50%) translateY(-100%); opacity: 0; }
        to { transform: translateX(-50%) translateY(0); opacity: 1; }
    }
    
    @keyframes slideUp {
        from { transform: translateX(-50%) translateY(0); opacity: 1; }
        to { transform: translateX(-50%) translateY(-100%); opacity: 0; }
    }
    
    @keyframes ripple {
        to { transform: scale(2); opacity: 0; }
    }
    
    .search-result-section {
        margin-bottom: 25px;
    }
    
    .search-result-section h4 {
        color: #2ECC71;
        margin-bottom: 15px;
        font-size: 16px;
    }
    
    .search-result-item {
        display: flex;
        align-items: center;
        padding: 15px;
        background: rgba(46, 204, 113, 0.1);
        border-radius: 10px;
        margin-bottom: 10px;
        cursor: pointer;
        transition: all 0.3s ease;
    }
    
    .search-result-item:hover {
        background: rgba(46, 204, 113, 0.2);
        transform: translateX(5px);
    }
    
    .search-result-item img {
        width: 40px;
        height: 40px;
        border-radius: 50%;
        margin-right: 15px;
    }
    
    .result-icon {
        width: 40px;
        height: 40px;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 20px;
        margin-right: 15px;
    }
    
    .result-name {
        font-weight: 600;
        margin-bottom: 2px;
    }
    
    .result-subtitle {
        font-size: 12px;
        color: #888;
    }
`;

document.head.appendChild(style);

// ==================== NOTIFICATION SYSTEM ====================

// Initialize notification system
function initNotificationSystem() {
    // Load notifications from localStorage
    const saved = localStorage.getItem('notifications');
    if (saved) {
        notifications = JSON.parse(saved);
    }
    
    // Update badge count
    updateNotificationBadge();
    
    // Check for nearby issues every 5 minutes
    if (currentUser) {
        setInterval(checkNearbyIssues, 5 * 60 * 1000);
        checkNearbyIssues(); // Initial check
    }
}

// Add a new notification
function addNotification(type, message, data = {}) {
    const notification = {
        id: Date.now() + Math.random(),
        type: type, // 'like', 'comment', 'follow', 'issue', 'event', 'ecopoints'
        message: message,
        data: data,
        timestamp: new Date().toISOString(),
        read: false
    };
    
    notifications.unshift(notification);
    
    // Keep only last 50 notifications
    if (notifications.length > 50) {
        notifications = notifications.slice(0, 50);
    }
    
    // Save to localStorage
    localStorage.setItem('notifications', JSON.stringify(notifications));
    
    // Update badge
    updateNotificationBadge();
    
    // Show toast notification if enabled
    const settings = JSON.parse(localStorage.getItem('notificationSettings') || '{}');
    if (settings.enableNotifications !== false) {
        showToastNotification(notification);
    }
}

// Update notification badge count
function updateNotificationBadge() {
    const badge = document.getElementById('notificationBadge');
    if (badge) {
        const unreadCount = notifications.filter(n => !n.read).length;
        badge.textContent = unreadCount;
        badge.style.display = unreadCount > 0 ? 'flex' : 'none';
    }
}

// Show toast notification
function showToastNotification(notification) {
    const toast = document.createElement('div');
    toast.className = 'toast-notification';
    
    let icon = '';
    switch(notification.type) {
        case 'like':
            icon = '<i class="fas fa-heart" style="color: #e74c3c;"></i>';
            break;
        case 'comment':
            icon = '<i class="fas fa-comment" style="color: #3498db;"></i>';
            break;
        case 'follow':
            icon = '<i class="fas fa-user-plus" style="color: #2ECC71;"></i>';
            break;
        case 'issue':
            icon = '<i class="fas fa-exclamation-triangle" style="color: #f39c12;"></i>';
            break;
        case 'event':
            icon = '<i class="fas fa-calendar" style="color: #9b59b6;"></i>';
            break;
        case 'ecopoints':
            icon = '<i class="fas fa-leaf" style="color: #2ECC71;"></i>';
            break;
        default:
            icon = '<i class="fas fa-bell" style="color: #2ECC71;"></i>';
    }
    
    toast.innerHTML = `
        <div class="toast-icon">${icon}</div>
        <div class="toast-content">
            <div class="toast-message">${notification.message}</div>
            <div class="toast-time">Just now</div>
        </div>
    `;
    
    document.body.appendChild(toast);
    
    // Animate in
    setTimeout(() => toast.classList.add('show'), 100);
    
    // Remove after 5 seconds
    setTimeout(() => {
        toast.classList.remove('show');
        setTimeout(() => toast.remove(), 300);
    }, 5000);
    
    // Click to dismiss
    toast.onclick = () => {
        toast.classList.remove('show');
        setTimeout(() => toast.remove(), 300);
    };
}

// Open notifications modal
function openNotifications() {
    renderNotifications();
    const modal = document.getElementById('notificationModal');
    if (modal) {
        modal.classList.add('active');
    }
    
    // Mark all as read after a delay
    setTimeout(() => {
        notifications.forEach(n => n.read = true);
        localStorage.setItem('notifications', JSON.stringify(notifications));
        updateNotificationBadge();
    }, 1000);
}

// Render notifications in modal
function renderNotifications() {
    const container = document.getElementById('notificationsList');
    if (!container) return;
    
    if (notifications.length === 0) {
        container.innerHTML = `
            <div class="empty-notifications">
                <div class="empty-icon">🔔</div>
                <h3>No Notifications</h3>
                <p>You're all caught up! We'll notify you when something happens.</p>
            </div>
        `;
        return;
    }
    
    container.innerHTML = notifications.map(notif => {
        let icon = '';
        let iconClass = '';
        
        switch(notif.type) {
            case 'like':
                icon = 'fa-heart';
                iconClass = 'like-icon';
                break;
            case 'comment':
                icon = 'fa-comment';
                iconClass = 'comment-icon';
                break;
            case 'follow':
                icon = 'fa-user-plus';
                iconClass = 'follow-icon';
                break;
            case 'issue':
                icon = 'fa-exclamation-triangle';
                iconClass = 'issue-icon';
                break;
            case 'event':
                icon = 'fa-calendar';
                iconClass = 'event-icon';
                break;
            case 'ecopoints':
                icon = 'fa-leaf';
                iconClass = 'ecopoints-icon';
                break;
            default:
                icon = 'fa-bell';
                iconClass = 'default-icon';
        }
        
        const timeAgo = getTimeAgo(notif.timestamp);
        
        return `
            <div class="notification-item ${notif.read ? 'read' : 'unread'}">
                <i class="fas ${icon} notification-icon ${iconClass}"></i>
                <div class="notification-content">
                    <p>${notif.message}</p>
                    <span class="notification-time">${timeAgo}</span>
                </div>
                ${!notif.read ? '<div class="unread-dot"></div>' : ''}
            </div>
        `;
    }).join('');
}

// Get time ago string
function getTimeAgo(timestamp) {
    const now = new Date();
    const then = new Date(timestamp);
    const seconds = Math.floor((now - then) / 1000);
    
    if (seconds < 60) return 'Just now';
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
    if (seconds < 604800) return `${Math.floor(seconds / 86400)}d ago`;
    return `${Math.floor(seconds / 604800)}w ago`;
}

// Check for nearby issues
async function checkNearbyIssues() {
    if (!currentUser) return;
    
    // Check if location sharing is enabled
    const privacySettings = JSON.parse(localStorage.getItem('privacySettings') || '{}');
    if (privacySettings.shareLocation === false) return;
    
    // Check if issue notifications are enabled
    const notifSettings = JSON.parse(localStorage.getItem('notificationSettings') || '{}');
    if (notifSettings.issueUpdates === false) return;
    
    try {
        // Get user's location
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(async (position) => {
                const { latitude, longitude } = position.coords;
                
                // Fetch nearby issues from backend
                const response = await fetch(`${API_BASE_URL}/issues/nearby?lat=${latitude}&lng=${longitude}&radius=5`, {
                    headers: authToken ? {
                        'Authorization': `Bearer ${authToken}`
                    } : {}
                });
                
                if (response.ok) {
                    const data = await response.json();
                    
                    // Check for new issues
                    const lastCheck = localStorage.getItem('lastIssueCheck');
                    const newIssues = data.issues.filter(issue => {
                        return !lastCheck || new Date(issue.createdAt) > new Date(lastCheck);
                    });
                    
                    // Notify about new issues
                    newIssues.forEach(issue => {
                        addNotification(
                            'issue',
                            `🚨 New environmental issue nearby: ${issue.title}`,
                            { issueId: issue.id, location: issue.location }
                        );
                    });
                    
                    // Update last check time
                    localStorage.setItem('lastIssueCheck', new Date().toISOString());
                }
            }, (error) => {
                console.log('Location access denied:', error);
            });
        }
    } catch (error) {
        console.error('Error checking nearby issues:', error);
    }
}

// Notify when post receives a like
function notifyPostLike(postId, likerName) {
    const settings = JSON.parse(localStorage.getItem('notificationSettings') || '{}');
    if (settings.likesComments === false) return;
    
    addNotification(
        'like',
        `❤️ ${likerName} liked your post`,
        { postId: postId }
    );
}

// Notify when post receives a comment
function notifyPostComment(postId, commenterName, comment) {
    const settings = JSON.parse(localStorage.getItem('notificationSettings') || '{}');
    if (settings.likesComments === false) return;
    
    addNotification(
        'comment',
        `💬 ${commenterName} commented: "${comment.substring(0, 50)}${comment.length > 50 ? '...' : ''}"`,
        { postId: postId }
    );
}

// Notify when someone follows
function notifyNewFollower(followerName) {
    const settings = JSON.parse(localStorage.getItem('notificationSettings') || '{}');
    if (settings.newFollowers === false) return;
    
    addNotification(
        'follow',
        `👤 ${followerName} started following you`,
        { followerName: followerName }
    );
}

// Notify about event reminder
function notifyEventReminder(eventTitle, eventTime) {
    const settings = JSON.parse(localStorage.getItem('notificationSettings') || '{}');
    if (settings.eventReminders === false) return;
    
    addNotification(
        'event',
        `📅 Reminder: ${eventTitle} starts ${eventTime}`,
        { eventTitle: eventTitle }
    );
}

// Notify when earning eco points
function notifyEcoPoints(points, reason) {
    const settings = JSON.parse(localStorage.getItem('notificationSettings') || '{}');
    if (settings.ecoPoints === false) return;
    
    addNotification(
        'ecopoints',
        `🍃 You earned ${points} eco points! ${reason}`,
        { points: points }
    );
}

// ==================== END NOTIFICATION SYSTEM ====================

// Close modals when clicking outside
document.addEventListener('click', function(e) {
    if (e.target.classList.contains('modal')) {
        e.target.classList.remove('active');
    }
});

// Add smooth scroll behavior
document.documentElement.style.scrollBehavior = 'smooth';

// ==================== LOCATION & MAP FUNCTIONS ====================

// --- Post Location: Search via Nominatim ---
let locationSearchTimer = null;

async function searchPostLocation(query) {
    const suggestionsEl = document.getElementById('locationSuggestions');
    clearTimeout(locationSearchTimer);

    if (!query || query.length < 2) {
        suggestionsEl.style.display = 'none';
        return;
    }

    locationSearchTimer = setTimeout(async () => {
        try {
            const res = await fetch(
                `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query)}&format=json&limit=6&addressdetails=1`,
                { headers: { 'Accept-Language': 'en' } }
            );
            const results = await res.json();

            if (results.length === 0) {
                suggestionsEl.innerHTML = `<div class="location-item" style="color:#888; cursor:default;"><i class="fas fa-info-circle"></i><div><div class="location-name">No results found</div></div></div>`;
                suggestionsEl.style.display = 'block';
                return;
            }

            suggestionsEl.innerHTML = results.map(r => {
                const name = r.name || r.display_name.split(',')[0];
                const address = r.display_name;
                return `
                    <div class="location-item" onclick="selectPostLocation('${address.replace(/'/g, "\\'")}', ${r.lat}, ${r.lon})">
                        <i class="fas fa-map-marker-alt"></i>
                        <div>
                            <div class="location-name">${name}</div>
                            <div class="location-address">${address}</div>
                        </div>
                    </div>`;
            }).join('');
            suggestionsEl.style.display = 'block';
        } catch (e) {
            console.error('Location search error:', e);
        }
    }, 400);
}

function selectPostLocation(displayName, lat, lon) {
    document.getElementById('locationInput').value = displayName;
    document.getElementById('locationSuggestions').style.display = 'none';

    // Show selected tag
    document.getElementById('selectedLocationText').textContent = displayName;
    document.getElementById('selectedLocationDisplay').style.display = 'flex';

    // Store coords
    window._postLocationLat = lat;
    window._postLocationLon = lon;
}

function clearPostLocation() {
    document.getElementById('locationInput').value = '';
    document.getElementById('selectedLocationDisplay').style.display = 'none';
    document.getElementById('locationSuggestions').style.display = 'none';
    window._postLocationLat = null;
    window._postLocationLon = null;
}

function getCurrentLocation() {
    if (!navigator.geolocation) {
        showNotification('Geolocation not supported by your browser');
        return;
    }
    showNotification('Getting your location... 📍');
    navigator.geolocation.getCurrentPosition(async (pos) => {
        const { latitude, longitude } = pos.coords;
        try {
            const res = await fetch(
                `https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json`,
                { headers: { 'Accept-Language': 'en' } }
            );
            const data = await res.json();
            const name = data.display_name || `${latitude.toFixed(4)}, ${longitude.toFixed(4)}`;
            selectPostLocation(name, latitude, longitude);
            showNotification('Location set! 📍');
        } catch (e) {
            const fallback = `${latitude.toFixed(4)}, ${longitude.toFixed(4)}`;
            selectPostLocation(fallback, latitude, longitude);
            showNotification('Location set! 📍');
        }
    }, () => {
        showNotification('Could not get your location. Please allow location access.');
    });
}

function selectLocation(name) {
    selectPostLocation(name, null, null);
}

// --- Post Location Map Modal ---
let postMap = null;
let postMapMarker = null;
let postMapSelectedCoords = null;

function openPostLocationMap() {
    const modal = document.getElementById('postLocationMapModal');
    modal.style.display = 'flex';

    setTimeout(() => {
        if (!postMap) {
            postMap = L.map('postLeafletMap').setView([20, 0], 2);
            L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                attribution: '© OpenStreetMap contributors'
            }).addTo(postMap);

            postMap.on('click', async (e) => {
                const { lat, lng } = e.latlng;
                if (postMapMarker) postMap.removeLayer(postMapMarker);
                postMapMarker = L.marker([lat, lng]).addTo(postMap);

                // Reverse geocode
                try {
                    const res = await fetch(
                        `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json`,
                        { headers: { 'Accept-Language': 'en' } }
                    );
                    const data = await res.json();
                    const name = data.display_name || `${lat.toFixed(5)}, ${lng.toFixed(5)}`;
                    document.getElementById('mapSelectedLocation').textContent = '📍 ' + name;
                    postMapSelectedCoords = { lat, lng, name };
                } catch {
                    const name = `${lat.toFixed(5)}, ${lng.toFixed(5)}`;
                    document.getElementById('mapSelectedLocation').textContent = '📍 ' + name;
                    postMapSelectedCoords = { lat, lng, name };
                }
            });
        } else {
            postMap.invalidateSize();
        }

        // Center on user if available
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition((pos) => {
                postMap.setView([pos.coords.latitude, pos.coords.longitude], 14);
            });
        }
    }, 100);
}

function closePostLocationMap() {
    document.getElementById('postLocationMapModal').style.display = 'none';
    document.getElementById('mapSearchResults').innerHTML = '';
    document.getElementById('mapSearchInput').value = '';
}

function confirmMapLocation() {
    if (!postMapSelectedCoords) {
        showNotification('Please tap on the map to select a location');
        return;
    }
    selectPostLocation(postMapSelectedCoords.name, postMapSelectedCoords.lat, postMapSelectedCoords.lng);
    closePostLocationMap();
    showNotification('Location selected! 📍');
}

function useCurrentLocationOnMap() {
    if (!navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition((pos) => {
        const { latitude, longitude } = pos.coords;
        if (postMap) postMap.setView([latitude, longitude], 15);
    });
}

let mapSearchTimer2 = null;
async function searchOnMap(query) {
    const resultsEl = document.getElementById('mapSearchResults');
    clearTimeout(mapSearchTimer2);
    if (!query || query.length < 2) { resultsEl.innerHTML = ''; return; }

    mapSearchTimer2 = setTimeout(async () => {
        try {
            const res = await fetch(
                `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query)}&format=json&limit=5`,
                { headers: { 'Accept-Language': 'en' } }
            );
            const results = await res.json();
            resultsEl.innerHTML = results.map(r => `
                <div onclick="flyToOnMap(${r.lat}, ${r.lon}, '${r.display_name.replace(/'/g, "\\'")}')"
                     style="padding:8px 12px; cursor:pointer; border-bottom:1px solid rgba(255,255,255,0.05); color:#fff; font-size:13px;">
                    <i class="fas fa-map-marker-alt" style="color:#2ECC71; margin-right:6px;"></i>${r.display_name}
                </div>`).join('');
        } catch (e) { resultsEl.innerHTML = ''; }
    }, 400);
}

function flyToOnMap(lat, lon, name) {
    if (postMap) {
        postMap.setView([lat, lon], 15);
        if (postMapMarker) postMap.removeLayer(postMapMarker);
        postMapMarker = L.marker([lat, lon]).addTo(postMap);
        document.getElementById('mapSelectedLocation').textContent = '📍 ' + name;
        postMapSelectedCoords = { lat, lng: lon, name };
    }
    document.getElementById('mapSearchResults').innerHTML = '';
    document.getElementById('mapSearchInput').value = name.split(',')[0];
}

// --- Main Search Map (Leaflet) ---
let mainMap = null;
let mainMapTimer = null;

function initMainMap() {
    if (mainMap) { mainMap.invalidateSize(); return; }

    mainMap = L.map('mainLeafletMap').setView([20, 0], 2);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors'
    }).addTo(mainMap);

    // Add sample markers
    const cleanupIcon = L.divIcon({ html: '<div style="background:#2ECC71;width:32px;height:32px;border-radius:50%;display:flex;align-items:center;justify-content:center;color:white;font-size:14px;border:2px solid white;">🧹</div>', className: '', iconSize: [32, 32] });
    const issueIcon = L.divIcon({ html: '<div style="background:#e74c3c;width:32px;height:32px;border-radius:50%;display:flex;align-items:center;justify-content:center;color:white;font-size:14px;border:2px solid white;">⚠️</div>', className: '', iconSize: [32, 32] });

    L.marker([40.7829, -73.9654], { icon: cleanupIcon }).addTo(mainMap).bindPopup('<b>Beach Cleanup Drive</b><br>Tomorrow 9:00 AM • Central Beach<br><span style="color:#2ECC71">52 joined</span>');
    L.marker([37.7694, -122.4862], { icon: cleanupIcon }).addTo(mainMap).bindPopup('<b>Tree Planting Event</b><br>Sunday 8:00 AM • Riverside Park<br><span style="color:#2ECC71">28 joined</span>');
    L.marker([40.7580, -73.9855], { icon: issueIcon }).addTo(mainMap).bindPopup('<b>Plastic Waste Overflow</b><br>Reported 2h ago<br><span style="color:#e74c3c">High Priority</span>');
    L.marker([40.7282, -74.0776], { icon: issueIcon }).addTo(mainMap).bindPopup('<b>Illegal Dumping Site</b><br>Reported 5h ago<br><span style="color:#f39c12">Medium Priority</span>');

    // Try to center on user
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition((pos) => {
            const { latitude, longitude } = pos.coords;
            mainMap.setView([latitude, longitude], 13);
            const userIcon = L.divIcon({ html: '<div style="background:#3498db;width:32px;height:32px;border-radius:50%;display:flex;align-items:center;justify-content:center;color:white;font-size:14px;border:2px solid white;">👤</div>', className: '', iconSize: [32, 32] });
            L.marker([latitude, longitude], { icon: userIcon }).addTo(mainMap).bindPopup('<b>You are here</b>').openPopup();
        });
    }
}

function centerMapOnUser() {
    if (!navigator.geolocation) { showNotification('Geolocation not supported'); return; }
    navigator.geolocation.getCurrentPosition((pos) => {
        if (mainMap) mainMap.setView([pos.coords.latitude, pos.coords.longitude], 15);
        showNotification('Centered on your location 📍');
    }, () => showNotification('Could not get your location'));
}

let mainMapSearchTimer = null;
async function searchMainMap(query) {
    const resultsEl = document.getElementById('searchMapResults');
    clearTimeout(mainMapSearchTimer);
    if (!query || query.length < 2) { resultsEl.innerHTML = ''; return; }

    mainMapSearchTimer = setTimeout(async () => {
        try {
            const res = await fetch(
                `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query)}&format=json&limit=5`,
                { headers: { 'Accept-Language': 'en' } }
            );
            const results = await res.json();
            resultsEl.innerHTML = results.map(r => `
                <div onclick="flyToMainMap(${r.lat}, ${r.lon})"
                     style="padding:10px 14px; cursor:pointer; border-bottom:1px solid rgba(255,255,255,0.05); color:#fff; font-size:13px;">
                    <i class="fas fa-map-marker-alt" style="color:#2ECC71; margin-right:6px;"></i>${r.display_name}
                </div>`).join('');
        } catch (e) { resultsEl.innerHTML = ''; }
    }, 400);
}

function flyToMainMap(lat, lon) {
    if (mainMap) mainMap.setView([lat, lon], 14);
    document.getElementById('searchMapResults').innerHTML = '';
    document.getElementById('searchMapInput').value = '';
}

// Init main map when map tab is opened
const _origSwitchSearchTab = window.switchSearchTab;
function switchSearchTab(tabName) {
    const tabBtns = document.querySelectorAll('.tab-btn');
    tabBtns.forEach(btn => btn.classList.remove('active'));
    document.querySelector(`[data-tab="${tabName}"]`).classList.add('active');
    const tabContents = document.querySelectorAll('.search-tab-content');
    tabContents.forEach(content => content.classList.remove('active'));
    document.getElementById(`${tabName}Tab`).classList.add('active');

    if (tabName === 'map') {
        setTimeout(initMainMap, 100);
    }
}

// ==================== END LOCATION & MAP FUNCTIONS ====================

// ==================== REPORT ISSUE LOCATION FUNCTIONS ====================

let reportLocationSearchTimer = null;
window._reportLocationLat = null;
window._reportLocationLon = null;
window._reportLocationName = null;

// Search location via Nominatim
async function searchReportLocation(query) {
    const suggestionsEl = document.getElementById('reportLocationSuggestions');
    clearTimeout(reportLocationSearchTimer);

    if (!query || query.length < 2) {
        suggestionsEl.style.display = 'none';
        return;
    }

    reportLocationSearchTimer = setTimeout(async () => {
        try {
            const res = await fetch(
                `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query)}&format=json&limit=6&addressdetails=1`,
                { headers: { 'Accept-Language': 'en' } }
            );
            const results = await res.json();

            if (results.length === 0) {
                suggestionsEl.innerHTML = `<div style="padding:10px 14px; color:#888; font-size:13px;"><i class="fas fa-info-circle"></i> No results found</div>`;
                suggestionsEl.style.display = 'block';
                return;
            }

            suggestionsEl.innerHTML = results.map(r => {
                const name = r.name || r.display_name.split(',')[0];
                const address = r.display_name;
                return `
                    <div class="location-item" onclick="selectReportLocation('${address.replace(/'/g, "\\'")}', ${r.lat}, ${r.lon})"
                         style="display:flex; align-items:flex-start; gap:10px; padding:10px 14px; cursor:pointer; border-bottom:1px solid rgba(255,255,255,0.05);">
                        <i class="fas fa-map-marker-alt" style="color:#2ECC71; margin-top:3px; flex-shrink:0;"></i>
                        <div>
                            <div style="font-size:14px; color:#fff; font-weight:600;">${name}</div>
                            <div style="font-size:12px; color:#888; margin-top:2px; max-width:260px; overflow:hidden; text-overflow:ellipsis; white-space:nowrap;">${address}</div>
                        </div>
                    </div>`;
            }).join('');
            suggestionsEl.style.display = 'block';
        } catch (e) {
            console.error('Report location search error:', e);
        }
    }, 400);
}

function selectReportLocation(displayName, lat, lon) {
    document.getElementById('reportLocationInput').value = displayName;
    document.getElementById('reportLocationSuggestions').style.display = 'none';
    document.getElementById('reportSelectedLocationText').textContent = displayName;
    document.getElementById('reportSelectedLocationDisplay').style.display = 'flex';
    window._reportLocationLat = lat;
    window._reportLocationLon = lon;
    window._reportLocationName = displayName;
}

function clearReportLocation() {
    document.getElementById('reportLocationInput').value = '';
    document.getElementById('reportLocationSuggestions').style.display = 'none';
    document.getElementById('reportSelectedLocationDisplay').style.display = 'none';
    window._reportLocationLat = null;
    window._reportLocationLon = null;
    window._reportLocationName = null;
}

function getReportCurrentLocation() {
    if (!navigator.geolocation) {
        showNotification('Geolocation not supported by your browser');
        return;
    }
    showNotification('Getting your location... 📍');
    navigator.geolocation.getCurrentPosition(async (pos) => {
        const { latitude, longitude } = pos.coords;
        try {
            const res = await fetch(
                `https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json`,
                { headers: { 'Accept-Language': 'en' } }
            );
            const data = await res.json();
            const name = data.display_name || `${latitude.toFixed(5)}, ${longitude.toFixed(5)}`;
            selectReportLocation(name, latitude, longitude);
            showNotification('Location set! 📍');
        } catch (e) {
            const fallback = `${latitude.toFixed(5)}, ${longitude.toFixed(5)}`;
            selectReportLocation(fallback, latitude, longitude);
            showNotification('Location set! 📍');
        }
    }, () => {
        showNotification('Could not get your location. Please allow location access.');
    });
}

// --- Report Location Map ---
let reportMap = null;
let reportMapMarker = null;
let reportMapSelectedCoords = null;

function openReportLocationMap() {
    const modal = document.getElementById('reportLocationMapModal');
    modal.style.display = 'flex';

    setTimeout(() => {
        if (!reportMap) {
            reportMap = L.map('reportLeafletMap').setView([20, 0], 2);
            L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                attribution: '© OpenStreetMap contributors'
            }).addTo(reportMap);

            reportMap.on('click', async (e) => {
                const { lat, lng } = e.latlng;
                if (reportMapMarker) reportMap.removeLayer(reportMapMarker);

                // Red marker for issue location
                const redIcon = L.divIcon({
                    html: '<div style="background:#e74c3c;width:32px;height:32px;border-radius:50%;display:flex;align-items:center;justify-content:center;color:white;font-size:16px;border:2px solid white;">⚠️</div>',
                    className: '', iconSize: [32, 32]
                });
                reportMapMarker = L.marker([lat, lng], { icon: redIcon }).addTo(reportMap);

                try {
                    const res = await fetch(
                        `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json`,
                        { headers: { 'Accept-Language': 'en' } }
                    );
                    const data = await res.json();
                    const name = data.display_name || `${lat.toFixed(5)}, ${lng.toFixed(5)}`;
                    document.getElementById('reportMapSelectedLocation').textContent = '📍 ' + name;
                    reportMapSelectedCoords = { lat, lng, name };
                } catch {
                    const name = `${lat.toFixed(5)}, ${lng.toFixed(5)}`;
                    document.getElementById('reportMapSelectedLocation').textContent = '📍 ' + name;
                    reportMapSelectedCoords = { lat, lng, name };
                }
            });
        } else {
            reportMap.invalidateSize();
        }

        // Center on user
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition((pos) => {
                reportMap.setView([pos.coords.latitude, pos.coords.longitude], 14);
            });
        }
    }, 100);
}

function closeReportLocationMap() {
    document.getElementById('reportLocationMapModal').style.display = 'none';
    document.getElementById('reportMapSearchResults').innerHTML = '';
    document.getElementById('reportMapSearchInput').value = '';
}

function confirmReportMapLocation() {
    if (!reportMapSelectedCoords) {
        showNotification('Please tap on the map to pin the issue location');
        return;
    }
    selectReportLocation(reportMapSelectedCoords.name, reportMapSelectedCoords.lat, reportMapSelectedCoords.lng);
    closeReportLocationMap();
    showNotification('Issue location set! 📍');
}

function useCurrentLocationOnReportMap() {
    if (!navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition((pos) => {
        if (reportMap) reportMap.setView([pos.coords.latitude, pos.coords.longitude], 15);
    });
}

let reportMapSearchTimer = null;
async function searchOnReportMap(query) {
    const resultsEl = document.getElementById('reportMapSearchResults');
    clearTimeout(reportMapSearchTimer);
    if (!query || query.length < 2) { resultsEl.innerHTML = ''; return; }

    reportMapSearchTimer = setTimeout(async () => {
        try {
            const res = await fetch(
                `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query)}&format=json&limit=5`,
                { headers: { 'Accept-Language': 'en' } }
            );
            const results = await res.json();
            resultsEl.innerHTML = results.map(r => `
                <div onclick="flyToOnReportMap(${r.lat}, ${r.lon}, '${r.display_name.replace(/'/g, "\\'")}')"
                     style="padding:8px 12px; cursor:pointer; border-bottom:1px solid rgba(255,255,255,0.05); color:#fff; font-size:13px;">
                    <i class="fas fa-map-marker-alt" style="color:#e74c3c; margin-right:6px;"></i>${r.display_name}
                </div>`).join('');
        } catch (e) { resultsEl.innerHTML = ''; }
    }, 400);
}

function flyToOnReportMap(lat, lon, name) {
    if (reportMap) {
        reportMap.setView([lat, lon], 15);
        if (reportMapMarker) reportMap.removeLayer(reportMapMarker);
        const redIcon = L.divIcon({
            html: '<div style="background:#e74c3c;width:32px;height:32px;border-radius:50%;display:flex;align-items:center;justify-content:center;color:white;font-size:16px;border:2px solid white;">⚠️</div>',
            className: '', iconSize: [32, 32]
        });
        reportMapMarker = L.marker([lat, lon], { icon: redIcon }).addTo(reportMap);
        document.getElementById('reportMapSelectedLocation').textContent = '📍 ' + name;
        reportMapSelectedCoords = { lat, lng: lon, name };
    }
    document.getElementById('reportMapSearchResults').innerHTML = '';
    document.getElementById('reportMapSearchInput').value = name.split(',')[0];
}

// Override submitReport to include location
const _origSubmitReport = window.submitReport;
function submitReport() {
    const locationName = window._reportLocationName;
    if (!locationName) {
        showNotification('Please add the location of the issue 📍');
        return;
    }
    showNotification(`Report submitted! 🎉 Location: ${locationName.split(',')[0]}`);

    // Notify nearby users (simulate)
    addNotification('issue', `⚠️ New issue reported near ${locationName.split(',')[0]}`, {});

    // Reset
    reportStep = 1;
    const steps = document.querySelectorAll('.step');
    steps.forEach(step => step.classList.remove('active'));
    document.getElementById('step1').classList.add('active');
    clearReportLocation();
    document.getElementById('issueDescription').value = '';
}

// ==================== END REPORT ISSUE LOCATION FUNCTIONS ====================
