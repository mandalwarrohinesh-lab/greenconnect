# 🔧 MongoDB Atlas Connection Troubleshooting

## Current Issue

**Error**: `querySrv ECONNREFUSED _mongodb._tcp.cluster0.fj62hez.mongodb.net`

This means the server cannot connect to your MongoDB Atlas cluster.

## Possible Causes & Solutions

### 1. IP Address Not Whitelisted ⚠️ (Most Common)

MongoDB Atlas requires you to whitelist IP addresses that can connect to your database.

**Solution:**
1. Go to your MongoDB Atlas dashboard: https://cloud.mongodb.com/
2. Click on your project
3. Click **"Network Access"** in the left sidebar
4. Check if your IP is listed
5. If not, click **"Add IP Address"**
6. Choose **"Allow Access from Anywhere"** (for development)
   - This adds `0.0.0.0/0` which allows all IPs
7. Click **"Confirm"**
8. **Wait 2-3 minutes** for the change to take effect
9. Restart your backend server

### 2. Incorrect Connection String

**Check your connection string format:**

Your current string:
```
mongodb+srv://vickymandalwar8_db_user:ZQDD4M1MVdjkZm1M@cluster0.fj62hez.mongodb.net/greenconnect?retryWrites=true&w=majority
```

**Verify:**
- ✅ Starts with `mongodb+srv://`
- ✅ Has username: `vickymandalwar8_db_user`
- ✅ Has password: `ZQDD4M1MVdjkZm1M`
- ✅ Has cluster: `cluster0.fj62hez.mongodb.net`
- ✅ Has database: `greenconnect`

**Get the correct string:**
1. Go to MongoDB Atlas dashboard
2. Click **"Database"** in left sidebar
3. Click **"Connect"** button on your cluster
4. Choose **"Connect your application"**
5. Copy the connection string
6. Replace `<password>` with your actual password
7. Add `/greenconnect` before the `?` to specify database

**Correct format:**
```
mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/greenconnect?retryWrites=true&w=majority
```

### 3. Firewall/Network Blocking

Your network or firewall might be blocking MongoDB Atlas connections.

**Test:**
1. Try connecting from a different network (mobile hotspot)
2. Check if your company/school firewall blocks MongoDB
3. Try disabling Windows Firewall temporarily to test

**Ports used by MongoDB Atlas:**
- Port 27017 (standard MongoDB)
- Port 27016, 27018, 27019 (replica set members)

### 4. Database User Permissions

**Verify user has correct permissions:**
1. Go to MongoDB Atlas dashboard
2. Click **"Database Access"** in left sidebar
3. Find your user: `vickymandalwar8_db_user`
4. Check permissions: Should be **"Read and write to any database"**
5. If not, click **"Edit"** and update permissions

### 5. Cluster Status

**Check if your cluster is running:**
1. Go to MongoDB Atlas dashboard
2. Click **"Database"** in left sidebar
3. Check cluster status - should show **"Active"**
4. If paused, click **"Resume"**

### 6. Password Special Characters

If your password contains special characters, they need to be URL-encoded.

**Special characters that need encoding:**
- `@` → `%40`
- `:` → `%3A`
- `/` → `%2F`
- `?` → `%3F`
- `#` → `%23`
- `[` → `%5B`
- `]` → `%5D`
- `%` → `%25`

Your password: `ZQDD4M1MVdjkZm1M` - ✅ No special characters, should be fine

## Quick Fix Steps

### Step 1: Whitelist IP (Most Important!)
1. MongoDB Atlas → **Network Access**
2. **Add IP Address** → **Allow Access from Anywhere**
3. **Wait 2-3 minutes**

### Step 2: Verify Connection String
1. MongoDB Atlas → **Database** → **Connect**
2. Copy fresh connection string
3. Update `backend/.env`
4. Make sure password is correct

### Step 3: Restart Server
```bash
cd backend
npm start
```

### Step 4: Check Logs
Look for:
```
✅ MongoDB connected successfully
📍 Database: greenconnect
🌐 Host: cluster0.fj62hez.mongodb.net
```

## Alternative: Use Local MongoDB

If Atlas connection continues to fail, you can use local MongoDB:

### Install MongoDB Locally
1. Download: https://www.mongodb.com/try/download/community
2. Install (choose "Complete")
3. Update `backend/.env`:
```env
MONGODB_URI=mongodb://localhost:27017/greenconnect
```
4. Start server: `npm start`

## Testing Connection

### Test 1: Ping Cluster
```bash
ping cluster0.fj62hez.mongodb.net
```

Should resolve to an IP address. If it fails, DNS issue.

### Test 2: Check MongoDB Compass
1. Open MongoDB Compass
2. Paste your connection string
3. Click **"Connect"**
4. If it works, the issue is with Node.js/Mongoose
5. If it fails, the issue is with Atlas configuration

### Test 3: Use MongoDB Shell
```bash
mongosh "mongodb+srv://vickymandalwar8_db_user:ZQDD4M1MVdjkZm1M@cluster0.fj62hez.mongodb.net/greenconnect"
```

If this works, the connection string is correct.

## Common Error Messages

### "querySrv ECONNREFUSED"
- **Cause**: Cannot reach MongoDB Atlas servers
- **Fix**: Whitelist IP, check network/firewall

### "Authentication failed"
- **Cause**: Wrong username or password
- **Fix**: Verify credentials, regenerate password

### "MongoServerError: bad auth"
- **Cause**: User doesn't have permissions
- **Fix**: Update user permissions in Database Access

### "Connection timeout"
- **Cause**: Firewall blocking, cluster paused
- **Fix**: Check firewall, verify cluster is active

## Still Not Working?

### Option 1: Create New Cluster
1. Create a new free cluster in MongoDB Atlas
2. Get fresh connection string
3. Update `.env`

### Option 2: Use Local MongoDB
See "Alternative: Use Local MongoDB" above

### Option 3: Check Atlas Status
- MongoDB Status Page: https://status.mongodb.com/
- Check if there are any ongoing issues

## Need Help?

1. **Check server logs** for specific error messages
2. **Verify IP whitelist** in MongoDB Atlas
3. **Test with MongoDB Compass** to isolate the issue
4. **Try different network** (mobile hotspot)
5. **Contact MongoDB Support** if Atlas-specific issue

## Success Checklist

When connection works, you'll see:
- ✅ "MongoDB connected successfully"
- ✅ Database name displayed
- ✅ Host name displayed
- ✅ Products seeded (8 products)
- ✅ Server running on port 3000

## Next Steps After Connection Works

1. ✅ Create a user account in your app
2. ✅ Refresh the page
3. ✅ Verify account still exists (data persists!)
4. ✅ Start using your app with persistent data!

---

**Most likely fix**: Whitelist your IP in MongoDB Atlas Network Access! 🎯
