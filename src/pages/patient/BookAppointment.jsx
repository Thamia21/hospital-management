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
import PayPalButton from '../../components/payments/PayPalButton';
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

  // Local API client for recording payments
  const API_URL = 'http://localhost:5000/api';
  const getAuthHeader = () => {
    const token = localStorage.getItem('token');
    return token ? { Authorization: `Bearer ${token}` } : {};
  };

  const handlePaymentSuccess = useCallback(async ({ orderId, capture }) => {
    try {
      if (!orderId) {
        throw new Error('No order ID received from payment processor');
      }

      // Persist the payment to backend so it shows in Patient Billing
      const captured = capture?.purchase_units?.[0]?.payments?.captures?.[0];
      const amountValue = captured?.amount?.value ? Number(captured.amount.value) : 50;
      const currencyCode = captured?.amount?.currency_code || 'ZAR';
      const transactionId = captured?.id || orderId;

      const paymentRecord = {
        patientId: user.uid,
        billId: null, // not linked to a specific bill for consultation prepayment
        amount: amountValue,
        currency: currencyCode,
        paymentMethod: 'paypal',
        status: 'completed',
        transactionId,
        description: 'Doctor Consultation Fee',
        processedAt: new Date().toISOString(),
        metadata: { orderId }
      };

      console.log('Saving payment to backend:', {
        url: `${API_URL}/patients/${user.uid}/payments`,
        paymentRecord
      });
      const saveRes = await axios.post(
        `${API_URL}/patients/${user.uid}/payments`,
        paymentRecord,
        { headers: getAuthHeader() }
      );
      console.log('Payment saved response:', saveRes.status, saveRes.data);

      setPaymentDetails({ orderId, capture });
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
  }, [user?.uid]);

  // Fetch available doctors
  const { 
    data: doctors = [], 
    isLoading: isLoadingDoctors,
    error: doctorsError
  } = useQuery({
    queryKey: ['doctors'],
    queryFn: async () => {
      const result = await doctorService.getDoctors();
      return result;
    },
    enabled: staffType === 'doctor',
    retry: 1,
    onError: (error) => {
      console.error('Error fetching doctors:', error);
      console.error('Error details:', error.response?.data);
    }
  });

  // Fetch available nurses
  const {
    data: nurses = [],
    isLoading: isLoadingNurses,
    error: nursesError
  } = useQuery({
    queryKey: ['nurses'],
    queryFn: async () => {
      const result = await doctorService.getNurses();
      return result;
    },
    enabled: staffType === 'nurse',
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

      // Check if payment is required but not completed
      if (payNow && !paymentDetails?.orderId) {
        throw new Error('Please complete the payment process before submitting');
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
        patientId: user.uid,
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

      // If user opted to pay now and payment captured, attach payment metadata
      if (payNow && paymentDetails?.orderId) {
        appointmentData.paymentStatus = 'PAID';
        appointmentData.paymentProvider = 'PAYPAL';
        appointmentData.paymentOrderId = paymentDetails.orderId;
        // Extract amount/currency from capture if available, default to 50 ZAR
        const captured = paymentDetails.capture?.purchase_units?.[0]?.payments?.captures?.[0];
        appointmentData.paymentAmount = captured?.amount?.value ? Number(captured.amount.value) : 50;
        appointmentData.paymentCurrency = captured?.amount?.currency_code || 'ZAR';
      } else if (payNow) {
        // This should theoretically never happen due to the earlier check
        throw new Error('Payment was required but no payment details were found');
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
        <Alert severity="info" sx={{ mb: 2 }}>
          <strong>Payment Notice:</strong> To see a doctor pay R50. Payment is optional and can be completed now via PayPal or at the facility.
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
                    minTime={new Date(0, 0, 0, 9)} // 9 AM
                    maxTime={new Date(0, 0, 0, 17)} // 5 PM
                    minutesStep={30} // 30-minute intervals
                    shouldDisableTime={(time) => {
                      const hours = time.getHours();
                      const minutes = time.getMinutes();
                      // Disable lunch hour (12-1 PM)
                      if (hours === 12) return true;
                      // Only allow appointments on the hour and half hour
                      return minutes !== 0 && minutes !== 30;
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

            {/* Optional Payment Section */}
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
                      Pay Consultation Fee Now (Optional)
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Secure payment via PayPal
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
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                      <Typography variant="body1">Consultation Fee</Typography>
                      <Typography variant="body1" fontWeight="bold">$2.70 USD (R50.00 ZAR)</Typography>
                    </Box>

                    {!paymentDetails ? (
                      <Box sx={{ minHeight: '200px', display: 'flex', flexDirection: 'column' }}>
                        <PayPalButton
                          amount={"2.70"}
                          currency="USD"
                          description="Doctor Consultation Fee"
                          onApproved={handlePaymentSuccess}
                        />
                        <Typography variant="caption" color="text.secondary" sx={{ mt: 1, textAlign: 'center' }}>
                          Secure payment processed by PayPal
                        </Typography>
                      </Box>
                    ) : (
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

              {!payNow && (
                <Alert severity="info" sx={{ mt: 2 }}>
                  You can choose to pay later at the facility. Your appointment will be confirmed once payment is received.
                </Alert>
              )}
            </Grid>

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
                {bookAppointmentMutation.isLoading ? 'Booking...' : 'Book Appointment'}
              </Button>
            </Grid>
          </Grid>
        </form>
      </Paper>
    </Container>
  );
}
