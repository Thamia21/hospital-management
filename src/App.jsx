import React, { Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { ThemeProvider, createTheme, CssBaseline } from '@mui/material';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { createQueryClient } from './services/queryClient';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// Context Providers
import { AuthProvider, useAuth } from './context/AuthContext';
import { LoadingProvider } from './context/LoadingContext';
import { ErrorProvider } from './context/ErrorContext';
import { RealTimeProvider } from './context/RealTimeContext';
import { LanguageProvider } from './context/LanguageContext';
import { NotificationProvider } from './context/NotificationContext';


// Layouts
import MainLayout from './components/layout/MainLayout';
import PatientLayout from './components/layout/PatientLayout';
import DoctorLayout from './components/layout/DoctorLayout';
import AdminLayout from './components/layout/AdminLayout';
import NurseLayout from './components/nurse/NurseLayout';
import SuspenseFallback from './components/loading/SuspenseFallback';

// Auth Pages
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import AdminLogin from './pages/admin/AdminLogin';
import VerifyEmail from './pages/auth/VerifyEmail';
import SetPassword from './pages/auth/SetPassword';
import PatientRegistration from './pages/patient/PatientRegistration';

// Admin Pages
import AdminDashboard from './pages/admin/AdminDashboard';
import AddStaff from './pages/admin/AddStaff';
import StaffManagement from './pages/admin/StaffManagement';
import FacilityManagement from './pages/admin/FacilityManagement';
import LeaveManagement from './pages/admin/LeaveManagement';
import PatientManagement from './pages/admin/PatientManagement';
import AddPatient from './pages/admin/AddPatient';
import AdminProfile from './pages/admin/AdminProfile';
import AdminReports from './pages/admin/AdminReports';
import AdminMessages from './pages/admin/AdminMessages';

// Doctor Pages
import DoctorDashboard from './pages/doctor/DoctorDashboard';
import DoctorMessages from './pages/doctor/DoctorMessages';
import DoctorAppointments from './pages/doctor/DoctorAppointments';
import DoctorPatients from './pages/doctor/DoctorPatients';
import DoctorProfile from './pages/doctor/DoctorProfile';
import DoctorPatientMedicalRecords from './pages/doctor/DoctorPatientMedicalRecords';

// Nurse Pages
import NurseDashboard from './pages/nurse/NurseDashboard';
import NurseAppointments from './pages/nurse/NurseAppointments';
import NursePatients from './pages/nurse/NursePatients';
import NurseTasks from './pages/nurse/NurseTasks';
import NurseMedicalRecords from './pages/nurse/NurseMedicalRecords';
import NurseMessages from './pages/nurse/NurseMessages';
import NurseProfile from './pages/nurse/NurseProfile';
import Tasks from './pages/nurse/Tasks';

// Patient Pages
import PatientPortal from './pages/patient/PatientPortal';
import PatientDashboard from './pages/patient/PatientDashboard';
import TestPatientDashboard from './pages/patient/TestPatientDashboard';
import PatientDetails from './pages/patient/PatientDetails';
import BookAppointment from './pages/patient/BookAppointment';
import MedicalRecords from './pages/patient/MedicalRecords';
import PatientMedicalRecords from './pages/patient/PatientMedicalRecords.jsx';
import PatientSettings from './pages/patient/PatientSettings.jsx';
import PatientProfile from './pages/patient/PatientProfile.jsx';
import PatientAppointments from './pages/patient/PatientAppointments';
import TestResults from './pages/patient/TestResults';
import PatientPrescriptions from './pages/patient/PatientPrescriptions';
import PatientBilling from './pages/patient/PatientBillingWrapper';
import HealthSummary from './pages/patient/HealthSummary';
import PatientMessages from './pages/patient/PatientMessages';

// Shared Pages
import Dashboard from './pages/shared/Dashboard';
// Import Patients component with explicit .jsx extension to ensure correct resolution
import Patients from './pages/shared/Patients.jsx';
import Doctors from './pages/shared/Doctors.jsx';
import Pharmacy from './pages/shared/Pharmacy.jsx';
import Billing from './pages/shared/Billing.jsx';
import Profile from './pages/shared/Profile.jsx';
import Settings from './pages/shared/Settings.jsx';
import Messages from './pages/shared/Messages.jsx';
import Unauthorized from './pages/shared/Unauthorized.jsx';

const ForgotPassword = React.lazy(() => import('./pages/auth/ForgotPassword'));
const ResetPassword = React.lazy(() => import('./pages/auth/ResetPassword'));

// Create a custom theme
const theme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#1976d2',
    },
    secondary: {
      main: '#dc004e',
    },
  },
  typography: {
    fontFamily: 'Roboto, Arial, sans-serif',
  },
});

