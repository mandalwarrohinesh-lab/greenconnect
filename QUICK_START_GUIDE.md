# 🚀 GreenConnect - Quick Start Guide

## ✅ All Issues Fixed!

Your GreenConnect app is now fully functional with all 4 requested fixes implemented:

1. ✅ **Signup/Login in Profile** - Create your own account
2. ✅ **Working Camera** - Upload real photos for posts and stories
3. ✅ **Edit Profile & Settings** - Update your profile and app settings
4. ✅ **Fake Data Removed** - Clean database ready for your data

---

## 🎯 Getting Started (3 Easy Steps)

### Step 1: Make Sure Backend is Running
The backend server should already be running. You should see:
```
🌱 GreenConnect API Server running on port 3000
✅ Database initialized - ready for user data
   - 0 users (empty - ready for signup)
```

If not running, start it:
```bash
cd backend
npm start
```

### Step 2: Open the App
Open `index.html` in your browser or visit the file directly.

### Step 3: Create Your Account
1. Click on the **Profile** tab (bottom right)
2. Click **"Login / Sign Up"** button
3. Switch to **"Sign Up"** tab
4. Fill in your details:
   - Full Name
   - Email
   - Password (min 6 characters)
   - Bio (optional)
5. Click **"Create Account"**

🎉 You're now logged in!

---

## 📸 How to Create Your First Post

1. Click the **"+"** button (top left corner)
2. Click **"Camera"** (to take photo) or **"Gallery"** (to select existing photo)
3. Select an image from your device
4. Wait for preview to load
5. Add a caption describing your environmental action
6. (Optional) Add location
7. Click **"Share"**

Your post will appear in the feed!

---

## ✏️ How to Edit Your Profile

1. Go to **Profile** tab
2. Click **"Edit Profile"** button
3. Update your information:
   - Name
   - Bio
   - Profile Picture URL (optional)
4. Click **"Save Changes"**

Your profile will update immediately!

---

## ⚙️ How to Access Settings

1. Go to **Profile** tab
2. Click **"Settings"** button
3. Available options:
   - **Dark Mode** - Toggle theme
   - **Notifications** - Manage notifications (coming soon)
   - **Privacy** - Privacy settings (coming soon)
   - **About** - App information
   - **Logout** - Sign out of your account

---

## 🌟 What You Can Do Now

### ✅ Create Posts
- Share your environmental activities
- Upload photos of cleanups, tree planting, etc.
- Add captions and locations

### ✅ Report Issues
- Go to **Report** tab
- Upload photo of environmental issue
- AI will analyze the image
- Submit report with details

### ✅ Browse Marketplace
- Go to **Shop** tab
- Browse eco-friendly products
- Redeem with your eco points

### ✅ Search & Connect
- Go to **Search** tab
- Find other users (when they join)
- View map of nearby activities

---

## 🎨 App Features

### Authentication
- ✅ Secure login/signup
- ✅ JWT token authentication
- ✅ Session persistence
- ✅ Profile management

### Camera & Photos
- ✅ Real camera access (mobile)
- ✅ Gallery photo selection
- ✅ Image preview
- ✅ File validation (max 5MB)

### Profile Management
- ✅ Edit profile information
- ✅ Update avatar
- ✅ View statistics
- ✅ Achievements display

### Settings
- ✅ Dark/Light mode toggle
- ✅ Logout functionality
- ✅ App information

---

## 🔧 Troubleshooting

### Backend Not Running?
```bash
cd backend
npm start
```

### Can't Login?
- Make sure backend is running on port 3000
- Check browser console for errors
- Try creating a new account

### Camera Not Working?
- Make sure you're using HTTPS or localhost
- Grant camera permissions when prompted
- Try "Gallery" option instead

### Profile Not Updating?
- Check if you're logged in
- Verify backend is running
- Check browser console for errors

---

## 📱 Mobile Testing

To test on mobile device:
1. Find your computer's IP address
2. Make sure mobile is on same network
3. Update `API_BASE_URL` in `script.js` to use your IP:
   ```javascript
   const API_BASE_URL = 'http://YOUR_IP:3000/api';
   ```
4. Open `http://YOUR_IP/index.html` on mobile

---

## 🎯 Next Steps

Now that everything is working, you can:

1. **Create Your Profile**
   - Add a bio
   - Upload a profile picture
   - Customize your account

2. **Start Posting**
   - Share your environmental activities
   - Upload photos of your green initiatives
   - Inspire others in the community

3. **Report Issues**
   - Help keep your community clean
   - Report environmental problems
   - Track issue resolution

4. **Earn Eco Points**
   - Post regularly
   - Report issues
   - Join cleanup events
   - Redeem points for eco products

---

## 💚 Enjoy Your Clean, Personalized GreenConnect App!

All fake data has been removed. You're starting fresh with your own account and data. Make a difference in your community! 🌱

---

## 📞 Need Help?

Check these files for more information:
- `IMPLEMENTATION_SUMMARY.md` - Detailed list of all changes
- `BACKEND_SUMMARY.md` - Backend API documentation
- `backend/README.md` - Backend setup guide

Happy green connecting! 🌍✨
