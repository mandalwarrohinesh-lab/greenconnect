# GreenConnect Frontend-Backend Integration Guide

## Overview

The backend is now running and ready to integrate with your existing frontend. No changes to the frontend HTML, CSS, or JavaScript are required - you just need to update the API calls.

## Backend Status

✅ **Backend Server Running:** `http://localhost:3000`
✅ **API Endpoint:** `http://localhost:3000/api`
✅ **WebSocket:** `ws://localhost:3000`

## Quick Start

### 1. Backend is Already Running

The backend server is running on port 3000 with:
- 3 sample users
- 8 products
- 3 posts
- 2 events
- 2 issues

### 2. Test the API

Open the test page in your browser:
```
backend/test-api.html
```

Or test with curl:
```bash
# Login
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"sarah@greenconnect.com","password":"password123"}'

# Get feed (replace TOKEN with the token from login)
curl http://localhost:3000/api/posts/feed \
  -H "Authorization: Bearer TOKEN"
```

### 3. Sample Login Credentials

Use these credentials to test:

**User 1:**
- Email: `sarah@greenconnect.com`
- Password: `password123`
- Points: 1,250

**User 2:**
- Email: `mike@greenconnect.com`
- Password: `password123`
- Points: 980

**User 3:**
- Email: `emma@greenconnect.com`
- Password: `password123`
- Points: 750

## Integration Steps (Optional)

If you want to connect your existing frontend to the backend, here's how:

### Step 1: Add API Configuration

Add this to the top of your `script.js`:

```javascript
// API Configuration
const API_BASE_URL = 'http://localhost:3000/api';
let authToken = localStorage.getItem('authToken') || '';

// Helper function for API calls
async function apiCall(endpoint, options = {}) {
    const defaultOptions = {
        headers: {
            'Content-Type': 'application/json',
            ...(authToken && { 'Authorization': `Bearer ${authToken}` })
        }
    };

    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        ...defaultOptions,
        ...options,
        headers: {
            ...defaultOptions.headers,
            ...options.headers
        }
    });

    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error?.message || 'API request failed');
    }

    return response.json();
}
```

### Step 2: Update loadPosts() Function

Replace the hardcoded posts with API call:

```javascript
async function loadPosts() {
    try {
        const data = await apiCall('/posts/feed');
        posts = data.posts;
        renderPosts();
    } catch (error) {
        console.error('Failed to load posts:', error);
        showNotification('Failed to load posts');
    }
}
```

### Step 3: Update loadProducts() Function

Replace the hardcoded products with API call:

```javascript
async function loadProducts() {
    try {
        products = await apiCall('/products');
        renderProducts();
    } catch (error) {
        console.error('Failed to load products:', error);
        showNotification('Failed to load products');
    }
}
```

### Step 4: Update toggleLike() Function

Connect to the backend API:

```javascript
async function toggleLike(postId) {
    try {
        const result = await apiCall(`/posts/${postId}/like`, {
            method: 'POST'
        });

        const post = posts.find(p => p.id === postId);
        if (post) {
            post.liked = result.liked;
            post.likes = result.likes;
            
            if (result.liked) {
                showHeartAnimation();
            }
            
            renderPosts();
        }
    } catch (error) {
        console.error('Failed to like post:', error);
        showNotification('Failed to like post');
    }
}
```

### Step 5: Add Login/Register Functions

Add authentication functions:

```javascript
async function login(email, password) {
    try {
        const data = await apiCall('/auth/login', {
            method: 'POST',
            body: JSON.stringify({ email, password })
        });

        authToken = data.token;
        localStorage.setItem('authToken', authToken);
        localStorage.setItem('user', JSON.stringify(data.user));

        showNotification('Login successful! 🎉');
        return data.user;
    } catch (error) {
        console.error('Login failed:', error);
        showNotification('Login failed: ' + error.message);
        throw error;
    }
}

async function register(email, password, name) {
    try {
        const data = await apiCall('/auth/register', {
            method: 'POST',
            body: JSON.stringify({ email, password, name })
        });

        authToken = data.token;
        localStorage.setItem('authToken', authToken);
        localStorage.setItem('user', JSON.stringify(data.user));

        showNotification('Registration successful! 🎉');
        return data.user;
    } catch (error) {
        console.error('Registration failed:', error);
        showNotification('Registration failed: ' + error.message);
        throw error;
    }
}
```

