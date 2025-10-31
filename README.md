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
- **Facility-Based Doctor Filtering**: Patients only see doctors from their registered facilities
- **Multi-Facility Support**: Doctors can work at multiple hospitals/clinics
- **Email Notifications**: Automatic confirmation, reschedule, and cancellation emails
- **Multi-Provider Support**: Book with doctors or nurses
- **Real-time Updates**: Live appointment status tracking
- **Optional Payments**: Pay consultation fee via Stripe or pay later at facility

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

## 🏥 Facility-Based Doctor Filtering

### Overview
The system implements intelligent facility-based filtering to ensure patients only see doctors who work at their registered facilities. This feature supports the real-world scenario where:
- Patients register at specific hospitals or clinics
- Doctors can work at multiple facilities
- Appointment booking shows only relevant healthcare providers

### How It Works
1. **Patient Registration**: Patients select their facility during registration
2. **Doctor Assignment**: Doctors are assigned to one or more facilities by administrators
3. **Smart Filtering**: When booking appointments, patients only see doctors from their facilities
4. **Multi-Facility Support**: Doctors working at multiple locations appear for patients at all those facilities

### Key Benefits
- ✅ **Improved User Experience**: Patients see only relevant doctors
- ✅ **Reduced Confusion**: No irrelevant healthcare providers in the list
- ✅ **Multi-Facility Support**: Doctors can serve multiple locations
- ✅ **Scalable Architecture**: Efficient MongoDB queries with `$in` operator

### Sample Facilities
The system includes 55+ South African healthcare facilities including:
- **Rob Ferreira Hospital** (Mpumalanga)
- **Themba Hospital** (Mpumalanga)
- **Chris Hani Baragwanath Hospital** (Gauteng)
- **Charlotte Maxeke Hospital** (Gauteng)
- **Groote Schuur Hospital** (Western Cape)
- And many more across all provinces

### Sample Doctors
10 doctors have been added to Rob Ferreira and Themba hospitals covering specializations:
- Emergency Medicine, Pediatrics, General Surgery
- Obstetrics & Gynecology, Internal Medicine
- Cardiology, Orthopedics, Psychiatry
- Radiology, Anesthesiology

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

### 5. Seed facilities (REQUIRED)
```bash
cd backend
node scripts/seedFacilities.js
```

This will add 55+ South African healthcare facilities to your database, including:
- Hospitals across all 9 provinces
- Clinics and community health centers
- Academic and teaching hospitals
- Provincial and district hospitals

### 6. Seed demo accounts (optional but recommended)
```bash
cd backend
npm run seed-demo
```

This creates demo accounts for testing:
- Patient account
- Doctor account
- Nurse account
- Admin account

### 7. Add doctors to facilities (optional)
```bash
# From project root
node addDoctorsNow.js
```

This adds 10 doctors to Rob Ferreira and Themba hospitals with various specializations.

### 8. Start the backend server
```bash
cd backend
npm start
```

### 9. Start the frontend development server
```bash
# In a new terminal, from the project root
npm run dev
```

### 10. Access the application
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
- **React Router v6** for client-side routing
- **React Query (TanStack Query)** for server state management
- **Axios** for HTTP requests
- **Stripe Elements** for payment processing
- **date-fns** for date manipulation
- **SweetAlert2** for beautiful alerts

### Backend
- **Node.js 18+** with Express.js framework
- **MongoDB** with Mongoose ODM
- **JWT (jsonwebtoken)** for authentication
- **Bcrypt** for password hashing
- **Nodemailer** for email notifications
- **Stripe API** for payment processing
- **CORS** for cross-origin resource sharing

### Database
- **MongoDB** - NoSQL database
- **Mongoose** - ODM for MongoDB
- **Indexed Queries** - Optimized facility-based filtering
- **Population** - Efficient relationship handling

### Key Features
- **Multilingual Support** for all 11 South African languages
- **Role-based Access Control** (RBAC)
- **Facility-Based Filtering** with multi-facility support
- **Real-time Email Notifications**
- **Responsive Design** for mobile and desktop
- **Professional Medical UI/UX**
- **Secure Payment Integration**

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

## 📚 Documentation

Comprehensive guides are available in the project root:

- **`FACILITY_SETUP_GUIDE.md`** - Complete guide for adding and managing facilities ⭐ NEW
- **`FACILITY_BASED_DOCTOR_FILTERING.md`** - Technical details of the facility filtering feature
- **`HOW_TO_ADD_DOCTORS_WITH_FACILITIES.md`** - Complete guide for adding doctors with facility assignments
- **`QUICK_START_ADD_DOCTORS.md`** - Quick reference for adding doctors
- **`POSTMAN_ADD_DOCTORS_GUIDE.md`** - Step-by-step Postman guide for adding doctors via API
- **`ROB_FERREIRA_THEMBA_DOCTORS.md`** - List of doctors added to specific hospitals
- **`DOCTORS_ADDED_SUMMARY.md`** - Summary of doctors in the database
- **`ADMIN_FACILITY_ASSIGNMENT_GUIDE.md`** - Guide for administrators to assign facilities
- **`SUBMISSION_SUMMARY.md`** - Project submission overview
- **`SUBMISSION_CHECKLIST.md`** - Pre-submission checklist

