# API Platform

A production-ready, backend API with authentication, todos and professional features.

## Features

- **User Authentication**: Complete JWT-based authentication system with refresh tokens
- **Todo Management**: CRUD operations with filtering, sorting, and pagination
- **Admin Panel**: User management and analytics
- **Security**: Input validation, rate limiting, and protection against common attacks
- **Performance**: Redis caching for faster response times
- **Documentation**: Swagger API documentation

## Tech Stack

- **Framework**: Express.js
- **Database**: MongoDB with Mongoose
- **Cache/Session**: Redis
- **Authentication**: JWT, bcrypt
- **Validation**: Joi
- **Email**: Nodemailer
- **Security**: Helmet, express-mongo-sanitize, xss-clean
- **Documentation**: Swagger/OpenAPI
- **Testing**: Jest, Supertest

## Getting Started

### Prerequisites

- Node.js (v21 or higher)
- MongoDB
- Redis

### Installation

1. Clone the repository
2. Install dependencies:
   ```
   npm install
   ```
3. Create a `.env` file based on `.env.example`:
   ```
   cp .env.example .env
   ```
4. Update the `.env` file with your configuration

### Running the API

**Development mode:**
```
npm run dev
```

**Production mode:**
```
npm start
```

### Seeding the Database

To populate the database with sample data:
```
npm run seed
```

This will create:
- 100 users (including 1 admin user)
- 2,000 todos


## API Documentation

API documentation is available at `/api-docs` when the server is running.

## API Endpoints

### Authentication

- `POST /api/v1/auth/register`: Register a new user
- `POST /api/v1/auth/verify`: Verify email with OTP
- `POST /api/v1/auth/login`: Login a user
- `POST /api/v1/auth/refresh`: Refresh access token
- `POST /api/v1/auth/logout`: Logout a user
- `POST /api/v1/auth/forgot-password`: Send password reset OTP
- `POST /api/v1/auth/reset-password`: Reset password with OTP
- `GET /api/v1/auth/me`: Get current user

### Todos

- `POST /api/v1/todos`: Create a new todo
- `GET /api/v1/todos`: Get all todos for current user (public access)
- `GET /api/v1/todos/:id`: Get a specific todo
-  `GET /api/v1/todos/me`: Get all todos for current user (private access)
- `PUT /api/v1/todos/:id`: Update a todo
- `DELETE /api/v1/todos/:id`: Delete a todo
- `POST /api/v1/todos/bulk-delete`: Delete multiple todos

### Posts

- `POST /api/v1/posts`: Create a new post
- `GET /api/v1/posts`: Get all posts
- `GET /api/v1/posts/:id`: Get a specific post
- `PUT /api/v1/posts/:id`: Update a post
- `DELETE /api/v1/posts/:id`: Delete a post

### Admin

- `GET /api/v1/admin/users`: Get all users (admin only)
- `DELETE /api/v1/admin/users/:id`: Delete a user (admin only)
- `PUT /api/v1/admin/users/:id`: Update user role/verification (admin only)
- `GET /api/v1/admin/analytics`: Get system analytics (admin only)

### Health

- `GET /api/v1/health`: Health check endpoint

## Authentication Flow

1. **Registration**: User registers with name, email, and password
2. **Verification**: User receives a 6-digit OTP via email to verify their account
3. **Login**: User logs in with email and password, receives access and refresh tokens
4. **Token Refresh**: Access token expires after 15 minutes, refresh token used to get a new one
5. **Logout**: Both tokens are invalidated
6. **Password Reset**: User can request a password reset via email OTP

## Rate Limiting

- Login: 5 attempts per 15 minutes
- OTP requests: 3 requests per 10 minutes
- General API: 100 requests per 15 minutes

## Security Features

- JWT stored in HttpOnly cookies
- Password hashing with bcrypt
- Input validation and sanitization
- Protection against NoSQL injection
- XSS protection
- Rate limiting to prevent brute force attacks
- Secure HTTP headers with Helmet

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License - see the LICENSE file for details.