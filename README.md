# Hospital Management System

A full-stack web application for managing hospital operations, built with React (Vite), Node.js, Express, and MongoDB.

## Features
- **User Roles:** Admin, Doctor, Nurse, Patient
- **User Registration & Login:**
  - Register as a patient (admin, doctor, nurse accounts are seeded)
  - Login using either User ID or Email
  - Email verification for new users
- **Dashboards:**
  - Role-based dashboards for Admin, Doctor, Nurse, and Patient
- **Appointments:**
  - Book, view, and manage appointments
- **Staff Management:**
  - Admin can add/manage staff
- **Medical Records, Billing, Messaging, and more**

## Default Accounts
| Role    | Email                  | Password     | Example User ID |
|---------|------------------------|--------------|-----------------|
| Admin   | admin@hospital.com     | Admin@123    | ADxxxxx         |
| Doctor  | doctor@hospital.com    | Doctor@123   | DOxxxxx         |
| Nurse   | nurse@hospital.com     | Nurse@123    | NUxxxxx         |
| Patient | patient@hospital.com   | Patient@123  | PAxxxxx         |

> **Note:** User IDs are generated automatically and can be used for login.

## Getting Started

### 1. Clone the repository
```bash
git clone https://github.com/Thamia21/hospital-management.git
cd hospital-management
```

### 2. Install dependencies
```bash
npm install
cd backend && npm install
```

### 3. Set up environment variables
- Copy `.env.example` to `.env` in both root and `backend` folders, and fill in your values.

### 4. Seed Default Users
```bash
cd backend
node seedDefaultUsers.js
```

### 5. Start the backend
```bash
npm start
```

### 6. Start the frontend
```bash
cd ..
npm run dev
```

### 7. Access the app
- Frontend: [http://localhost:5173](http://localhost:5173)
- Backend API: [http://localhost:5000](http://localhost:5000)

## Project Structure
```
/
├── backend/            # Express API & MongoDB models
├── src/                # React frontend
├── public/             # Static assets
├── .env                # Environment variables (not committed)
├── README.md           # This file
```

## Security
- Passwords are hashed (bcrypt)
- JWT authentication
- Email verification required for new users
- Sensitive files like `.env` are gitignored

## License
This project is for educational purposes. Please customize and secure before production use.

---

### Developed by Thamia21 and contributors
