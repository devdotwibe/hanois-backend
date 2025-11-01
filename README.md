# Hanois Backend

A robust Node.js/Express backend API with PostgreSQL database, JWT authentication, and comprehensive error handling.

## 🚀 Features

- RESTful API architecture
- PostgreSQL database with migrations
- JWT-based authentication
- Input validation and sanitization
- Centralized error handling
- Request logging (Morgan)
- CORS support
- Graceful shutdown handling
- Environment-based configuration

## 📋 Prerequisites

- Node.js 
- PostgreSQL (v12 or higher)
- npm 

## 🛠️ Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/devdotwibe/hanois-backend.git
   cd hanois-backend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env
   ```
   
   Edit `.env` file with your configuration:
   ```env
   PORT=5000
   NODE_ENV=development
   
   DB_HOST=localhost
   DB_PORT=5432
   DB_NAME=hanois_db
   DB_USER=postgres
   DB_PASSWORD=your_password
   
   JWT_SECRET=your_super_secret_jwt_key_minimum_32_characters
   JWT_EXPIRES_IN=1h
   
   CORS_ORIGIN=*
   ```

4. **Create PostgreSQL database**
   ```bash
   psql -U postgres
   CREATE DATABASE hanois_db;
   \q
   ```

5. **Run migrations**
   ```bash
   npm run migrate
   ```

##  Running the Application

### Development mode (with auto-reload)
```bash
npm run dev
```

### Production mode
```bash
npm start
```

The server will start on `http://localhost:5000`

## 📚 API Documentation

### Base URL
```
http://localhost:5000/api
```

### Authentication
Most endpoints require a JWT token in the Authorization header:
```
Authorization: Bearer <your_jwt_token>
```

### Endpoints

#### 1. User Registration
**POST** `/api/users/register`

**Request Body:**
```json
{
  "firstName": "John",
  "lastName": "Doe",
  "email": "john@example.com",
  "phone": "+1234567890",
  "password": "SecurePass123"
}
```

**Response:**
```json
{
  "success": true,
  "message": "User registered successfully",
  "data": {
    "user": {
      "id": 1,
      "name": "John Doe",
      "email": "john@example.com",
      "phone": "+1234567890",
      "created_at": "2025-10-30T10:00:00.000Z"
    }
  }
}
```

**Password Requirements:**
- Minimum 8 characters
- At least one uppercase letter
- At least one lowercase letter
- At least one number

#### 2. User Login
**POST** `/api/users/login`

**Request Body:**
```json
{
  "email": "john@example.com",
  "password": "SecurePass123"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "user": {
      "id": 1,
      "name": "John Doe",
      "email": "john@example.com",
      "phone": "+1234567890"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

#### 3. Get All Users (Protected)
**GET** `/api/users/`

**Headers:**
```
Authorization: Bearer <your_jwt_token>
```

**Response:**
```json
{
  "success": true,
  "message": "Users retrieved successfully",
  "data": {
    "users": [
      {
        "id": 1,
        "name": "John Doe",
        "email": "john@example.com",
        "phone": "+1234567890",
        "created_at": "2025-10-30T10:00:00.000Z"
      }
    ],
    "count": 1
  }
}
```

### Error Responses

All error responses follow this format:
```json
{
  "success": false,
  "error": "Error message here",
  "errors": [
    {
      "field": "email",
      "message": "Invalid email format"
    }
  ]
}
```

**Common HTTP Status Codes:**
- `200` - Success
- `201` - Created
- `400` - Bad Request (Validation Error)
- `401` - Unauthorized (Missing/Invalid Token)
- `403` - Forbidden
- `404` - Not Found
- `409` - Conflict (Duplicate Resource)
- `500` - Internal Server Error

##  Database Management

### Create a new migration
```bash
npm run make-migration create_table_name
```

### Run migrations
```bash
npm run migrate
```

### Rollback last migration
```bash
npm run migrate:down
```

## Project Structure

```
hanois-backend/
├── config/
│   └── env.js                 # Environment configuration & validation
├── controllers/
│   └── userController.js      # User-related business logic
├── db/
│   └── pool.js               # PostgreSQL connection pool
├── middleware/
│   ├── auth.js               # JWT authentication middleware
│   ├── errorHandler.js       # Global error handling
│   └── validation.js         # Request validation middleware
├── migrations/
│   ├── *_create-users-table.js
│   ├── *_create-home-table.js
│   ├── *_create-admins-table.js
│   └── *_add-phone-to-users.js
├── models/
│   ├── adminsModel.js        # Admin model
│   └── usersModel.js         # User model
├── routes/
│   └── userRoutes.js         # User routes
├── scripts/
│   └── create-migration-with-model.js
├── utils/
│   ├── errors.js             # Custom error classes
│   ├── response.js           # Response utilities
│   └── validators.js         # Validation functions
├── .env.example              # Environment variables template
├── .gitignore
├── db.js                     # Migration configuration
├── package.json
├── README.md
└── server.js                 # Application entry point
```

##  Security Features

- Password hashing with bcrypt
- JWT token authentication
- Environment variable validation
- SQL injection prevention (parameterized queries)
- CORS configuration
- Input validation and sanitization
- Error message sanitization in production


### Environment
- Development: Full error details and stack traces
- Production: Sanitized error messages

## 📝 Scripts

- `npm start` - Start production server
- `npm run dev` - Start development server with nodemon
- `npm run migrate` - Run database migrations
- `npm run migrate:down` - Rollback last migration
- `npm run make-migration <name>` - Create new migration and model


### Database Connection Errors
- Ensure PostgreSQL is running
- Verify database credentials in `.env`
- Check if database exists

### Migration Errors
- Ensure migrations are run in order
- Check for existing tables before creating
- Verify database user has necessary permissions

### JWT Token Issues
- Ensure JWT_SECRET is properly set
- Check token expiration time
- Verify Authorization header format: `Bearer <token>`
