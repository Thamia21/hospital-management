# Hospital Management System Backend (MongoDB)

## Features
- REST API for user and appointment management
- JWT-based authentication
- MongoDB with Mongoose models

## Getting Started

1. Install dependencies:
   ```bash
   npm install
   ```
2. Create a `.env` file with your MongoDB URI and JWT secret:
   ```env
   MONGO_URI=mongodb://localhost:27017/hospital_management
   JWT_SECRET=your_jwt_secret
   PORT=5000
   ```
3. Start the server:
   ```bash
   npm run dev
   ```

## API Endpoints
- `POST /api/auth/register` — Register new user
- `POST /api/auth/login` — User login (returns JWT)
- `GET /api/users` — Get all users (requires JWT)
- `POST /api/appointments` — Create appointment (requires JWT)

Add more endpoints as needed for your use case.