// Protected Route Component
const ProtectedRoute = ({ children, allowedRoles = [] }) => {
  const { user, loading } = useAuth();
  const location = useLocation();
  console.log('ProtectedRoute check:', { 
    user, 
    loading, 
    allowedRoles,
    currentPath: location.pathname 
  });

  if (loading) {
    return <SuspenseFallback />;
  }

  if (!user) {
    console.log('Not authenticated, redirecting to login');
    return <Navigate to="/login" replace />;
  }

  // Only check roles if allowedRoles is provided and not empty
  if (allowedRoles.length > 0) {
    const userRole = user.role?.toUpperCase();
    const normalizedAllowedRoles = allowedRoles.map(role => role.toUpperCase());
    const hasRequiredRole = normalizedAllowedRoles.includes(userRole);
    console.log('Role check:', { 
      userRole, 
      allowedRoles: normalizedAllowedRoles, 
      hasRequiredRole,
      currentPath: location.pathname
    });
    
    if (!hasRequiredRole) {
      console.log('Unauthorized access, redirecting to unauthorized page. Attempted path:', location.pathname);
      return <Navigate to="/unauthorized" replace />;
    }
  }

  console.log('Authorized access, rendering protected route:', location.pathname);
  return children;
};


const NotificationTestWrapper = () => {
  const { user } = useAuth();
  

};

function App() {
  const queryClient = createQueryClient();

  return (
    <LanguageProvider>
      <AuthProvider>
        <ThemeProvider theme={theme}>
          <CssBaseline />
          <LocalizationProvider dateAdapter={AdapterDateFns}>
            <QueryClientProvider client={queryClient}>
              <LoadingProvider>
                <ErrorProvider>
                  <NotificationProvider>
                    <RealTimeProvider>
                    <>
                      <Router>
                        <Suspense fallback={<SuspenseFallback />}>
                          <div>
                            {/*<h1>Hospital Management System</h1>*/}
                            <AppRoutes />
                            <NotificationTestWrapper />
                          </div>
                        </Suspense>
                      </Router>
                    </>
                    <ReactQueryDevtools initialIsOpen={false} />
                    </RealTimeProvider>
                  </NotificationProvider>
                </ErrorProvider>
              </LoadingProvider>
            </QueryClientProvider>
          </LocalizationProvider>
        </ThemeProvider>
        <ToastContainer 
          position="top-right"
          autoClose={5000}
          hideProgressBar={false}
          newestOnTop={false}
          closeOnClick
          rtl={false}
          pauseOnFocusLoss
          draggable
          pauseOnHover
        />
      </AuthProvider>
    </LanguageProvider>
  );
}

