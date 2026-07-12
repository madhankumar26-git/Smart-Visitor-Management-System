# Smart Visitor Management System Backend

A production-ready Flask backend for a Smart Visitor Management System.

## Features

- User registration and login with JWT authentication
- Password hashing using Werkzeug
- SQLite development database with easy MySQL migration via `DATABASE_URL`
- Global JSON error handling
- CORS enabled
- Clean modular architecture
- Logging for startup, auth events, and failures

## Installation

1. Create a virtual environment and activate it.
2. Install dependencies:

```bash
pip install -r requirements.txt
```

## Environment Setup

Copy `.env.example` to `.env` and provide your values.

```bash
cp .env.example .env
```

Example values:

```env
SECRET_KEY=super-secret-key
JWT_SECRET_KEY=super-secret-jwt-key
DATABASE_URL=sqlite:///instance/visitor_management.db
```

## Running the Server

Start the application:

```bash
python app.py
```

The backend will run on `http://127.0.0.1:5000`.

## API Endpoints

- `GET /` - Health check
- `POST /auth/register` - Register a new user
- `POST /auth/login` - Login and receive JWT token
- `GET /admin/status` - Admin placeholder route
- `GET /security/status` - Security placeholder route

### Register

Request body:

```json
{
  "full_name": "Admin User",
  "email": "admin@example.com",
  "password": "securepassword",
  "role": "admin"
}
```

### Login

Request body:

```json
{
  "email": "admin@example.com",
  "password": "securepassword"
}
```

Response:

```json
{
  "success": true,
  "message": "Login successful.",
  "token": "...",
  "role": "admin",
  "user": {
    "id": 1,
    "name": "Admin User",
    "email": "admin@example.com"
  }
}
```

## Folder Structure

```
server/
├── app.py
├── config.py
├── database.py
├── models.py
├── requirements.txt
├── .env.example
├── README.md
├── routes/
│   ├── auth.py
│   ├── admin.py
│   └── security.py
├── utils/
│   ├── errors.py
│   ├── responses.py
│   └── validators.py
└── instance/
```
