# 🚀 MongoDB Quick Start - Get Running in 5 Minutes!

## ⚠️ MongoDB Not Installed

MongoDB is not currently installed on your system. You have **two easy options**:

---

## 🌟 OPTION 1: MongoDB Atlas (Cloud) - EASIEST! ⭐

**No installation needed! Works immediately!**

### Step 1: Create Free Account (2 minutes)
1. Go to: https://www.mongodb.com/cloud/atlas/register
2. Sign up with email or Google
3. Choose **"Shared"** (FREE tier - 512MB)
4. Select region closest to you
5. Click "Create Cluster" (wait 3-5 minutes)

### Step 2: Create Database User (1 minute)
1. Click **"Database Access"** (left sidebar)
2. Click **"Add New Database User"**
3. Username: `greenconnect`
4. Password: Click "Autogenerate Secure Password" and **SAVE IT!**
5. User Privileges: "Read and write to any database"
6. Click **"Add User"**

### Step 3: Allow Network Access (30 seconds)
1. Click **"Network Access"** (left sidebar)
2. Click **"Add IP Address"**
3. Click **"Allow Access from Anywhere"** (for development)
4. Click **"Confirm"**

### Step 4: Get Connection String (30 seconds)
1. Click **"Database"** (left sidebar)
2. Click **"Connect"** button on your cluster
3. Choose **"Connect your application"**
4. **Copy the connection string** (looks like this):
```
mongodb+srv://greenconnect:<password>@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority
```

### Step 5: Update Your .env File (30 seconds)
1. Open `backend/.env`
2. Find the line: `MONGODB_URI=mongodb://localhost:27017/greenconnect`
3. Replace it with your connection string:
```env
MONGODB_URI=mongodb+srv://greenconnect:YOUR_ACTUAL_PASSWORD@cluster0.xxxxx.mongodb.net/greenconnect?retryWrites=true&w=majority
```
4. **IMPORTANT:** Replace `<password>` with the password you saved in Step 2!
5. Save the file

### Step 6: Start Your Server! 🎉
```bash
cd backend
npm start
```

You should see:
```
✅ MongoDB connected successfully
📍 Database: greenconnect
🌐 Host: cluster0.xxxxx.mongodb.net
✅ Inserted 8 products
🌱 GreenConnect API Server running on port 3000
```

**Done! Your database is live in the cloud!** ☁️

---

## 💻 OPTION 2: Local MongoDB (More Setup)

**Requires installation but runs on your computer**

### For Windows:

#### Step 1: Download MongoDB
1. Go to: https://www.mongodb.com/try/download/community
2. Select:
   - Version: 7.0.x (latest)
   - Platform: Windows
   - Package: MSI
3. Click **Download**

#### Step 2: Install MongoDB
1. Run the downloaded `.msi` file
2. Choose **"Complete"** installation
3. **Check** "Install MongoDB as a Service"
4. **Check** "Install MongoDB Compass" (GUI tool)
5. Click **Install** (may take 5-10 minutes)
6. Click **Finish**

#### Step 3: Verify Installation
Open PowerShell or Command Prompt:
```bash
mongosh --version
```

You should see version information.

#### Step 4: Start Your Server!
```bash
cd backend
npm start
```

You should see:
```
✅ MongoDB connected successfully
📍 Database: greenconnect
🌐 Host: localhost:27017
✅ Inserted 8 products
🌱 GreenConnect API Server running on port 3000
```

**Done! Your local database is running!** 💾

---

## 🎯 Which Option Should I Choose?

### Choose **MongoDB Atlas (Cloud)** if:
- ✅ You want the fastest setup (no installation)
- ✅ You want to access your data from anywhere
- ✅ You don't want to manage a database server
- ✅ You're deploying to production later

### Choose **Local MongoDB** if:
- ✅ You want full control over your data
- ✅ You prefer working offline
- ✅ You want faster response times (no network latency)
- ✅ You're comfortable with installations

**Recommendation:** Start with **MongoDB Atlas** (Option 1) - it's faster and easier!

---

## ✅ Verification Checklist

After setup, verify everything works:

1. **Backend starts without errors** ✓
2. **See "MongoDB connected successfully"** ✓
3. **See "Inserted 8 products"** ✓
4. **Server running on port 3000** ✓

### Test the Database:

1. Open your app (index.html)
2. Create a new account
3. Refresh the page
4. **Your account should still be there!** ✓

If your account persists after refresh, **your database is working!** 🎉

---

## 🔧 Troubleshooting

### "MongoServerError: Authentication failed"
- Double-check your password in the connection string
- Make sure you replaced `<password>` with your actual password
- No spaces or special characters issues

### "MongoNetworkError: connect ECONNREFUSED"
**For Local MongoDB:**
- MongoDB service is not running
- Start it:
  - Windows: Open Services → Find "MongoDB" → Click "Start"
  - Or run: `net start MongoDB`

**For Atlas:**
- Check your internet connection
- Verify the connection string is correct

### "MongooseServerSelectionError"
**For Atlas:**
- Check IP whitelist (should be "Allow Access from Anywhere")
- Verify connection string format
- Check internet connection

### Products Not Showing in App
```bash
cd backend
npm run seed
```

This will re-seed the products.

---

## 📊 View Your Data

### MongoDB Atlas:
1. Go to your Atlas dashboard
2. Click "Browse Collections"
3. Select database: `greenconnect`
4. View collections: users, posts, products, etc.

### Local MongoDB:
1. Open **MongoDB Compass** (installed with MongoDB)
2. Connect to: `mongodb://localhost:27017`
3. Select database: `greenconnect`
4. Browse collections

---

## 🎓 What's Next?

1. ✅ Set up MongoDB (Option 1 or 2)
2. ✅ Start your backend server
3. ✅ Open your app (index.html)
4. ✅ Create an account
5. ✅ Test that data persists!

Your data will now survive server restarts! 🎉

---

## 📚 Additional Resources

- **MongoDB Atlas Tutorial**: https://www.mongodb.com/docs/atlas/getting-started/
- **MongoDB Compass Guide**: https://www.mongodb.com/docs/compass/current/
- **Mongoose Documentation**: https://mongoosejs.com/docs/guide.html
- **Full Setup Guide**: See `backend/DATABASE_SETUP.md`

---

## 💡 Pro Tips

1. **Use MongoDB Compass** to visually browse your data
2. **Backup your Atlas connection string** - save it somewhere safe
3. **Don't commit .env to git** - it contains your password!
4. **Free Atlas tier is 512MB** - plenty for development
5. **Local MongoDB has no limits** - use as much as you want

---

## Need Help?

1. Check `backend/DATABASE_SETUP.md` for detailed instructions
2. Review server logs for specific error messages
3. Verify your `.env` file configuration
4. Make sure MongoDB is running (for local setup)

**You've got this!** 💪