function AppRoutes() {
  const { user } = useAuth();
  console.log('AppRoutes - Current user:', user);

  // Handle root route redirect
  const RootRedirect = () => {
    if (!user) return <Navigate to="/login" replace />;
    
    const userRole = user.role?.toUpperCase();
    
    // Prioritize patient portal for PATIENT role
    if (userRole === 'PATIENT') return <Navigate to="/patient-portal" replace />;
    
    // For doctors, redirect to doctor dashboard
    if (userRole === 'DOCTOR') return <Navigate to="/doctor-dashboard" replace />;
    
    // For admins, redirect to admin dashboard
    if (userRole === 'ADMIN') return <Navigate to="/dashboard" replace />;
    
    // For nurses, redirect to nurse dashboard
    if (userRole === 'NURSE') return <Navigate to="/nurse-dashboard" replace />;
    
    // Fallback to profile if no specific role match
    return <Navigate to="/profile" replace />;
  };

  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/login" element={
        user ? <RootRedirect /> : <Login />
      } />
      <Route path="/admin/login" element={<AdminLogin />} />
       <Route path="/register" element={
        user ? <RootRedirect /> : <Register />
      } />
      <Route path="/forgot-password" element={<Suspense fallback={null}><ForgotPassword /></Suspense>} />
      <Route path="/reset-password" element={<Suspense fallback={null}><ResetPassword /></Suspense>} />
      <Route path="/verify-email" element={<VerifyEmail />} />
      <Route element={<AdminLayout />}>
        <Route
          path="/admin/dashboard"
          element={
            <ProtectedRoute allowedRoles={["ADMIN"]}>
              <AdminDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/add-staff"
          element={
            <ProtectedRoute allowedRoles={["ADMIN"]}>
              <AddStaff />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/staff-management"
          element={
            <ProtectedRoute allowedRoles={["ADMIN"]}>
              <StaffManagement />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/facilities"
          element={
            <ProtectedRoute allowedRoles={["ADMIN"]}>
              <FacilityManagement />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/leave-management"
          element={
            <ProtectedRoute allowedRoles={["ADMIN"]}>
              <LeaveManagement />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/patient-management"
          element={
            <ProtectedRoute allowedRoles={["ADMIN"]}>
              <PatientManagement />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/add-patient"
          element={
            <ProtectedRoute allowedRoles={["ADMIN"]}>
              <AddPatient />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/profile"
          element={
            <ProtectedRoute allowedRoles={["ADMIN"]}>
              <AdminProfile />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/reports"
          element={
            <ProtectedRoute allowedRoles={["ADMIN"]}>
              <AdminReports />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/messages"
          element={
            <ProtectedRoute allowedRoles={["ADMIN"]}>
              <AdminMessages />
            </ProtectedRoute>
          }
        />
      </Route>
      <Route path="/unauthorized" element={<Unauthorized />} />
      {/* Messages Routes */}
      <Route path="/messages" element={
        <ProtectedRoute allowedRoles={['PATIENT']}>
          <Messages />
        </ProtectedRoute>
      } />

      {/* Staff Routes */}
      <Route element={<MainLayout />}>
        {/* Admin Dashboard */}
        <Route path="/dashboard" element={
          <ProtectedRoute allowedRoles={['ADMIN']}>
            <Dashboard />
          </ProtectedRoute>
        } />

        {/* Appointments route for patients is defined in the PatientLayout section */}
        {/* Appointments for admin/nurses is handled by the doctor-appointments route */}

        <Route path="/patients" element={
          <ProtectedRoute allowedRoles={['ADMIN']}>
            <Patients />
          </ProtectedRoute>
        } />
        <Route path="/doctors" element={
          <ProtectedRoute allowedRoles={['ADMIN']}>
            <Doctors />
          </ProtectedRoute>
        } />
        <Route path="/pharmacy" element={
          <ProtectedRoute allowedRoles={['ADMIN', 'PHARMACIST']}>
            <Pharmacy />
          </ProtectedRoute>
        } />
        <Route path="/billing" element={
          <ProtectedRoute allowedRoles={['ADMIN']}>
            <Billing />
          </ProtectedRoute>
        } />
        <Route path="/doctor-settings" element={
          <ProtectedRoute allowedRoles={['DOCTOR']}>
            <Settings />
          </ProtectedRoute>
        } />
        {/* Old nurse routes removed - now using NurseLayout routes with sidebar */}
      </Route>
      <Route path="/set-password" element={<SetPassword />} />

      {/* Nurse Routes with NurseLayout */}
      <Route element={<NurseLayout />}>
        <Route path="/nurse-dashboard" element={
          <ProtectedRoute allowedRoles={['NURSE']}>
            <NurseDashboard />
          </ProtectedRoute>
        } />
        <Route path="/nurse-appointments" element={
          <ProtectedRoute allowedRoles={['NURSE']}>
            <NurseAppointments />
          </ProtectedRoute>
        } />
        <Route path="/nurse-patients" element={
          <ProtectedRoute allowedRoles={['NURSE']}>
            <NursePatients />
          </ProtectedRoute>
        } />
        <Route path="/nurse-tasks" element={
          <ProtectedRoute allowedRoles={['NURSE']}>
            <NurseTasks />
          </ProtectedRoute>
        } />
        <Route path="/nurse-medical-records" element={
          <ProtectedRoute allowedRoles={['NURSE']}>
            <NurseMedicalRecords />
          </ProtectedRoute>
        } />
        <Route path="/nurse-messages" element={
          <ProtectedRoute allowedRoles={['NURSE']}>
            <NurseMessages />
          </ProtectedRoute>
        } />
        <Route path="/nurse-profile" element={
          <ProtectedRoute allowedRoles={['NURSE']}>
            <NurseProfile />
          </ProtectedRoute>
        } />
        <Route path="/nurse-settings" element={
          <ProtectedRoute allowedRoles={['NURSE']}>
            <Settings />
          </ProtectedRoute>
        } />
      </Route>

      {/* Doctor Routes */}
      <Route element={<DoctorLayout />}>
        <Route path="/doctor-dashboard" element={
          <ProtectedRoute allowedRoles={['DOCTOR']}>
            <DoctorDashboard />
          </ProtectedRoute>
        } />
        <Route path="/doctor-patients" element={
          <ProtectedRoute allowedRoles={['DOCTOR']}>
            <DoctorPatients />
          </ProtectedRoute>
        } />
        <Route path="/doctor-appointments" element={
          <ProtectedRoute allowedRoles={['DOCTOR']}>
            <DoctorAppointments />
          </ProtectedRoute>
        } />
        <Route path="/doctor-messages" element={
          <ProtectedRoute allowedRoles={['DOCTOR']}>
            <DoctorMessages />
          </ProtectedRoute>
        } />
        <Route path="/doctor-prescriptions" element={
          <ProtectedRoute allowedRoles={['DOCTOR']}>
            <MedicalRecords />
          </ProtectedRoute>
        } />
        <Route path="/doctor-medical-records" element={
          <ProtectedRoute allowedRoles={['DOCTOR']}>
            <MedicalRecords />
          </ProtectedRoute>
        } />
        <Route path="/doctor-consultations" element={
          <ProtectedRoute allowedRoles={['DOCTOR']}>
            <DoctorMessages />
          </ProtectedRoute>
        } />
        <Route path="/doctor-reports" element={
          <ProtectedRoute allowedRoles={['DOCTOR']}>
            <DoctorMessages />
          </ProtectedRoute>
        } />
        <Route path="/patient/:patientId" element={
          <ProtectedRoute allowedRoles={['DOCTOR']}>
            <PatientDetails />
          </ProtectedRoute>
        } />
        <Route path="/doctor-profile" element={
          <ProtectedRoute allowedRoles={['DOCTOR']}>
            <DoctorProfile />
          </ProtectedRoute>
        } />
        <Route path="/doctor-settings" element={
          <ProtectedRoute allowedRoles={['DOCTOR']}>
            <Settings />
          </ProtectedRoute>
        } />
        <Route path="/patient/:patientId/medical-records" element={
          <ProtectedRoute allowedRoles={['DOCTOR']}>
            <DoctorPatientMedicalRecords />
          </ProtectedRoute>
        } />
      </Route>

      {/* Patient Routes */}
      <Route element={<PatientLayout />}>
        <Route path="/patient-portal" element={
          <ProtectedRoute allowedRoles={['PATIENT']}>
            <PatientDashboard />
          </ProtectedRoute>
        } />
        <Route path="/patient-dashboard" element={
          <ProtectedRoute allowedRoles={['PATIENT']}>
            <PatientDashboard />
          </ProtectedRoute>
        } />
        <Route path="/test-patient-dashboard" element={
          <ProtectedRoute allowedRoles={['PATIENT']}>
            <TestPatientDashboard />
          </ProtectedRoute>
        } />
        <Route path="/book-appointment" element={
          <ProtectedRoute allowedRoles={['PATIENT']}>
            <BookAppointment />
          </ProtectedRoute>
        } />
        <Route path="/appointments" element={
          <ProtectedRoute allowedRoles={['PATIENT']}>
            <PatientAppointments />
          </ProtectedRoute>
        } />
        <Route path="/test-results" element={
          <ProtectedRoute allowedRoles={['PATIENT']}>
            <TestResults />
          </ProtectedRoute>
        } />
        <Route path="/patient-prescriptions" element={
          <ProtectedRoute allowedRoles={['PATIENT']}>
            <PatientPrescriptions />
          </ProtectedRoute>
        } />
        <Route path="/patient-billing" element={
          <ProtectedRoute allowedRoles={['PATIENT']}>
            <PatientBilling />
          </ProtectedRoute>
        } />
        <Route path="/health-summary" element={
          <ProtectedRoute allowedRoles={['PATIENT']}>
            <HealthSummary />
          </ProtectedRoute>
        } />
        <Route path="/patient-messages" element={
          <ProtectedRoute allowedRoles={['PATIENT']}>
            <PatientMessages />
          </ProtectedRoute>
        } />
        <Route path="/patient-medical-records" element={
          <ProtectedRoute allowedRoles={['PATIENT']}>
            <PatientMedicalRecords />
          </ProtectedRoute>
        } />
        <Route path="/settings" element={
          <ProtectedRoute allowedRoles={['PATIENT']}>
            <PatientSettings />
          </ProtectedRoute>
        } />
        <Route path="/profile" element={
          <ProtectedRoute allowedRoles={['PATIENT']}>
            <PatientProfile />
          </ProtectedRoute>
        } />
      </Route>

      {/* Common Routes */}
      <Route element={<MainLayout />}>
        {/* Profile route moved to patient-specific routes */}
        {/* <Route path="/profile" element={
          <ProtectedRoute>
            <Profile />
          </ProtectedRoute>
        } /> */}

        {/* Default Routes */}
        <Route path="/" element={<RootRedirect />} />
        <Route path="*" element={<RootRedirect />} />
      </Route>
    </Routes>
  );
}

export default App;
