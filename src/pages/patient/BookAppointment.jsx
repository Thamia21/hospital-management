import React, { useState, useMemo, useEffect, useCallback } from 'react';
import {
  Box,
  Container,
  Paper,
  Typography,
  TextField,
  Button,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
  CircularProgress
} from '@mui/material';
import Switch from '@mui/material/Switch';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { TimePicker } from '@mui/x-date-pickers/TimePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { format, addDays, set } from 'date-fns';
import dayjs from 'dayjs';
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation } from '@tanstack/react-query';
import { useAuth } from '../../context/AuthContext';
import { doctorService, patientService, leaveService } from '../../services/api';
import axios from 'axios';
import StripePaymentForm from '../../components/StripePaymentForm';
import { Elements } from '@stripe/react-stripe-js';
import { stripePromise } from '../../config/stripe';
import Swal from 'sweetalert2';
import withReactContent from 'sweetalert2-react-content';

const MySwal = withReactContent(Swal);

const BUSINESS_HOURS = {
  start: 8, // 8 AM
  end: 17   // 5 PM
};

export default function BookAppointment() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedTime, setSelectedTime] = useState(null);
  const [staffType, setStaffType] = useState('');
  const [selectedStaff, setSelectedStaff] = useState('');
  const [reason, setReason] = useState('');
  const [error, setError] = useState('');
  const [timeError, setTimeError] = useState('');
  const [leaveWarning, setLeaveWarning] = useState('');
  const [alternativeStaff, setAlternativeStaff] = useState([]);
  const [checkingLeave, setCheckingLeave] = useState(false);
  // Optional payment states
  const [payNow, setPayNow] = useState(false);
  const [paymentDetails, setPaymentDetails] = useState(null); // { orderId, capture }
  const [paymentMessage, setPaymentMessage] = useState('');

  // Payment fields
  const [paymentMethod, setPaymentMethod] = useState('CASH');
  const [medicalAidNumber, setMedicalAidNumber] = useState('');
  const [medicalAidProvider, setMedicalAidProvider] = useState('');
  const [insurancePolicyNumber, setInsurancePolicyNumber] = useState('');
  const [insuranceProvider, setInsuranceProvider] = useState('');
  const [bankReferenceNumber, setBankReferenceNumber] = useState('');
  const [paymentNotes, setPaymentNotes] = useState('');

  // Local API client for recording payments
  const API_URL = 'http://localhost:5000/api';
  const getAuthHeader = () => {
    const token = localStorage.getItem('token');
    return token ? { Authorization: `Bearer ${token}` } : {};
  };

  const handlePaymentSuccess = useCallback(async ({ paymentIntentId, amount, currency }) => {
    try {
      if (!paymentIntentId) {
        throw new Error('No payment intent ID received from payment processor');
      }

      // Save payment record to backend
      const paymentRecord = {
        patientId: (user?._id || user?.id || user?.uid),
        billId: null, // not linked to a specific bill for consultation prepayment
        amount: amount,
        currency: currency,
        paymentMethod: 'stripe',
        status: 'completed',
        transactionId: paymentIntentId,
        description: 'Doctor Consultation Fee',
        processedAt: new Date().toISOString(),
        metadata: { paymentIntentId }
      };

      console.log('Saving payment to backend:', {
        url: `${API_URL}/patients/${(user?._id || user?.id || user?.uid)}/payments`,
        paymentRecord
      });
      const saveRes = await axios.post(
        `${API_URL}/patients/${(user?._id || user?.id || user?.uid)}/payments`,
        paymentRecord,
        { headers: getAuthHeader() }
      );
      console.log('Payment saved response:', saveRes.status, saveRes.data);

      setPaymentDetails({ paymentIntentId, amount, currency });
      setPaymentMessage('Payment successful. You can now submit your appointment.');
      // Clear any previous errors
      setError(prev => (prev && prev.includes('payment') ? '' : prev));
    } catch (err) {
      console.error('Error processing payment success:', err);
      if (err.response) {
        console.error('Payment save error response:', err.response.status, err.response.data);
      }
      setError('There was an issue saving your payment. Please try again.');
      setPaymentDetails(null);
      setPaymentMessage('');
    }
  }, [user?._id, user?.id, user?.uid]);

  // Fetch available doctors (filtered by patient's facilities)
  const { 
    data: doctors = [], 
    isLoading: isLoadingDoctors,
    error: doctorsError
  } = useQuery({
    queryKey: ['doctors', user?.facilityIds],
    queryFn: async () => {
      // Pass patient's facilityIds to filter doctors by facility
      const patientFacilityIds = user?.facilityIds || [];
      console.log('=== DOCTOR FETCH DEBUG ===');
      console.log('User object:', user);
      console.log('User facilityIds:', user?.facilityIds);
      console.log('Patient facility IDs for query:', patientFacilityIds);
      console.log('Facility IDs length:', patientFacilityIds.length);
      
      const result = await doctorService.getDoctors(patientFacilityIds);
      console.log('Doctors fetched:', result?.length || 0);
      console.log('Doctor results:', result);
      return result;
    },
    enabled: staffType === 'doctor',  // Removed facilityIds check to allow query to run
    retry: 1,
    onError: (error) => {
      console.error('Error fetching doctors:', error);
      console.error('Error details:', error.response?.data);
    }
  });

  // Fetch available nurses (filtered by patient's facilities)
  const {
    data: nurses = [],
    isLoading: isLoadingNurses,
    error: nursesError
  } = useQuery({
    queryKey: ['nurses', user?.facilityIds],
    queryFn: async () => {
      // Pass patient's facilityIds to filter nurses by facility
      const patientFacilityIds = user?.facilityIds || [];
      console.log('=== NURSE FETCH DEBUG ===');
      console.log('Patient facility IDs for query:', patientFacilityIds);
      const result = await doctorService.getNurses(patientFacilityIds);
      console.log('Nurses fetched:', result?.length || 0);
      return result;
    },
    enabled: staffType === 'nurse',  // Removed facilityIds check
    retry: 1,
    onError: (error) => {
      console.error('Error fetching nurses:', error);
      console.error('Error details:', error.response?.data);
    }
  });

  // Reset staff selection when staff type changes
  useEffect(() => {
    setSelectedStaff('');
  }, [staffType]);

  // When switching to nurse, ensure payment is disabled and cleared
  useEffect(() => {
    if (staffType === 'nurse') {
      setPayNow(false);
      setPaymentDetails(null);
      setPaymentMessage('');
      setPaymentMethod('CASH');
      setMedicalAidNumber('');
      setMedicalAidProvider('');
      setInsurancePolicyNumber('');
      setInsuranceProvider('');
      setBankReferenceNumber('');
      setPaymentNotes('');
    }
  }, [staffType]);

  // Get available staff based on selected type
  const availableStaff = useMemo(() => {
    if (staffType === 'doctor') {
      return doctors;
    }
    if (staffType === 'nurse') {
      return nurses;
    }
    return [];
  }, [staffType, doctors, nurses]);

  // Handle errors
  useEffect(() => {
    if (doctorsError) {
      console.error('Doctors error:', doctorsError);
      setError('Failed to fetch doctors: ' + doctorsError.message);
    } else if (nursesError) {
      console.error('Nurses error:', nursesError);
      setError('Failed to fetch nurses: ' + nursesError.message);
    } else {
      setError('');
    }
  }, [doctorsError, nursesError]);

  // Fetch available time slots for selected staff and date
  const { 
    data: availableSlots, 
    isLoading: isLoadingTimeSlots 
  } = useQuery({
    queryKey: ['timeSlots', selectedStaff, selectedDate],
    queryFn: () => {
      if (!selectedStaff || !selectedDate) return [];
      return doctorService.getAvailableTimeSlots(
        selectedStaff, 
        selectedDate
      );
    },
    enabled: !!(selectedStaff && selectedDate),
    onError: (error) => {
      console.error('Failed to fetch time slots:', error);
      setError('Unable to load available time slots. Please try again.');
    }
  });

  // Show success modal
  const showSuccessModal = useCallback(() => {
    return MySwal.fire({
      title: 'Success!',
      text: 'Your appointment has been booked successfully!',
      icon: 'success',
      confirmButtonColor: '#3085d6',
      confirmButtonText: 'View Appointments',
      showCancelButton: true,
      cancelButtonText: 'Stay Here',
      allowOutsideClick: false,
      allowEscapeKey: false,
      allowEnterKey: false
    }).then((result) => {
      if (result.isConfirmed) {
        navigate('/appointments', { 
          state: { 
            message: 'Appointment booked successfully!',
            severity: 'success'
          }
        });
      }
    });
  }, [navigate]);

  // Show error modal
  const showErrorModal = useCallback((error) => {
    const isAuthError = error?.message?.includes('401') || error?.response?.status === 401;
    const errorMessage = isAuthError 
      ? 'Your session has expired. Please log in again.' 
      : error?.message || 'Failed to book appointment. Please try again.';

    return MySwal.fire({
      title: 'Error',
      text: errorMessage,
      icon: 'error',
      confirmButtonColor: '#d33',
      confirmButtonText: 'OK',
      allowOutsideClick: false
    }).then(() => {
      if (isAuthError) {
        // Clear auth and redirect to login
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        navigate('/login');
      }
    });
  }, [navigate]);

  // Mutation for booking appointment
  const bookAppointmentMutation = useMutation({
    mutationFn: (appointmentData) => patientService.bookAppointment(appointmentData),
    onSuccess: async (data) => {
      console.log('Appointment booked successfully:', data);
      setError('');
      await showSuccessModal();
    },
    onError: (error) => {
      console.error('Appointment booking error:', error);
      showErrorModal(error);
    }
  });

  // Check if selected staff is on leave and suggest alternatives
  const checkStaffAvailability = async (staffId, date) => {
    if (!staffId || !date) return;
    
    setCheckingLeave(true);
    setLeaveWarning('');
    setAlternativeStaff([]);
    
    try {
      // Check if staff is on leave
      const leaveCheck = await leaveService.checkStaffLeave(staffId, date.toISOString());
      
      if (leaveCheck.isOnLeave) {
        const leave = leaveCheck.leave;
        setLeaveWarning(
          `${leave.staffId.name} is on ${leave.leaveType.toLowerCase()} leave from ${format(new Date(leave.startDate), 'MMM dd')} to ${format(new Date(leave.endDate), 'MMM dd, yyyy')}.`
        );
        
        // Get alternative staff
        const alternatives = await leaveService.getAvailableStaff({
          date: date.toISOString(),
          staffType: staffType.toUpperCase(),
          specialization: staffType === 'doctor' ? doctors.find(d => d.id === staffId)?.specialization : undefined
        });
        
        setAlternativeStaff(alternatives.availableStaff || []);
      }
    } catch (error) {
      console.error('Error checking staff availability:', error);
    } finally {
      setCheckingLeave(false);
    }
  };

  // Check availability when staff or date changes
  useEffect(() => {
    if (selectedStaff && selectedDate) {
      checkStaffAvailability(selectedStaff, selectedDate);
    } else {
      setLeaveWarning('');
      setAlternativeStaff([]);
    }
  }, [selectedStaff, selectedDate, staffType, doctors]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Show loading state
    MySwal.fire({
      title: 'Processing...',
      text: 'Please wait while we book your appointment',
      allowOutsideClick: false,
      didOpen: () => {
        MySwal.showLoading();
      }
    });

    try {
      // Validate required fields
      if (!selectedDate || !selectedTime || !selectedStaff || !reason) {
        throw new Error('Please fill in all required fields');
      }

      // Check if payment is required (doctors only) and not completed (for CARD)
      if (staffType === 'doctor' && payNow && paymentMethod === 'CARD' && !paymentDetails?.paymentIntentId) {
        throw new Error('Please complete the card payment before submitting');
      }

      // Format date and time for API
      const appointmentDateTime = new Date(selectedDate);
      appointmentDateTime.setHours(selectedTime.getHours());
      appointmentDateTime.setMinutes(selectedTime.getMinutes());
      appointmentDateTime.setSeconds(0);
      appointmentDateTime.setMilliseconds(0);

      // Check if the selected time is in the past
      if (appointmentDateTime < new Date()) {
        throw new Error('Cannot book an appointment in the past');
      }

      const appointmentData = {
        patientId: (user?._id || user?.id || user?.uid),
        date: appointmentDateTime.toISOString(),
        reason,
        status: 'PENDING',
        type: staffType.toUpperCase()
      };

      // Add the appropriate staff ID
      if (staffType === 'doctor') {
        appointmentData.doctorId = selectedStaff;
      } else if (staffType === 'nurse') {
        appointmentData.nurseId = selectedStaff;
      }

      // Payment fields only apply for doctor appointments
      if (staffType === 'doctor') {
        appointmentData.paymentMethod = paymentMethod;
        appointmentData.paymentAmount = 50;
        appointmentData.paymentCurrency = 'ZAR';

        // Add payment-specific fields based on payment method
        if (paymentMethod === 'MEDICAL_AID') {
          appointmentData.medicalAidNumber = medicalAidNumber;
          appointmentData.medicalAidProvider = medicalAidProvider;
          appointmentData.paymentStatus = medicalAidNumber ? 'PENDING' : 'UNPAID';
        } else if (paymentMethod === 'INSURANCE') {
          appointmentData.insurancePolicyNumber = insurancePolicyNumber;
          appointmentData.insuranceProvider = insuranceProvider;
          appointmentData.paymentStatus = insurancePolicyNumber ? 'PENDING' : 'UNPAID';
        } else if (paymentMethod === 'BANK_TRANSFER') {
          appointmentData.bankReferenceNumber = bankReferenceNumber;
          appointmentData.paymentStatus = bankReferenceNumber ? 'PENDING' : 'UNPAID';
        } else if (paymentMethod === 'CASH') {
          appointmentData.paymentStatus = 'UNPAID'; // Will pay at facility
        } else if (paymentMethod === 'CARD') {
          appointmentData.paymentStatus = 'UNPAID'; // Will be updated when payment completes
        }
      }

      // If user opted to pay now and payment captured (doctors only), attach payment metadata
      if (staffType === 'doctor') {
        if (payNow && paymentDetails?.paymentIntentId) {
          appointmentData.paymentStatus = 'PAID';
          appointmentData.paymentProvider = 'STRIPE';
          appointmentData.paymentIntentId = paymentDetails.paymentIntentId;
          appointmentData.paymentAmount = paymentDetails.amount;
          appointmentData.paymentCurrency = paymentDetails.currency;
        } else if (payNow && paymentMethod === 'CARD') {
          // This should theoretically never happen due to the earlier check
          throw new Error('Payment was required but no payment details were found');
        }
      }

      // Add payment notes if provided (doctors only)
      if (staffType === 'doctor' && paymentNotes) {
        appointmentData.paymentNotes = paymentNotes;
      }

      console.log('Submitting appointment:', appointmentData);
      
      // Submit the appointment
      await bookAppointmentMutation.mutateAsync(appointmentData);
      
    } catch (error) {
      console.error('Booking error:', error);
      
      // Close any open loading dialogs
      MySwal.close();
      
      // Show error to user
      if (error.message) {
        await MySwal.fire({
          title: 'Error',
          text: error.message,
          icon: 'error',
          confirmButtonColor: '#d33',
          confirmButtonText: 'OK'
        });
      }
    }
  };

  return (
    <Container maxWidth="md">
      <Paper elevation={3} sx={{ p: 4, mt: 4 }}>
        <Typography variant="h4" gutterBottom color="primary" sx={{ fontWeight: 600 }}>
          Book an Appointment
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
          Schedule your appointment with our healthcare professionals
        </Typography>
        <Alert severity="warning" sx={{ mb: 2 }}>
          <strong>Notice:</strong> Doctor consultations require a payment of <strong>R50</strong>. Appointments with a nurse are free and do not require any payment.
        </Alert>
        <Alert severity="info" sx={{ mb: 2 }}>
          <strong>Payment Options:</strong> If you choose a doctor, you can pay now (card via Stripe) or pay later at the facility using cash, medical aid, bank transfer, or insurance.
        </Alert>
        
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}
        
        {bookAppointmentMutation.isLoading && (
          <Alert severity="info" sx={{ mb: 2 }}>
            Processing your appointment request...
          </Alert>
        )}

        <form onSubmit={handleSubmit}>
          <Grid container spacing={3}>
            {/* Staff Type Selection */}
            <Grid item xs={12}>
              <FormControl fullWidth required>
                <InputLabel>Staff Type</InputLabel>
                <Select
                  value={staffType}
                  label="Staff Type"
                  onChange={(e) => setStaffType(e.target.value)}
                >
                  <MenuItem value="doctor">Doctor</MenuItem>
                  <MenuItem value="nurse">Nurse</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            {/* Staff Selection */}
            <Grid item xs={12}>
              <FormControl fullWidth required disabled={!staffType || isLoadingDoctors || isLoadingNurses}>
                <InputLabel>{staffType === 'doctor' ? 'Select Doctor' : 'Select Nurse'}</InputLabel>
                <Select
                  value={selectedStaff}
                  label={staffType === 'doctor' ? 'Select Doctor' : 'Select Nurse'}
                  onChange={(e) => setSelectedStaff(e.target.value)}
                >
                  {availableStaff.map((staff) => (
                    <MenuItem 
                      key={staff.id} 
                      value={staff.id}
                      sx={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'flex-start',
                        py: 1
                      }}
                    >
                      <Typography variant="subtitle1">
                        {staff.firstName} {staff.lastName}
                      </Typography>
                      {staff.specialization && (
                        <Typography
                          variant="caption"
                          color="text.secondary"
                        >
                          {staff.specialization}
                        </Typography>
                      )}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            {/* Leave Warning and Alternative Staff */}
            {checkingLeave && (
              <Grid item xs={12}>
                <Alert severity="info" sx={{ display: 'flex', alignItems: 'center' }}>
                  <CircularProgress size={20} sx={{ mr: 1 }} />
                  Checking staff availability...
                </Alert>
              </Grid>
            )}

            {leaveWarning && (
              <Grid item xs={12}>
                <Alert severity="warning" sx={{ mb: 2 }}>
                  <Typography variant="body2" sx={{ mb: 1 }}>
                    <strong>Staff Unavailable:</strong> {leaveWarning}
                  </Typography>
                  {alternativeStaff.length > 0 && (
                    <>
                      <Typography variant="body2" sx={{ mb: 1 }}>
                        <strong>Available Alternatives:</strong>
                      </Typography>
                      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                        {alternativeStaff.map((staff) => (
                          <Button
                            key={staff._id}
                            variant="outlined"
                            size="small"
                            onClick={() => {
                              setSelectedStaff(staff._id);
                              setLeaveWarning('');
                              setAlternativeStaff([]);
                            }}
                            sx={{ textTransform: 'none' }}
                          >
                            {staff.name} - {staff.specialization}
                          </Button>
                        ))}
                      </Box>
                    </>
                  )}
                </Alert>
              </Grid>
            )}

            {/* Date Selection */}
            <Grid item xs={12} md={6}>
              <FormControl fullWidth required disabled={!selectedStaff}>
                <LocalizationProvider dateAdapter={AdapterDateFns}>
                  <DatePicker
                    label="Select Date"
                    value={selectedDate}
                    onChange={(newDate) => {
                      setSelectedDate(newDate);
                      setSelectedTime(null); // Reset time when date changes
                    }}
                    minDate={new Date()} // Can't select past dates
                    renderInput={(params) => <TextField {...params} />}
                    shouldDisableDate={(date) => {
                      // Disable weekends
                      return date.getDay() === 0 || date.getDay() === 6;
                    }}
                  />
                </LocalizationProvider>
              </FormControl>
            </Grid>

            {/* Time Selection */}
            <Grid item xs={12} md={6}>
              <FormControl fullWidth required disabled={!selectedDate}>
                <LocalizationProvider dateAdapter={AdapterDateFns}>
                  <TimePicker
                    label="Select Time"
                    value={selectedTime}
                    onChange={setSelectedTime}
                    renderInput={(params) => <TextField {...params} />}
                    minTime="09:00"
                    maxTime="16:30"
                    minutesStep={30}
                    shouldDisableTime={(value, view) => {
                      if (view === 'hours' && value === 12) return true;
                      return false;
                    }}
                  />
                </LocalizationProvider>
              </FormControl>
            </Grid>

            {/* Reason for Visit */}
            <Grid item xs={12}>
              <TextField
                fullWidth
                required
                multiline
                rows={4}
                label="Reason for Visit"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="Please describe your symptoms or reason for the appointment"
              />
            </Grid>

            {/* Optional Payment Section (Doctors only) */}
            {staffType === 'doctor' && (
            <Grid item xs={12}>
              <Box sx={{
                border: '1px solid',
                borderColor: 'divider',
                borderRadius: 1,
                p: 2,
                backgroundColor: 'background.paper'
              }}>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                  <Box>
                    <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 0.5 }}>
                      Payment Method (Optional)
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Choose your preferred payment method for the consultation fee
                    </Typography>
                  </Box>
                  <Switch
                    checked={payNow}
                    onChange={(e) => {
                      const newPayNow = e.target.checked;
                      setPayNow(newPayNow);
                      if (!newPayNow) {
                        setPaymentDetails(null);
                        setPaymentMessage('');
                      }
                    }}
                    color="primary"
                  />
                </Box>

                {payNow && (
                  <Box sx={{
                    mt: 2,
                    p: 2,
                    border: '1px solid',
                    borderColor: 'divider',
                    borderRadius: 1,
                    backgroundColor: 'background.default'
                  }}>
                    {/* Payment Method Selection */}
                    <FormControl fullWidth sx={{ mb: 3 }}>
                      <InputLabel>Payment Method</InputLabel>
                      <Select
                        value={paymentMethod}
                        label="Payment Method"
                        onChange={(e) => setPaymentMethod(e.target.value)}
                      >
                        <MenuItem value="CASH">
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            💵 Cash
                          </Box>
                        </MenuItem>
                        <MenuItem value="CARD">
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            💳 Card
                          </Box>
                        </MenuItem>
                        <MenuItem value="MEDICAL_AID">
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            🏥 Medical Aid
                          </Box>
                        </MenuItem>
                        <MenuItem value="BANK_TRANSFER">
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            🏦 Bank Transfer
                          </Box>
                        </MenuItem>
                        <MenuItem value="INSURANCE">
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            📋 Insurance
                          </Box>
                        </MenuItem>
                      </Select>
                    </FormControl>

                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                      <Typography variant="body1">Consultation Fee</Typography>
                      <Typography variant="body1" fontWeight="bold">R50.00 ZAR</Typography>
                    </Box>

                    {/* Show different payment options based on selected method */}
                    {paymentMethod === 'CARD' && (
                      <Box sx={{ minHeight: '200px', display: 'flex', flexDirection: 'column' }}>
                        <Elements stripe={stripePromise}>
                          <StripePaymentForm
                            amount={50}
                            billId={null}
                            onSuccess={handlePaymentSuccess}
                            onError={(error) => setError(error)}
                            onCancel={() => setPayNow(false)}
                          />
                        </Elements>
                        <Typography variant="caption" color="text.secondary" sx={{ mt: 1, textAlign: 'center' }}>
                          Secure payment processed by Stripe
                        </Typography>
                      </Box>
                    )}

                    {paymentMethod === 'CASH' && (
                      <Alert severity="info" sx={{ mb: 2 }}>
                        <Typography variant="body2">
                          💵 <strong>Cash Payment:</strong> You will pay R50.00 at the facility when you arrive for your appointment.
                        </Typography>
                      </Alert>
                    )}

                    {paymentMethod === 'MEDICAL_AID' && (
                      <Box sx={{ mb: 2 }}>
                        <Alert severity="info" sx={{ mb: 2 }}>
                          <Typography variant="body2">
                            🏥 <strong>Medical Aid:</strong> Please have your medical aid card ready at the appointment.
                          </Typography>
                        </Alert>
                        <TextField
                          fullWidth
                          label="Medical Aid Number"
                          placeholder="Enter your medical aid number"
                          variant="outlined"
                          size="small"
                          value={medicalAidNumber}
                          onChange={(e) => setMedicalAidNumber(e.target.value)}
                        />
                        <TextField
                          fullWidth
                          label="Medical Aid Provider"
                          placeholder="e.g., Discovery, Medihelp"
                          variant="outlined"
                          size="small"
                          sx={{ mt: 1 }}
                          value={medicalAidProvider}
                          onChange={(e) => setMedicalAidProvider(e.target.value)}
                        />
                      </Box>
                    )}

                    {paymentMethod === 'BANK_TRANSFER' && (
                      <Box sx={{ mb: 2 }}>
                        <Alert severity="info" sx={{ mb: 2 }}>
                          <Typography variant="body2">
                            🏦 <strong>Bank Transfer:</strong> Please transfer R50.00 to the following account:
                          </Typography>
                        </Alert>
                        <Box sx={{ p: 2, bgcolor: 'background.paper', borderRadius: 1, border: '1px solid', borderColor: 'divider' }}>
                          <Typography variant="body2" sx={{ fontFamily: 'monospace' }}>
                            Bank: MediConnect Healthcare Bank<br/>
                            Account: 1234567890<br/>
                            Reference: APT-{(user?._id || user?.id || user?.uid || '').toString().slice(-8) || 'REF'}
                          </Typography>
                        </Box>
                        <TextField
                          fullWidth
                          label="Bank Reference Number"
                          placeholder="Enter bank reference number"
                          variant="outlined"
                          size="small"
                          sx={{ mt: 1 }}
                          value={bankReferenceNumber}
                          onChange={(e) => setBankReferenceNumber(e.target.value)}
                        />
                      </Box>
                    )}

                    {paymentMethod === 'INSURANCE' && (
                      <Box sx={{ mb: 2 }}>
                        <Alert severity="info" sx={{ mb: 2 }}>
                          <Typography variant="body2">
                            📋 <strong>Insurance:</strong> Please have your insurance details ready at the appointment.
                          </Typography>
                        </Alert>
                        <TextField
                          fullWidth
                          label="Insurance Policy Number"
                          placeholder="Enter your insurance policy number"
                          variant="outlined"
                          size="small"
                          value={insurancePolicyNumber}
                          onChange={(e) => setInsurancePolicyNumber(e.target.value)}
                        />
                        <TextField
                          fullWidth
                          label="Insurance Provider"
                          placeholder="e.g., Momentum, Liberty"
                          variant="outlined"
                          size="small"
                          sx={{ mt: 1 }}
                          value={insuranceProvider}
                          onChange={(e) => setInsuranceProvider(e.target.value)}
                        />
                      </Box>
                    )}

                    {/* Payment Notes (Optional) */}
                    <TextField
                      fullWidth
                      label="Payment Notes (Optional)"
                      placeholder="Any additional payment information or notes"
                      variant="outlined"
                      size="small"
                      multiline
                      rows={2}
                      sx={{ mt: 2 }}
                      value={paymentNotes}
                      onChange={(e) => setPaymentNotes(e.target.value)}
                    />

                    {!paymentDetails && paymentMethod === 'CARD' && (
                      <Typography variant="caption" color="text.secondary" sx={{ mt: 1, textAlign: 'center' }}>
                        Secure payment processed by Stripe
                      </Typography>
                    )}

                    {paymentDetails && paymentMethod === 'CARD' && (
                      <Alert
                        severity="success"
                        sx={{
                          mb: 2,
                          '& .MuiAlert-message': {
                            width: '100%',
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center'
                          }
                        }}
                      >
                        <span>Payment successful</span>
                        <Button
                          size="small"
                          color="inherit"
                          onClick={() => {
                            setPayNow(false);
                            setPaymentDetails(null);
                            setPaymentMessage('');
                          }}
                        >
                          Change
                        </Button>
                      </Alert>
                    )}
                  </Box>
                )}
              </Box>

              {!payNow && staffType === 'doctor' && (
                <Alert severity="info" sx={{ mt: 2 }}>
                  You can choose your payment method and pay at the facility, or select "Payment Method" above to pay now. Your appointment will be confirmed once payment is received.
                </Alert>
              )}
            </Grid>
            )}

            {/* Submit Button */}
            <Grid item xs={12}>
              <Button
                type="submit"
                fullWidth
                variant="contained"
                color="primary"
                disabled={!selectedStaff || !selectedDate || !selectedTime || !reason || bookAppointmentMutation.isLoading}
                startIcon={bookAppointmentMutation.isLoading ? <CircularProgress size={20} color="inherit" /> : null}
              >
                {bookAppointmentMutation.isLoading ? 'Booking...' : staffType === 'nurse' ? 'Book Free Appointment' : 'Book Appointment'}
              </Button>
            </Grid>
          </Grid>
        </form>
      </Paper>
    </Container>
  );
}
