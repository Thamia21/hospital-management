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


// Layouts
import MainLayout from './components/layout/MainLayout';
import PatientLayout from './components/layout/PatientLayout';
import SuspenseFallback from './components/loading/SuspenseFallback';

// Pages
import Dashboard from './pages/Dashboard';
import DoctorDashboard from './pages/DoctorDashboard';
import Patients from './pages/Patients';
import Doctors from './pages/Doctors';
import Appointments from './pages/Appointments';
import Pharmacy from './pages/Pharmacy';
import Billing from './pages/Billing';
import Login from './pages/Login';
import AdminLogin from './pages/AdminLogin';
import Profile from './pages/Profile';
import Unauthorized from './pages/Unauthorized';
import PatientRegistration from './pages/PatientRegistration';
import PatientPortal from './pages/PatientPortal';
import BookAppointment from './pages/BookAppointment';
import PatientDetails from './pages/PatientDetails';
import Settings from './pages/Settings';
import NurseDashboard from './pages/NurseDashboard';
import Tasks from './pages/Tasks';
import MedicalRecords from './pages/MedicalRecords';
import Messages from './pages/Messages';
import VerifyEmail from './pages/VerifyEmail';
import AddStaff from './pages/AddStaff';
import StaffManagement from './pages/StaffManagement';
import AdminDashboard from './pages/AdminDashboard';

const ForgotPassword = React.lazy(() => import('./pages/ForgotPassword'));
const ResetPassword = React.lazy(() => import('./pages/ResetPassword'));

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
    <AuthProvider>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <LocalizationProvider dateAdapter={AdapterDateFns}>
          <QueryClientProvider client={queryClient}>
            <LoadingProvider>
              <ErrorProvider>
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
        user ? <RootRedirect /> : <PatientRegistration />
      } />
      <Route path="/forgot-password" element={<Suspense fallback={null}><ForgotPassword /></Suspense>} />
      <Route path="/reset-password" element={<Suspense fallback={null}><ResetPassword /></Suspense>} />
      <Route path="/verify-email" element={<VerifyEmail />} />
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
        path="/admin/dashboard"
        element={
          <ProtectedRoute allowedRoles={["ADMIN"]}>
            <AdminDashboard />
          </ProtectedRoute>
        }
      />
      <Route path="/unauthorized" element={<Unauthorized />} />
      {/* Messages Route */}
      <Route path="/messages" element={
        <ProtectedRoute allowedRoles={['ADMIN', 'DOCTOR', 'PATIENT', 'NURSE']}>
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

        {/* Doctor Dashboard */}
        <Route path="/doctor-dashboard" element={
          <ProtectedRoute allowedRoles={['DOCTOR']}>
            <DoctorDashboard />
          </ProtectedRoute>
        } />
        <Route path="/patient/:patientId" element={
          <ProtectedRoute allowedRoles={['DOCTOR']}>
            <PatientDetails />
          </ProtectedRoute>
        } />

        {/* Nurse Dashboard */}
        <Route path="/nurse-dashboard" element={
          <ProtectedRoute allowedRoles={['NURSE']}>
            <NurseDashboard />
          </ProtectedRoute>
        } />

        <Route path="/appointments" element={
          <ProtectedRoute allowedRoles={['ADMIN', 'DOCTOR', 'NURSE']}>
            <Appointments />
          </ProtectedRoute>
        } />

        <Route path="/patients" element={
          <ProtectedRoute allowedRoles={['ADMIN', 'DOCTOR', 'NURSE']}>
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
        <Route path="/tasks" element={
          <ProtectedRoute allowedRoles={['NURSE']}>
            <Tasks />
          </ProtectedRoute>
        } />
        <Route path="/medical-records" element={
          <ProtectedRoute allowedRoles={['NURSE']}>
            <MedicalRecords />
          </ProtectedRoute>
        } />
      </Route>

      {/* Patient Routes */}
      <Route element={<PatientLayout />}>
        <Route path="/patient-portal" element={
          <ProtectedRoute allowedRoles={['patient', 'PATIENT']}>
            <PatientPortal />
          </ProtectedRoute>
        } />
        <Route path="/book-appointment" element={
          <ProtectedRoute allowedRoles={['patient', 'PATIENT']}>
            <BookAppointment />
          </ProtectedRoute>
        } />
        <Route path="/settings" element={
          <ProtectedRoute allowedRoles={['patient', 'PATIENT']}>
            <Settings />
          </ProtectedRoute>
        } />
      </Route>

      {/* Common Routes */}
      <Route element={<MainLayout />}>
        <Route path="/profile" element={
          <ProtectedRoute>
            <Profile />
          </ProtectedRoute>
        } />

        {/* Default Routes */}
        <Route path="/" element={<RootRedirect />} />
        <Route path="*" element={<RootRedirect />} />
      </Route>
    </Routes>
  );
}

export default App;
