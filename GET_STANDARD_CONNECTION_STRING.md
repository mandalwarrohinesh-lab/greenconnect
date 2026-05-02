# 🔧 Get Standard MongoDB Connection String (Non-SRV)

## Problem

Your system cannot resolve MongoDB SRV DNS records (`mongodb+srv://`). This is causing the connection to fail.

**Error**: `querySrv ECONNREFUSED _mongodb._tcp.cluster0.fj62hez.mongodb.net`

## Solution

Use the **standard connection string** instead of the SRV format.

---

## 📋 Steps to Get Standard Connection String

### Step 1: Go to MongoDB Atlas
1. Open: https://cloud.mongodb.com/
2. Login to your account
3. Go to your project

### Step 2: Get Connection String
1. Click **"Database"** in the left sidebar
2. Click **"Connect"** button on your cluster
3. Choose **"Connect your application"**

### Step 3: Select Standard Format
1. **Driver**: Node.js
2. **Version**: 4.1 or later
3. Look for a link that says **"I have a connection string"** or **"Use a different format"**
4. OR click on **"Connection String Only"** tab

### Step 4: Get the Hosts
The standard format looks like:
```
mongodb://cluster0-shard-00-00.fj62hez.mongodb.net:27017,cluster0-shard-00-01.fj62hez.mongodb.net:27017,cluster0-shard-00-02.fj62hez.mongodb.net:27017/greenconnect?ssl=true&replicaSet=atlas-xxxxx-shard-0&authSource=admin&retryWrites=true&w=majority
```

---

## 🎯 Alternative: Manual Construction

If you can't find the standard format, construct it manually:

### Format:
```
mongodb://username:password@host1:27017,host2:27017,host3:27017/database?ssl=true&replicaSet=atlas-xxxxx-shard-0&authSource=admin&retryWrites=true&w=majority
```

### Your Details:
- **Username**: `vickymandalwar8_db_user`
- **Password**: `ZQDD4M1MVdjkZm1M`
- **Cluster**: `cluster0.fj62hez.mongodb.net`
- **Database**: `greenconnect`

### Typical Atlas Hosts:
```
cluster0-shard-00-00.fj62hez.mongodb.net:27017
cluster0-shard-00-01.fj62hez.mongodb.net:27017
cluster0-shard-00-02.fj62hez.mongodb.net:27017
```

### Constructed String:
```
mongodb://vickymandalwar8_db_user:ZQDD4M1MVdjkZm1M@cluster0-shard-00-00.fj62hez.mongodb.net:27017,cluster0-shard-00-01.fj62hez.mongodb.net:27017,cluster0-shard-00-02.fj62hez.mongodb.net:27017/greenconnect?ssl=true&replicaSet=atlas-xxxxx-shard-0&authSource=admin&retryWrites=true&w=majority
```

**Note**: Replace `atlas-xxxxx-shard-0` with your actual replica set name (get from Atlas).

---

## 🔄 Update Your .env File

Once you have the standard connection string:

1. Open `backend/.env`
2. Replace the `MONGODB_URI` line:

```env
# OLD (SRV format - not working)
# MONGODB_URI=mongodb+srv://vickymandalwar8_db_user:ZQDD4M1MVdjkZm1M@cluster0.fj62hez.mongodb.net/greenconnect?retryWrites=true&w=majority

# NEW (Standard format)
MONGODB_URI=mongodb://vickymandalwar8_db_user:ZQDD4M1MVdjkZm1M@cluster0-shard-00-00.fj62hez.mongodb.net:27017,cluster0-shard-00-01.fj62hez.mongodb.net:27017,cluster0-shard-00-02.fj62hez.mongodb.net:27017/greenconnect?ssl=true&replicaSet=atlas-xxxxx-shard-0&authSource=admin&retryWrites=true&w=majority
```

3. Save the file
4. Restart your server:
```bash
cd backend
npm start
```

---

## 🌐 Why SRV Doesn't Work

The `mongodb+srv://` format uses DNS SRV records to automatically discover MongoDB hosts. Your system's DNS cannot resolve these records due to:

1. **DNS Server Issues**: Your DNS server doesn't support SRV lookups
2. **Firewall**: Blocking DNS queries
3. **Network Configuration**: Corporate/school network restrictions
4. **Windows DNS Cache**: Corrupted DNS cache

### Try Flushing DNS Cache:
```powershell
ipconfig /flushdns
```

Then restart your server.

---

## ✅ Verification

When the standard connection string works, you'll see:

```
🔌 Connecting to MongoDB...
📍 URI: mongodb://vickymandalwar8_db_user:****@cluster0-shard-00-00...
✅ MongoDB connected successfully
📍 Database: greenconnect
🌐 Host: cluster0-shard-00-00.fj62hez.mongodb.net
📦 No products found, seeding database...
✅ Inserted 8 products
🌱 GreenConnect API Server running on port 3000
```

---

## 🚨 Still Not Working?

### Option 1: Use MongoDB Compass to Get String
1. Download MongoDB Compass: https://www.mongodb.com/try/download/compass
2. Open Compass
3. Click "New Connection"
4. Paste your SRV string
5. If Compass connects, click "..." → "Copy Connection String"
6. It will give you the resolved standard format
7. Use that in your `.env`

### Option 2: Use Local MongoDB
If Atlas continues to have DNS issues:

1. Download MongoDB: https://www.mongodb.com/try/download/community
2. Install locally
3. Update `.env`:
```env
MONGODB_URI=mongodb://localhost:27017/greenconnect
```
4. Restart server

---

## 📞 Get Help from MongoDB Atlas

1. Go to your Atlas dashboard
2. Click the **"?"** icon (Help)
3. Click **"Contact Support"**
4. Ask for the **standard connection string** for your cluster
5. They can provide it directly

---

## 🎯 Quick Summary

1. **Get standard connection string** from MongoDB Atlas
2. **Replace SRV format** in `.env` file
3. **Restart server**
4. **Should connect successfully!**

The standard format bypasses DNS SRV lookups and connects directly to the MongoDB hosts.

---

**Next Step**: Get the standard connection string from MongoDB Atlas and update your `.env` file!