## API Endpoints Reference

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user

### Users
- `GET /api/users/me` - Get current user profile
- `PUT /api/users/me` - Update user profile
- `GET /api/users/search?q=query` - Search users
- `POST /api/users/:id/follow` - Follow user

### Posts
- `GET /api/posts/feed?page=1&limit=20` - Get feed posts
- `POST /api/posts` - Create new post
- `POST /api/posts/:id/like` - Like/Unlike post
- `DELETE /api/posts/:id` - Delete post

### Stories
- `GET /api/stories` - Get all active stories
- `POST /api/stories` - Create new story
- `POST /api/stories/:id/view` - View story

### Issues
- `GET /api/issues` - Get all issues
- `POST /api/issues` - Report new issue (with AI analysis)
- `PATCH /api/issues/:id/status` - Update issue status

### Events
- `GET /api/events` - Get all events
- `POST /api/events` - Create new event
- `POST /api/events/:id/join` - Join event
- `DELETE /api/events/:id/join` - Leave event

### Products
- `GET /api/products` - Get all products
- `GET /api/products/:id` - Get single product
- `POST /api/products/:id/redeem` - Redeem product

### Comments
- `GET /api/comments/post/:postId` - Get comments
- `POST /api/comments/post/:postId` - Add comment
- `DELETE /api/comments/:id` - Delete comment

### Notifications
- `GET /api/notifications` - Get notifications
- `GET /api/notifications/unread/count` - Get unread count
- `PATCH /api/notifications/:id/read` - Mark as read

## Features Implemented

✅ **Authentication & Authorization**
- JWT-based authentication
- Secure password hashing with bcrypt
- Token expiration (24 hours)

✅ **User Management**
- Profile CRUD operations
- Follow/Unfollow functionality
- User search

✅ **Social Features**
- Posts with likes and comments
- Stories (24-hour expiration)
- Real-time notifications

✅ **Environmental Features**
- Issue reporting with AI waste detection
- Events and cleanup drives
- Geolocation support

✅ **Marketplace**
- Product catalog
- Points-based redemption system
- Featured products

✅ **Points System**
- Earn points for activities
- Spend points on products
- Transaction history

✅ **Real-time Features**
- WebSocket support
- Live notifications
- Instant updates

## Database

Currently using **in-memory storage** for development. Data includes:
- 3 sample users with different eco points
- 8 eco-friendly products
- 3 sample posts
- 2 upcoming events
- 2 reported issues

**For Production:** Replace with PostgreSQL, MongoDB, or your preferred database.

## AI Waste Detection

The issue reporting endpoint includes **simulated AI analysis** that:
- Classifies waste type (Plastic, Illegal Dumping, Overflowing Bins, Other)
- Determines priority level (High, Medium, Low)
- Estimates quantity (Small, Medium, Large)
- Assesses hazard level

**For Production:** Integrate with TensorFlow, PyTorch, AWS Rekognition, or Google Cloud Vision API.

## Next Steps

1. ✅ Backend is running and ready
2. ⏭️ Test the API using `backend/test-api.html`
3. ⏭️ (Optional) Integrate with your frontend by updating API calls
4. ⏭️ (Optional) Add real database for persistence
5. ⏭️ (Optional) Integrate real AI/ML model for waste detection
6. ⏭️ (Optional) Add image upload functionality
7. ⏭️ (Optional) Deploy to production

## Troubleshooting

### Backend not starting?
```bash
cd backend
npm install
npm start
```

### CORS errors?
Update `CORS_ORIGIN` in `backend/.env`:
```
CORS_ORIGIN=http://localhost:8080
```

### Port already in use?
Change the port in `backend/.env`:
```
PORT=3001
```

## Support

For issues or questions:
1. Check the backend logs in the terminal
2. Review the API documentation in `backend/README.md`
3. Test endpoints using `backend/test-api.html`

---

**Your GreenConnect backend is ready! 🌱**
