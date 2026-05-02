# 🔍 MongoDB Connection Issue - DNS Resolution Failure

## Current Status

❌ **Connection Failed**: DNS SRV lookup failing  
✅ **IP Whitelisted**: 0.0.0.0/0 (all IPs allowed)  
✅ **Server Running**: Port 3000  
⚠️ **Using**: In-memory database (temporary)

---

## The Problem

Your system cannot resolve MongoDB Atlas SRV DNS records.

**Error**: `querySrv ECONNREFUSED _mongodb._tcp.cluster0.fj62hez.mongodb.net`

**What this means**: The `mongodb+srv://` connection format requires DNS SRV record lookups, but your DNS server cannot resolve them.

---

## Why This Happens

1. **DNS Server Limitations**: Your DNS server doesn't support SRV records
2. **Network Restrictions**: Corporate/school firewall blocking DNS queries
3. **Windows DNS Issues**: DNS cache or configuration problems
4. **ISP DNS**: Some ISPs block certain DNS query types

---

## ✅ The Solution

Use the **standard MongoDB connection string** instead of SRV format.

### Current (Not Working):
```
mongodb+srv://user:pass@cluster0.fj62hez.mongodb.net/greenconnect
```

### Need (Will Work):
```
mongodb://user:pass@host1:27017,host2:27017,host3:27017/greenconnect?ssl=true&...
```

---

## 📋 How to Fix

### Option 1: Get Standard Connection String from Atlas (RECOMMENDED)

1. Go to: https://cloud.mongodb.com/
2. Login → Database → Connect
3. Choose "Connect your application"
4. Look for "Connection String Only" or standard format
5. Copy the standard connection string (starts with `mongodb://` not `mongodb+srv://`)
6. Update `backend/.env`:
```env
MONGODB_URI=mongodb://vickymandalwar8_db_user:ZQDD4M1MVdjkZm1M@cluster0-shard-00-00.fj62hez.mongodb.net:27017,cluster0-shard-00-01.fj62hez.mongodb.net:27017,cluster0-shard-00-02.fj62hez.mongodb.net:27017/greenconnect?ssl=true&replicaSet=atlas-xxxxx-shard-0&authSource=admin&retryWrites=true&w=majority
```
7. Restart server: `npm start`

**Detailed guide**: See `GET_STANDARD_CONNECTION_STRING.md`

### Option 2: Try Flushing DNS Cache

```powershell
ipconfig /flushdns
```

Then restart your server.

### Option 3: Use Local MongoDB

If Atlas DNS issues persist:

1. Download: https://www.mongodb.com/try/download/community
2. Install MongoDB locally
3. Update `backend/.env`:
```env
MONGODB_URI=mongodb://localhost:27017/greenconnect
```
4. Restart server

---

## 🧪 Quick Tests

### Test 1: Check DNS Resolution
```powershell
nslookup _mongodb._tcp.cluster0.fj62hez.mongodb.net SRV
```

If this fails, your DNS doesn't support SRV records.

### Test 2: Try MongoDB Compass
1. Download: https://www.mongodb.com/try/download/compass
2. Try connecting with your SRV string
3. If it works, Compass can give you the standard format

### Test 3: Try Different DNS
Update your DNS to Google's DNS:
1. Open Network Settings
2. Change DNS to: `8.8.8.8` and `8.8.4.4`
3. Restart server

---

## 📊 What's Currently Happening

Your backend is running with an **in-memory database** as a fallback:

✅ **Server works**: You can use the app  
❌ **Data doesn't persist**: Lost on server restart  
⚠️ **Temporary solution**: Until MongoDB connects

---

## 🎯 Recommended Action

**Get the standard connection string from MongoDB Atlas** - this will bypass the DNS SRV issue entirely.

1. Login to Atlas
2. Get standard format connection string
3. Update `.env`
4. Restart server
5. ✅ Should connect successfully!

---

## 📚 Documentation Created

I've created several guides to help:

1. **GET_STANDARD_CONNECTION_STRING.md** - How to get non-SRV format
2. **MONGODB_CONNECTION_TROUBLESHOOTING.md** - Complete troubleshooting
3. **FIX_MONGODB_CONNECTION.md** - Step-by-step fixes
4. **MONGODB_QUICK_START.md** - Quick setup guide
5. **DATABASE_SETUP.md** - Comprehensive setup

---

## ✅ Success Indicators

When you get the right connection string, you'll see:

```
🔌 Connecting to MongoDB...
✅ MongoDB connected successfully
📍 Database: greenconnect
🌐 Host: cluster0-shard-00-00.fj62hez.mongodb.net
📦 No products found, seeding database...
✅ Inserted 8 products
🌱 GreenConnect API Server running on port 3000
```

---

## 🆘 Need Help?

1. **Read**: `GET_STANDARD_CONNECTION_STRING.md`
2. **Try**: Flushing DNS cache
3. **Alternative**: Use local MongoDB
4. **Contact**: MongoDB Atlas support for standard connection string

---

**Bottom Line**: The SRV format won't work on your system. Get the standard connection string from MongoDB Atlas and it should work immediately! 🎯
