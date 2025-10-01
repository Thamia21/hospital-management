# 🏥 Hospital Management System

A comprehensive, multilingual hospital management system built for South African healthcare providers. Features modern React frontend, robust Node.js backend, and complete MongoDB integration.

## ✨ Key Features

### 🌍 **Multilingual Support**
- **Complete South African Language Coverage**: All 11 official languages supported
- **Native Language Interface**: isiZulu, isiXhosa, Afrikaans, Sesotho, Setswana, siSwati, isiNdebele, Xitsonga, Tshivenḓa, Sepedi, English
- **Healthcare-Specific Translations**: Medical terminology appropriately translated
- **Cultural Sensitivity**: Respectful and appropriate messaging for diverse communities

### 👥 **Role-Based Access Control**
- **Patient Portal**: Appointment booking, medical records, prescriptions, billing
- **Doctor Portal**: Patient management, appointment scheduling, medical records, prescriptions
- **Nurse Portal**: Patient care, medication management, task coordination
- **Admin Portal**: Staff management, system administration, reporting

### 📅 **Advanced Appointment System**
- **Smart Scheduling**: Available time slot detection with conflict prevention
- **Email Notifications**: Automatic confirmation, reschedule, and cancellation emails
- **Multi-Provider Support**: Book with doctors or nurses
- **Real-time Updates**: Live appointment status tracking
- **Optional Payments**: Pay consultation fee via PayPal or pay later at facility

### 💊 **Comprehensive Medical Management**
- **Electronic Medical Records**: Complete patient history and documentation
- **Prescription Management**: Digital prescriptions with medication tracking
- **Test Results**: Lab results management and patient notifications
- **Billing System**: South African Rand (ZAR) currency support with payment tracking

### 🔐 **Security & Authentication**
- **JWT Authentication**: Secure token-based authentication
- **Email Verification**: Required email verification for new accounts
- **Password Security**: Bcrypt hashing with strength requirements
- **Role-Based Permissions**: Granular access control by user role

## 🎭 Demo Accounts

The system comes with pre-configured demo accounts for testing all roles:

| Role    | Email                        | Password     | User ID | Name                |
|---------|------------------------------|--------------|---------|---------------------|
| Patient | john.doe@example.com         | patient123   | PAT001  | John Doe            |
| Nurse   | mary.johnson@hospital.com    | nurse123     | NUR001  | Sister Mary Johnson |
| Doctor  | michael.smith@hospital.com   | doctor123    | DOC001  | Dr. Michael Smith   |
| Admin   | admin@hospital.com           | admin123     | ADM001  | Admin User          |

> **ℹ️ Note:** You can login using either email address or User ID. All demo accounts are pre-verified and ready to use.

## 🚀 Getting Started

### 1. Clone the repository
```bash
git clone https://github.com/Thamia21/hospital-management.git
cd hospital-management
```

### 2. Install dependencies
```bash
# Install frontend dependencies
npm install

# Install backend dependencies
cd backend
npm install
```

### 3. Set up environment variables
```bash
# Copy environment template
cp .env.example .env
cp backend/.env.example backend/.env

# Edit the .env files with your actual values:
# - MongoDB connection string
# - JWT secret key
# - Email configuration (Gmail SMTP)
# - (Optional) PayPal client credentials for payments
```

### 4. Set up MongoDB
```bash
# Make sure MongoDB is running locally, or use MongoDB Atlas
# The default connection string is: mongodb://localhost:27017/hospital_management
```

### 5. Seed demo accounts (optional)
```bash
cd backend
npm run seed-demo
```

### 6. Start the backend server
```bash
cd backend
npm start
```

### 7. Start the frontend development server
```bash
# In a new terminal, from the project root
npm run dev
```

