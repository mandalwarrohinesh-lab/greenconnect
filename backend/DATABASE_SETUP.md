# 🗄️ MongoDB Database Setup Guide

## Overview

The GreenConnect backend now uses **MongoDB** as a persistent database instead of in-memory storage. This means your data will survive server restarts!

## What Changed

### Before (In-Memory)
- ❌ Data lost on server restart
- ❌ No persistence
- ✅ Easy setup (no database needed)

### After (MongoDB)
- ✅ Data persists across restarts
- ✅ Real database with indexes
- ✅ Production-ready
- ✅ Scalable

## Setup Options

You have **two options** for MongoDB:

### Option 1: Local MongoDB (Recommended for Development)
- Install MongoDB on your computer
- Free and runs locally
- No internet required
- Full control

### Option 2: MongoDB Atlas (Cloud)
- Free cloud database
- No installation needed
- Accessible from anywhere
- 512MB free tier

---

## Option 1: Local MongoDB Setup

### Step 1: Install MongoDB

#### Windows:
1. Download MongoDB Community Server from: https://www.mongodb.com/try/download/community
2. Run the installer
3. Choose "Complete" installation
4. Install as a Windows Service (recommended)
5. MongoDB Compass will be installed automatically (GUI tool)

#### Mac (using Homebrew):
```bash
brew tap mongodb/brew
brew install mongodb-community
brew services start mongodb-community
```

#### Linux (Ubuntu/Debian):
```bash
sudo apt-get install mongodb
sudo systemctl start mongodb
sudo systemctl enable mongodb
```

### Step 2: Verify MongoDB is Running

Open a terminal and run:
```bash
mongosh
```

You should see:
```
Current Mongosh Log ID: ...
Connecting to: mongodb://127.0.0.1:27017
Using MongoDB: 7.0.x
```

Type `exit` to quit.

### Step 3: Configure Backend

The `.env` file is already configured for local MongoDB:
```env
MONGODB_URI=mongodb://localhost:27017/greenconnect
```

### Step 4: Start the Backend

```bash
cd backend
npm start
```

You should see:
```
🔌 Connecting to MongoDB...
✅ MongoDB connected successfully
📍 Database: greenconnect
🌐 Host: localhost:27017
📦 No products found, seeding database...
✅ Inserted 8 products
🌱 GreenConnect API Server running on port 3000
```

---

## Option 2: MongoDB Atlas (Cloud) Setup

### Step 1: Create Free Account

1. Go to: https://www.mongodb.com/cloud/atlas/register
2. Sign up for free
3. Choose "Shared" (Free tier)
4. Select a cloud provider and region (closest to you)
5. Create cluster (takes 3-5 minutes)

### Step 2: Create Database User

1. Click "Database Access" in left sidebar
2. Click "Add New Database User"
3. Choose "Password" authentication
4. Username: `greenconnect`
5. Password: Generate a secure password (save it!)
6. Database User Privileges: "Read and write to any database"
7. Click "Add User"

### Step 3: Whitelist Your IP

1. Click "Network Access" in left sidebar
2. Click "Add IP Address"
3. Click "Allow Access from Anywhere" (for development)
4. Click "Confirm"

### Step 4: Get Connection String

1. Click "Database" in left sidebar
2. Click "Connect" on your cluster
3. Choose "Connect your application"
4. Copy the connection string (looks like):
```
mongodb+srv://greenconnect:<password>@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority
```

### Step 5: Update .env File

Replace the `MONGODB_URI` in `backend/.env`:
```env
MONGODB_URI=mongodb+srv://greenconnect:YOUR_PASSWORD@cluster0.xxxxx.mongodb.net/greenconnect?retryWrites=true&w=majority
```

**Important:** Replace `<password>` with your actual password!

### Step 6: Start the Backend

```bash
cd backend
npm start
```

---

## Database Models

The following MongoDB collections are created:

### Users
- Stores user accounts
- Fields: name, email, password (hashed), avatar, bio, ecoPoints, etc.
- Indexed by: email, name (text search)

### Posts
- User posts with images
- Fields: userId, caption, image, location, likes, comments
- Indexed by: userId, createdAt

### Products
- Marketplace items
- Fields: name, price, category, image, description, rating, stock
- Indexed by: category, popular, rating

### Issues
- Environmental issues reported by users
- Fields: userId, title, description, type, location, coordinates, status
- Indexed by: coordinates (geospatial), userId, status

### Events
- Community cleanup events
- Fields: userId, title, description, type, location, coordinates, date, time
- Indexed by: coordinates (geospatial), userId, date

---

## Useful Commands

### Seed Database with Products
```bash
cd backend
npm run seed
```

### Check Database Status
The server logs will show connection status on startup.

### View Data (MongoDB Compass)
1. Open MongoDB Compass
2. Connect to: `mongodb://localhost:27017`
3. Select database: `greenconnect`
4. Browse collections: users, posts, products, etc.

### Clear All Data
```bash
mongosh
use greenconnect
db.dropDatabase()
```

Then restart the server to re-seed products.

---

## Troubleshooting

### Error: "MongoServerError: Authentication failed"
- Check your username and password in the connection string
- Make sure the database user has correct permissions

### Error: "MongoNetworkError: connect ECONNREFUSED"
- MongoDB is not running
- Start MongoDB service:
  - Windows: `net start MongoDB`
  - Mac: `brew services start mongodb-community`
  - Linux: `sudo systemctl start mongodb`

### Error: "MongooseServerSelectionError"
- Check your internet connection (for Atlas)
- Verify IP whitelist (for Atlas)
- Check connection string format

### Products Not Showing
- Run seed command: `npm run seed`
- Check database connection in server logs

### Data Not Persisting
- Verify MongoDB is running
- Check server logs for connection errors
- Ensure `MONGODB_URI` is correct in `.env`

---

## Migration from In-Memory

If you had data in the old in-memory database:

1. **Users**: Need to create new accounts (passwords were not saved)
2. **Posts**: Will be lost (create new posts)
3. **Products**: Automatically seeded on first startup
4. **Issues/Events**: Will be lost (can be re-reported)

This is expected behavior when switching from in-memory to persistent storage.

---

## Production Deployment

For production, use MongoDB Atlas or a managed MongoDB service:

1. Create production cluster on Atlas
2. Use strong passwords
3. Whitelist only your server's IP
4. Enable authentication
5. Use connection string with SSL
6. Set up backups
7. Monitor performance

---

## Database Backup

### Local MongoDB
```bash
mongodump --db greenconnect --out ./backup
```

### Restore
```bash
mongorestore --db greenconnect ./backup/greenconnect
```

### MongoDB Atlas
- Automatic backups included in paid tiers
- Free tier: Manual export via Compass

---

## Next Steps

1. ✅ Choose setup option (Local or Atlas)
2. ✅ Follow setup steps
3. ✅ Start backend server
4. ✅ Create a user account
5. ✅ Test the app!

Your data will now persist across server restarts! 🎉

---

## Support

If you encounter issues:
1. Check the troubleshooting section above
2. Review server logs for error messages
3. Verify MongoDB is running and accessible
4. Check `.env` configuration

For MongoDB-specific help:
- MongoDB Docs: https://docs.mongodb.com/
- MongoDB University: https://university.mongodb.com/ (free courses)
- Community Forums: https://www.mongodb.com/community/forums/