## 🏥 Facility Management

> 📖 **For detailed facility setup instructions, see [`FACILITY_SETUP_GUIDE.md`](./FACILITY_SETUP_GUIDE.md)**

### Seeding Facilities

The system comes with 55+ pre-configured South African healthcare facilities. To add them to your database:

```bash
cd backend
node scripts/seedFacilities.js
```

**What gets added:**
- 55+ healthcare facilities across South Africa
- Hospitals in all 9 provinces
- Community health centers and clinics
- Academic and teaching hospitals
- Provincial and district hospitals

**Facilities include:**
- **Gauteng**: Chris Hani Baragwanath, Charlotte Maxeke, Steve Biko
- **Western Cape**: Groote Schuur, Tygerberg, Red Cross Children's
- **KwaZulu-Natal**: Inkosi Albert Luthuli, King Edward VIII
- **Mpumalanga**: Rob Ferreira, Themba Hospital
- And many more across all provinces

### Adding Custom Facilities

To add your own facilities, you can:

**Option 1: Via Admin Portal** (Coming soon)
- Login as admin
- Navigate to Facility Management
- Click "Add New Facility"
- Fill in facility details

**Option 2: Via API**
```bash
POST http://localhost:5000/api/facilities
Authorization: Bearer <admin_token>
Content-Type: application/json

{
  "name": "Your Hospital Name",
  "type": "HOSPITAL",
  "address": "123 Main Street, City",
  "province": "Gauteng",
  "district": "Johannesburg",
  "phone": "+27 11 123 4567",
  "email": "info@yourhospital.com"
}
```

**Option 3: Direct MongoDB Insert**
```javascript
// Using MongoDB shell or Compass
db.facilities.insertOne({
  name: "Your Hospital Name",
  type: "HOSPITAL",
  address: "123 Main Street, City",
  province: "Gauteng",
  district: "Johannesburg",
  phone: "+27 11 123 4567",
  email: "info@yourhospital.com",
  createdAt: new Date()
})
```

### Facility Types

The system supports various facility types:
- `HOSPITAL` - General hospitals
- `CLINIC` - Community clinics
- `CHC` - Community Health Centers
- `ACADEMIC` - Teaching/Academic hospitals
- `DISTRICT` - District hospitals
- `PROVINCIAL` - Provincial hospitals
- `PRIVATE` - Private hospitals

## 🛠️ Useful Scripts

### Add Doctors to Facilities
```bash
# Add 10 doctors to Rob Ferreira and Themba hospitals
node addDoctorsNow.js
```

### Assign Facility to Patient
```bash
# Assign a facility to a patient account
node assignFacilityToPatient.js
```

### Check Patient Facility Assignment
```bash
# Verify if a patient has facility assignment
node checkPatientFacility.js
```

### Test Doctor Fetch
```bash
# Test if doctors can be fetched for a facility
node testDoctorFetch.js
```

## 🐛 Troubleshooting

### Doctors Not Showing in Appointment Booking

**Problem**: Patient can't see doctors when trying to book an appointment.

**Solution**:
1. **Check if patient has facility assignment**:
   ```bash
   node checkPatientFacility.js
   ```

2. **Assign facility to patient**:
   ```bash
   node assignFacilityToPatient.js
   ```

3. **Important**: After assigning a facility, the patient must **logout and login again** for the changes to take effect.

4. **Verify doctors exist**:
   ```bash
   node testDoctorFetch.js
   ```

### Token Issues

**Problem**: "Invalid token" errors in API requests.

**Solution**: 
- Logout and login again to get a fresh token
- Check that the Authorization header format is: `Bearer YOUR_TOKEN`
- Ensure the token hasn't expired (24-hour validity)

### MongoDB Connection Issues

**Problem**: Cannot connect to MongoDB.

**Solution**:
- Ensure MongoDB is running: `mongod` or check MongoDB service
- Verify connection string in `backend/.env`
- For MongoDB Atlas, check network access and credentials

### Email Not Sending

**Problem**: Verification or notification emails not being sent.

**Solution**:
- Check Gmail SMTP configuration in `backend/.env`
- Enable "Less secure app access" or use App Password
- Verify EMAIL_USER and EMAIL_PASS are correct

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