### 8. Access the application
- **Frontend**: [http://localhost:5173](http://localhost:5173)
- **Backend API**: [http://localhost:5000](http://localhost:5000)
- **Demo Login**: Use any of the demo accounts listed above

## 💳 Optional Payments (PayPal)

Patients can optionally pay the consultation fee when booking an appointment. If they choose not to pay, they can still complete the booking and pay at the facility.

### Backend Configuration

Set the following variables in `backend/.env` (copied from `backend/.env.example`):

```env
PAYPAL_CLIENT_ID=your-paypal-client-id
PAYPAL_SECRET=your-paypal-secret
# Use 'sandbox' for testing or 'live' for production
PAYPAL_MODE=sandbox
```

The backend exposes these routes (protected by auth):

- `GET /api/payments/config` — returns PayPal `clientId` and mode
- `POST /api/payments/create-order` — creates a PayPal order (defaults: 50.00 ZAR)
- `POST /api/payments/capture-order` — captures a PayPal order and, if `appointmentId` is supplied, updates that appointment's payment fields

### Frontend Usage

- The booking page `src/pages/patient/BookAppointment.jsx` now displays an informational banner: "To see a doctor pay R50".
- A toggle labeled "Pay Consultation Fee Now (Optional)" enables PayPal checkout.
- On successful PayPal payment, the appointment is submitted with payment metadata recorded as paid.
- If no payment is made, the appointment can still be booked as usual.

## 📁 Project Structure

```
hospital-management-system/
├── backend/                    # Node.js/Express API Server
│   ├── models/                 # MongoDB/Mongoose models
│   ├── routes/                 # API route handlers
│   ├── services/               # Email and other services
│   ├── scripts/                # Database seeding scripts
│   ├── utils/                  # Utility functions
│   └── server.js               # Express server entry point
├── src/                        # React Frontend Application
│   ├── components/             # Reusable React components
│   ├── pages/                  # Page components (Patient, Doctor, etc.)
│   ├── context/                # React Context providers
│   ├── services/               # API service functions
│   └── App.jsx                 # Main React application
├── public/                     # Static assets
├── .env.example                # Environment variables template
├── .gitignore                  # Git ignore rules
└── README.md                   # Project documentation
```

## 🔧 Technology Stack

### Frontend
- **React 18** with Vite for fast development
- **Material-UI (MUI)** for professional UI components
- **React Router** for client-side routing
- **React Query** for server state management
- **Axios** for HTTP requests

### Backend
- **Node.js** with Express.js framework
- **MongoDB** with Mongoose ODM
- **JWT** for authentication
- **Bcrypt** for password hashing
- **Nodemailer** for email notifications

### Features
- **Multilingual Support** for all 11 South African languages
- **Role-based Access Control** (RBAC)
- **Real-time Email Notifications**
- **Responsive Design** for mobile and desktop
- **Professional Medical UI/UX**

## 🔒 Security Features

- ✅ **Password Hashing**: Bcrypt with salt rounds
- ✅ **JWT Authentication**: Secure token-based auth
- ✅ **Email Verification**: Required for new accounts
- ✅ **Environment Variables**: Sensitive data protected
- ✅ **Role-based Permissions**: Granular access control
- ✅ **Input Validation**: Server-side data validation
- ✅ **CORS Configuration**: Secure cross-origin requests

## 🌍 Multilingual Support

The system supports all 11 South African official languages:
- English, Afrikaans, isiZulu, isiXhosa, Sesotho
- Setswana, siSwati, isiNdebele, Xitsonga, Tshivenḓa, Sepedi

## 📧 Email Configuration

The system sends automatic email notifications for:
- Account verification
- Appointment confirmations
- Appointment reschedules
- Appointment cancellations

Configure Gmail SMTP in your `.env` file for email functionality.

## 👥 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is developed for educational and healthcare improvement purposes. Please ensure proper security measures and compliance with healthcare regulations before production deployment.

## 👏 Acknowledgments

- Built for South African healthcare providers
- Designed with cultural sensitivity and inclusivity
- Focused on improving healthcare accessibility

---

**Developed by Thamia21** 🇦🇺  
*Empowering South African Healthcare Through Technology*
