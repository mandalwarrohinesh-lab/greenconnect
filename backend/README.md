# GreenConnect Backend API

Backend REST API for GreenConnect - Smart Clean & Green Community Platform

## Features

- 🔐 JWT Authentication & Authorization
- 👤 User Profile Management
- 📱 Social Feed (Posts, Likes, Comments)
- 📸 Stories (24-hour temporary posts)
- 🚨 Environmental Issue Reporting with AI Analysis
- 🗺️ Interactive Map with Geolocation
- 🌳 Events & Cleanup Drives
- 🛒 Eco Marketplace with Points System
- ⭐ Points & Rewards Engine
- 🔔 Real-time Notifications (WebSocket)
- 🔍 User Search & Discovery

## Tech Stack

- **Runtime:** Node.js
- **Framework:** Express.js
- **Authentication:** JWT (JSON Web Tokens)
- **Real-time:** WebSocket (ws)
- **Database:** In-memory (for development)
- **Password Hashing:** bcryptjs

## Installation

1. Navigate to the backend directory:
```bash
cd backend
```

2. Install dependencies:
```bash
npm install
```

3. Create `.env` file (copy from `.env.example`):
```bash
cp .env.example .env
```

4. Update `.env` with your configuration:
```env
PORT=3000
JWT_SECRET=your-secret-key-change-this-in-production
JWT_EXPIRES_IN=24h
CORS_ORIGIN=*
NODE_ENV=development
```

## Running the Server

### Development Mode (with auto-reload):
```bash
npm run dev
```

### Production Mode:
```bash
npm start
```

The server will start on `http://localhost:3000`

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user

### Users
- `GET /api/users/me` - Get current user profile
- `PUT /api/users/me` - Update user profile
- `GET /api/users/search?q=query` - Search users
- `GET /api/users/:id` - Get user by ID
- `POST /api/users/:id/follow` - Follow user
- `DELETE /api/users/:id/follow` - Unfollow user

### Posts
- `GET /api/posts/feed` - Get feed posts (paginated)
- `POST /api/posts` - Create new post
- `GET /api/posts/:id` - Get single post
- `POST /api/posts/:id/like` - Like/Unlike post
- `DELETE /api/posts/:id` - Delete post

### Stories
- `GET /api/stories` - Get all active stories
- `POST /api/stories` - Create new story
- `POST /api/stories/:id/view` - View story
- `DELETE /api/stories/:id` - Delete story

### Issues
- `GET /api/issues` - Get all issues (with location filter)
- `POST /api/issues` - Report new issue (with AI analysis)
- `GET /api/issues/:id` - Get single issue
- `PATCH /api/issues/:id/status` - Update issue status

### Events
- `GET /api/events` - Get all events (with location filter)
- `POST /api/events` - Create new event
- `GET /api/events/:id` - Get single event
- `POST /api/events/:id/join` - Join event
- `DELETE /api/events/:id/join` - Leave event
- `GET /api/events/trending` - Get trending events

### Products
- `GET /api/products` - Get all products (with filters)
- `GET /api/products/:id` - Get single product
- `POST /api/products/:id/redeem` - Redeem product with points
- `GET /api/products/featured/list` - Get featured products

### Comments
- `GET /api/comments/post/:postId` - Get comments for post
- `POST /api/comments/post/:postId` - Add comment to post
- `DELETE /api/comments/:id` - Delete comment

### Notifications
- `GET /api/notifications` - Get user notifications
- `GET /api/notifications/unread/count` - Get unread count
- `PATCH /api/notifications/:id/read` - Mark as read
- `PATCH /api/notifications/read-all` - Mark all as read
- `DELETE /api/notifications/:id` - Delete notification

### Health Check
- `GET /api/health` - API health status

## Authentication

All endpoints except `/api/auth/register` and `/api/auth/login` require authentication.

Include the JWT token in the Authorization header:
```
Authorization: Bearer <your-jwt-token>
```

## Sample Users

The database is initialized with 3 sample users:

1. **Sarah Johnson**
   - Email: `sarah@greenconnect.com`
   - Password: `password123`

2. **Mike Chen**
   - Email: `mike@greenconnect.com`
   - Password: `password123`

3. **Emma Wilson**
   - Email: `emma@greenconnect.com`
   - Password: `password123`

## WebSocket

WebSocket server runs on the same port as the HTTP server.

Connect to: `ws://localhost:3000`

## Points System

Users earn eco points for:
- Creating a post: **10 points**
- Reporting an issue: **50 points**
- Participating in an event: **100 points** (after completion)

Points can be redeemed for products in the marketplace.

## AI Waste Detection

The `/api/issues` endpoint includes simulated AI waste detection that:
- Classifies waste type (Plastic, Illegal Dumping, Overflowing Bins, Other)
- Determines priority level (High, Medium, Low)
- Estimates quantity (Small, Medium, Large)
- Assesses hazard level

## Database

Currently uses in-memory storage for development. For production:
- Replace with PostgreSQL, MongoDB, or your preferred database
- Update `database/db.js` with actual database connections
- Implement proper data persistence

## Error Handling

All errors return JSON in the format:
```json
{
  "error": {
    "message": "Error description",
    "status": 400
  }
}
```

## CORS

CORS is enabled for all origins in development. Update `CORS_ORIGIN` in `.env` for production.

## Rate Limiting

Currently not implemented. Add rate limiting middleware for production.

## Future Enhancements

- [ ] PostgreSQL/MongoDB integration
- [ ] Real AI/ML model for waste detection
- [ ] Image upload with cloud storage (AWS S3, Cloudinary)
- [ ] Email notifications
- [ ] Rate limiting
- [ ] API documentation (Swagger/OpenAPI)
- [ ] Unit and integration tests
- [ ] Docker containerization
- [ ] CI/CD pipeline

## License

MIT
