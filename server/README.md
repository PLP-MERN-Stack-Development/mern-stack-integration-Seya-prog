# MERN Blog Server

Backend API for the MERN Stack Blog Application built with Express.js, MongoDB, and Node.js.

## Features

- RESTful API design
- JWT authentication
- Input validation with express-validator
- Image upload with Multer
- MongoDB with Mongoose ODM
- Error handling middleware
- CORS enabled
- Password hashing with bcrypt

## API Endpoints

### Authentication Routes (`/api/auth`)

| Method | Endpoint | Description | Access |
|--------|----------|-------------|---------|
| POST | `/register` | Register a new user | Public |
| POST | `/login` | Login user | Public |
| GET | `/me` | Get current user | Private |
| PUT | `/updatedetails` | Update user details | Private |
| PUT | `/updatepassword` | Update password | Private |

### Post Routes (`/api/posts`)

| Method | Endpoint | Description | Access |
|--------|----------|-------------|---------|
| GET | `/` | Get all posts (with pagination) | Public |
| GET | `/search` | Search posts | Public |
| GET | `/:id` | Get single post by ID or slug | Public |
| POST | `/` | Create new post | Private |
| PUT | `/:id` | Update post | Private (Owner/Admin) |
| DELETE | `/:id` | Delete post | Private (Owner/Admin) |
| POST | `/:id/comments` | Add comment to post | Private |
| GET | `/my/posts` | Get user's own posts | Private |

### Category Routes (`/api/categories`)

| Method | Endpoint | Description | Access |
|--------|----------|-------------|---------|
| GET | `/` | Get all categories | Public |
| GET | `/:id` | Get single category | Public |
| POST | `/` | Create new category | Private (Admin) |
| PUT | `/:id` | Update category | Private (Admin) |
| DELETE | `/:id` | Delete category | Private (Admin) |

## Installation

1. Install dependencies:
```bash
npm install
```

2. Create `.env` file based on `.env.example`:
```bash
cp .env.example .env
```

3. Update `.env` with your configuration:
```
PORT=5000
NODE_ENV=development
MONGODB_URI=mongodb://localhost:27017/mern-blog
JWT_SECRET=your_secret_key
JWT_EXPIRE=7d
CLIENT_URL=http://localhost:5173
```

4. Start the development server:
```bash
npm run dev
```

## Environment Variables

- `PORT` - Server port (default: 5000)
- `NODE_ENV` - Environment mode (development/production)
- `MONGODB_URI` - MongoDB connection string
- `JWT_SECRET` - Secret key for JWT tokens
- `JWT_EXPIRE` - JWT token expiration time
- `CLIENT_URL` - Frontend URL for CORS

## Project Structure

```
server/
├── controllers/        # Route controllers
├── middleware/         # Custom middleware
├── models/            # Mongoose models
├── routes/            # API routes
├── uploads/           # Uploaded images
├── server.js          # Main server file
└── package.json       # Dependencies
```

## Models

### User
- name, email, password, role, avatar, bio
- Methods: getSignedJwtToken(), matchPassword()

### Post
- title, content, featuredImage, slug, excerpt, author, category, tags, isPublished, viewCount, comments
- Methods: addComment(), incrementViewCount()

### Category
- name, slug, description, color, postCount
- Methods: updatePostCount()

## Security

- Passwords are hashed using bcrypt
- JWT tokens for authentication
- Input validation on all routes
- Protected routes with auth middleware
- Role-based access control (user/admin)
