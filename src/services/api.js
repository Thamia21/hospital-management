import axios from 'axios';

const API_URL = 'http://localhost:5000/api';

const getAuthHeader = () => {
  const token = localStorage.getItem('token');
  return token ? { Authorization: `Bearer ${token}` } : {};
};

// Helper function to convert Firestore document to plain object
const convertDoc = (doc) => ({
  id: doc.id,
  ...doc.data()
});

// Helper function to parse time string
const parseTimeString = (timeStr) => {
  try {
    const [hours, minutes] = timeStr.split(':').map(Number);
    return { hours, minutes };
  } catch (error) {
    console.error('Error parsing time string:', error);
    return null;
  }
};

// Auth service
export const authService = {
  async login(userId, password) {
    // Support both userId and email login
    const res = await axios.post(`${API_URL}/auth/login`, { userId, password });
    if (res.data.token) {
      localStorage.setItem('token', res.data.token);
    }
    return res.data;
  },

  async register(userData) {
    const res = await axios.post(`${API_URL}/auth/register`, userData);
    return res.data;
  },

  logout() {
    // Firebase handles logout
    return Promise.resolve();
  },

  async resendVerification(email) {
    const res = await axios.post(`${API_URL}/auth/resend-verification`, { email });
    return res.data;
  }
};

// User service
export const userService = {
  async getUsers() {
    const res = await axios.get(`${API_URL}/users`, { headers: getAuthHeader() });
    return res.data;
  },
  async getUserById(userId) {
    const res = await axios.get(`${API_URL}/users/${userId}`, { headers: getAuthHeader() });
    return res.data;
  },

  async getDoctorDashboardStats(doctorId, facilityId) {
    const userRes = await axios.get(`${API_URL}/users/${doctorId}`, { headers: getAuthHeader() });
    const doctorData = userRes.data;
    // Fetch stats filtered by facilityId if needed
    // ...
    return {
      doctorName: doctorData.name,
      stats: statsData
    };
  },

  async getDoctorAppointments(doctorId, facilityId) {
    // Fetch appointments for doctor, filtered by facility
    const res = await axios.get(`${API_URL}/appointments?doctorId=${doctorId}&facilityId=${facilityId}`, { headers: getAuthHeader() });
    return res.data;
  },
};

// Appointment service
export const appointmentService = {
  async getAppointments() {
    const res = await axios.get(`${API_URL}/appointments`, { headers: getAuthHeader() });
    return res.data;
  },
  async getPatientAppointments(patientId) {
    const res = await axios.get(`${API_URL}/appointments/patient/${patientId}`, { 
      headers: getAuthHeader() 
    });
    return res.data || [];
  },
  async createAppointment(appointmentData) {
    const res = await axios.post(`${API_URL}/appointments`, appointmentData, { headers: getAuthHeader() });
    return res.data;
  },
  async updateAppointmentStatus(appointmentId, status) {
    const res = await axios.put(
      `${API_URL}/appointments/${appointmentId}`, 
      { status }, 
      { headers: getAuthHeader() }
    );
    return res.data;
  },
};

// Patient service (to be refactored as needed)
export const patientService = { 
  async getPatientDetails(userId) {
    try {
      const docRef = doc(db, 'patients', userId);
      const docSnap = await getDoc(docRef);
      if (!docSnap.exists()) {
        throw new Error('Patient not found');
      }
      return convertDoc(docSnap);
    } catch (error) {
      throw new Error(error.message || 'Failed to get patient details');
    }
  },

  async getAppointments(userId) {
    try {
      console.log('Fetching appointments for user:', userId);
      // Get appointments for the user via API
      const response = await axios.get(`${API_URL}/appointments/patient/${userId}`, {
        headers: getAuthHeader()
      });
      console.log('Appointments API response:', response.data);
      const appointments = Array.isArray(response.data) ? response.data : [];

      // Process appointments to ensure consistent data structure
      const processedAppointments = appointments.map((appointment) => {
        // Check if doctorId is populated or if we have direct doctor info
        const doctorInfo = appointment.doctorId?.name 
          ? {
              doctorName: appointment.doctorId.name,
              doctorSpecialty: appointment.doctorId.specialization || appointment.doctorId.department || 'General'
            }
          : {
              doctorName: appointment.doctorName || 'Unknown',
              doctorSpecialty: appointment.doctorSpecialty || 'General'
            };

        return {
          ...appointment,
          ...doctorInfo,
          // Ensure date is a proper Date object
          date: new Date(appointment.date)
        };
      });

      // Sort appointments by date (soonest first)
      return processedAppointments.sort((a, b) => new Date(a.date) - new Date(b.date));
    } catch (error) {
      console.error('Error fetching appointments:', error);
      throw new Error('Failed to fetch appointments');
    }
  },

  async getPrescriptions(userId) {
    try {
      const response = await axios.get(`${API_URL}/patients/${userId}/prescriptions`, {
        headers: getAuthHeader()
      });
      return response.data || [];
    } catch (error) {
      throw new Error(error.message || 'Failed to get prescriptions');
    }
  },

  async getBills(userId) {
    try {
      const response = await axios.get(`${API_URL}/patients/${userId}/bills`, {
        headers: getAuthHeader()
      });
      return response.data || [];
    } catch (error) {
      throw new Error(error.message || 'Failed to get bills');
    }
  },

  async bookAppointment(appointmentData) {
    try {
      // Validate required fields
      const requiredFields = ['patientId', 'date', 'reason'];
      
      for (const field of requiredFields) {
        if (!appointmentData[field]) {
          throw new Error(`${field} is required`);
        }
      }

      // Validate that either doctorId or nurseId is provided
      if (!appointmentData.doctorId && !appointmentData.nurseId) {
        throw new Error('Either doctor or nurse must be selected');
      }

      // Extract time from date if it's a full datetime
      const appointmentDate = new Date(appointmentData.date);
      const timeString = `${appointmentDate.getHours().toString().padStart(2, '0')}:${appointmentDate.getMinutes().toString().padStart(2, '0')}`;

      // Get current user's facilityId from localStorage or token
      const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
      
      // Prepare appointment data for API
      const apiData = {
        patientId: appointmentData.patientId,
        doctorId: appointmentData.doctorId || undefined,
        nurseId: appointmentData.nurseId || undefined,
        date: appointmentDate.toISOString(),
        time: timeString,
        reason: appointmentData.reason,
        status: 'SCHEDULED', // Use SCHEDULED instead of PENDING
        type: appointmentData.type || (appointmentData.doctorId ? 'DOCTOR' : 'NURSE')
      };
      
      // Add facilityId - use user's facilityId or a default one
      apiData.facilityId = currentUser.facilityId || '507f1f77bcf86cd799439011'; // Default facility ID

      // Optional: forward payment metadata if present
      if (appointmentData.paymentOrderId) {
        apiData.paymentOrderId = appointmentData.paymentOrderId;
      }
      if (appointmentData.paymentStatus) {
        apiData.paymentStatus = appointmentData.paymentStatus; // e.g., 'PAID'
      }
      if (appointmentData.paymentProvider) {
        apiData.paymentProvider = appointmentData.paymentProvider; // e.g., 'PAYPAL'
      }
      if (appointmentData.paymentAmount) {
        apiData.paymentAmount = appointmentData.paymentAmount;
      }
      if (appointmentData.paymentCurrency) {
        apiData.paymentCurrency = appointmentData.paymentCurrency;
      }

      // Remove undefined fields
      Object.keys(apiData).forEach(key => {
        if (apiData[key] === undefined) {
          delete apiData[key];
        }
      });

      console.log('Booking appointment via API:', apiData);

      // Make API call to book appointment
      const response = await axios.post(
        `${API_URL}/appointments`,
        apiData,
        { headers: getAuthHeader() }
      );

      return response.data;
    } catch (error) {
      console.error('Appointment booking error:', error);
      if (error.response?.data?.message) {
        throw new Error(error.response.data.message);
      }
      if (error.response?.data?.error) {
        throw new Error(error.response.data.error);
      }
      throw new Error('Failed to book appointment. Please try again.');
    }
  },

  async cancelAppointment(appointmentId) {
    try {
      const response = await axios.put(
        `${API_URL}/appointments/${appointmentId}/cancel`,
        {},
        { headers: getAuthHeader() }
      );
      return response.data;
    } catch (error) {
      console.error('Error cancelling appointment:', error);
      if (error.response?.data?.message) {
        throw new Error(error.response.data.message);
      }
      throw new Error('Failed to cancel appointment. Please try again.');
    }
  }
};

// Doctor service
export const doctorService = {
  async getDoctors() {
    try {
      const response = await axios.get(
        `${API_URL}/users?role=staff`,
        { headers: getAuthHeader() }
      );
      
      // Filter to only get doctors from the staff response
      const allStaff = response.data || [];
      
      const doctors = allStaff
        .filter(user => user.role === 'DOCTOR')
        .map(doctor => {
          // Parse name into firstName and lastName
          const nameParts = (doctor.name || '').split(' ');
          const firstName = nameParts[0] || 'Doctor';
          const lastName = nameParts.slice(1).join(' ') || '';
          
          return {
            id: doctor._id || doctor.id,
            firstName: firstName,
            lastName: lastName,
            name: doctor.name,
            specialization: doctor.specialization || 'General Practice',
            department: doctor.department || 'Medical Department',
            email: doctor.email,
            phone: doctor.phone || doctor.phoneNumber,
            experience: doctor.experience,
            qualifications: doctor.qualifications,
            licenseNumber: doctor.licenseNumber,
            ...doctor
          };
        });
      
      return doctors;
    } catch (error) {
      console.error('Error fetching doctors:', error);
      throw new Error('Unable to fetch doctors: ' + (error.response?.data?.error || error.message));
    }
  },

  async getNurses() {
    try {
      const response = await axios.get(
        `${API_URL}/users?role=staff`,
        { headers: getAuthHeader() }
      );
      
      // Filter to only get nurses from the staff response
      const allStaff = response.data || [];
      
      const nurses = allStaff
        .filter(user => user.role === 'NURSE')
        .map(nurse => {
          // Parse name into firstName and lastName
          const nameParts = (nurse.name || '').split(' ');
          const firstName = nameParts[0] || 'Nurse';
          const lastName = nameParts.slice(1).join(' ') || '';
          
          return {
            id: nurse._id || nurse.id,
            firstName: firstName,
            lastName: lastName,
            name: nurse.name,
            specialization: nurse.specialization || 'General Nursing',
            department: nurse.department || 'Nursing Department',
            email: nurse.email,
            phone: nurse.phone || nurse.phoneNumber,
            experience: nurse.experience,
            qualifications: nurse.qualifications,
            licenseNumber: nurse.licenseNumber,
            ...nurse
          };
        });
      
      console.log(`Found ${nurses.length} nurses`);
      return nurses;
    } catch (error) {
      console.error('Error fetching nurses:', error);
      throw new Error('Failed to fetch nurses');
    }
  },

  async getAvailableTimeSlots(doctorId, date) {
    try {
      // Validate inputs
      if (!doctorId || !date) {
        throw new Error('Doctor ID and date are required');
      }

      // Format date for API query
      const queryDate = new Date(date).toISOString().split('T')[0];

      // Fetch existing appointments for this doctor on this date via API
      const response = await axios.get(
        `${API_URL}/appointments`,
        { 
          headers: getAuthHeader(),
          params: {
            doctorId: doctorId,
            date: queryDate
          }
        }
      );

      const bookedAppointments = response.data || [];

      // Define standard time slots in 30-minute increments
      const standardTimeSlots = [
        '08:00', '08:30', 
        '09:00', '09:30', 
        '10:00', '10:30', 
        '11:00', '11:30', 
        '12:00', '12:30', 
        '13:00', '13:30', 
        '14:00', '14:30', 
        '15:00', '15:30', 
        '16:00', '16:30', 
        '17:00'
      ];

      // Filter out booked time slots
      const availableTimeSlots = standardTimeSlots.filter(slot => {
        const slotTime = parseTimeString(slot);
        if (!slotTime) return false;

        return !bookedAppointments.some(appointment => {
          const appointmentDate = new Date(appointment.date);
          return appointmentDate.getHours() === slotTime.hours && 
                 appointmentDate.getMinutes() === slotTime.minutes;
        });
      }).map(time => ({ 
        time, 
        label: this.formatTimeLabel(time)
      }));

      return availableTimeSlots;
    } catch (error) {
      console.error('Error fetching time slots:', error);
      throw error;
    }
  },

  // Helper method to format time labels
  formatTimeLabel(time) {
    const [hours, minutes] = time.split(':').map(Number);
    const period = hours >= 12 ? 'PM' : 'AM';
    const displayHours = hours > 12 ? hours - 12 : hours === 0 ? 12 : hours;
    return `${displayHours}:${minutes.toString().padStart(2, '0')} ${period}`;
  },

  async getDoctorAppointments(doctorId) {
    try {
      // Get appointments for the doctor
      const appointmentsQuery = query(
        collection(db, 'appointments'),
        where('doctorId', '==', doctorId),
        orderBy('date', 'asc')
      );
      const appointmentsSnapshot = await getDocs(appointmentsQuery);
      const appointments = appointmentsSnapshot.docs.map(convertDoc);

      // Fetch patient details for each appointment
      const appointmentsWithPatients = await Promise.all(
        appointments.map(async (appointment) => {
          try {
            if (!appointment.patientId) {
              return { ...appointment, patientName: 'Unknown Patient' };
            }

            const userDoc = await getDoc(doc(db, 'users', appointment.patientId));
            if (!userDoc.exists()) {
              return { ...appointment, patientName: 'Unknown Patient' };
            }

            const userData = userDoc.data();
            const fullName = userData.firstName && userData.lastName 
              ? `${userData.firstName} ${userData.lastName}`
              : userData.email;

            return {
              ...appointment,
              patientName: fullName,
              patientEmail: userData.email,
              patientPhone: userData.phone || 'No phone number'
            };
          } catch (error) {
            console.error('Error fetching patient details:', error);
            return { ...appointment, patientName: 'Unknown Patient' };
          }
        })
      );

      // Group appointments by date
      const groupedAppointments = appointmentsWithPatients.reduce((groups, appointment) => {
        const date = appointment.date?.toDate?.() || new Date(appointment.date);
        const dateStr = format(date, 'yyyy-MM-dd');
        
        if (!groups[dateStr]) {
          groups[dateStr] = [];
        }
        groups[dateStr].push(appointment);
        return groups;
      }, {});

      return groupedAppointments;
    } catch (error) {
      console.error('Error fetching doctor appointments:', error);
      throw error;
    }
  },

  async updateAppointmentStatus(appointmentId, status) {
    try {
      const appointmentRef = doc(db, 'appointments', appointmentId);
      const appointmentDoc = await getDoc(appointmentRef);
      
      if (!appointmentDoc.exists()) {
        throw new Error('Appointment not found');
      }

      await updateDoc(appointmentRef, {
        status,
        updatedAt: serverTimestamp()
      });

      // Get patient ID from the appointment
      const appointmentData = appointmentDoc.data();
      const patientId = appointmentData.patientId;

      // Create notification message based on status
      let message = '';
      switch (status) {
        case 'approved':
          message = `Your appointment scheduled for ${format(appointmentData.date.toDate(), 'MMMM d, yyyy')} at ${appointmentData.time} has been approved.`;
          break;
        case 'cancelled':
          message = `Your appointment scheduled for ${format(appointmentData.date.toDate(), 'MMMM d, yyyy')} at ${appointmentData.time} has been cancelled.`;
          break;
        case 'completed':
          message = `Your appointment scheduled for ${format(appointmentData.date.toDate(), 'MMMM d, yyyy')} at ${appointmentData.time} has been marked as completed.`;
          break;
        default:
          message = `Your appointment status has been updated to ${status}.`;
      }

      // Create notification for the patient
      await notificationService.createNotification(patientId, message, 'appointment');

      return { success: true };
    } catch (error) {
      console.error('Error updating appointment status:', error);
      throw error;
    }
  },

  // Get doctor's appointments (MongoDB)
  async getDoctorAppointmentsMongo(doctorId) {
    try {
      const response = await axios.get(
        `${API_URL}/appointments/doctor/${doctorId}`,
        { headers: getAuthHeader() }
      );
      return response.data || [];
    } catch (error) {
      console.error('Error fetching doctor appointments:', error);
      throw error;
    }
  },

  // Get nurse's appointments (MongoDB)
  async getNurseAppointmentsMongo(nurseId) {
    try {
      const response = await axios.get(
        `${API_URL}/appointments/nurse/${nurseId}`,
        { headers: getAuthHeader() }
      );
      return response.data || [];
    } catch (error) {
      console.error('Error fetching nurse appointments:', error);
      throw error;
    }
  },

  // Update appointment status (MongoDB)
  async updateAppointmentStatusMongo(appointmentId, status) {
    try {
      const response = await axios.put(
        `${API_URL}/appointments/${appointmentId}/status`,
        { status },
        { headers: getAuthHeader() }
      );
      return response.data;
    } catch (error) {
      console.error('Error updating appointment status:', error);
      throw error;
    }
  },

  // Update appointment (MongoDB) - for rescheduling
  async updateAppointmentMongo(appointmentId, updateData) {
    try {
      const response = await axios.put(
        `${API_URL}/appointments/${appointmentId}`,
        updateData,
        { headers: getAuthHeader() }
      );
      return response.data;
    } catch (error) {
      console.error('Error updating appointment:', error);
      throw error;
    }
  },

  async getDoctorDashboardStats(doctorId) {
    try {
      // 1. Fetch doctor details from REST API (MongoDB backend)
      const userRes = await axios.get(`${API_URL}/users/${doctorId}`, { headers: getAuthHeader() });
      const doctorData = userRes.data;
      // 2. Fetch dashboard stats for this doctor
      const statsRes = await axios.get(`${API_URL}/appointments/stats`, { headers: getAuthHeader() });
      const statsData = statsRes.data;
      // 3. Compose doctorName (use 'name' field from MongoDB model)
      return {
        doctorName: doctorData.name,
        stats: statsData
      };
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
      throw error;
    }
  }
};

// Notification service
export const notificationService = {
  async createNotification(userId, message, type) {
    try {
      const notificationsRef = collection(db, 'notifications');
      const notification = {
        userId,
        message,
        type,
        read: false,
        createdAt: serverTimestamp()
      };
      
      console.log('Creating notification:', notification); // Debug log
      const docRef = await addDoc(notificationsRef, notification);
      return docRef.id;
    } catch (error) {
      console.error('Error creating notification:', error);
      throw error;
    }
  },

  async getUserNotifications(userId) {
    try {
      const notificationsRef = collection(db, 'notifications');
      const q = query(
        notificationsRef,
        where('userId', '==', userId),
        orderBy('createdAt', 'desc')
      );
      const querySnapshot = await getDocs(q);
      const notifications = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate() // Convert timestamp to Date
      }));
      return notifications;
    } catch (error) {
      console.error('Error fetching notifications:', error);
      throw error;
    }
  },

  async markNotificationAsRead(notificationId) {
    try {
      const notificationRef = doc(db, 'notifications', notificationId);
      await updateDoc(notificationRef, {
        read: true,
        updatedAt: serverTimestamp()
      });
    } catch (error) {
      console.error('Error marking notification as read:', error);
      throw error;
    }
  }
};

// Leave service
export const leaveService = {
  // Get all leave requests
  async getLeaves(params = {}) {
    try {
      const queryString = new URLSearchParams(params).toString();
      const response = await axios.get(
        `${API_URL}/leave${queryString ? `?${queryString}` : ''}`,
        { headers: getAuthHeader() }
      );
      return response.data;
    } catch (error) {
      console.error('Error fetching leaves:', error);
      throw error;
    }
  },

  // Get leave requests for specific staff
  async getStaffLeaves(staffId) {
    try {
      const response = await axios.get(
        `${API_URL}/leave/staff/${staffId}`,
        { headers: getAuthHeader() }
      );
      return response.data;
    } catch (error) {
      console.error('Error fetching staff leaves:', error);
      throw error;
    }
  },

  // Create new leave request
  async createLeave(leaveData) {
    try {
      const response = await axios.post(
        `${API_URL}/leave`,
        leaveData,
        { headers: getAuthHeader() }
      );
      return response.data;
    } catch (error) {
      console.error('Error creating leave:', error);
      throw error;
    }
  },

  // Update leave request
  async updateLeave(leaveId, updateData) {
    try {
      const response = await axios.put(
        `${API_URL}/leave/${leaveId}`,
        updateData,
        { headers: getAuthHeader() }
      );
      return response.data;
    } catch (error) {
      console.error('Error updating leave:', error);
      throw error;
    }
  },

  // Delete leave request
  async deleteLeave(leaveId) {
    try {
      await axios.delete(
        `${API_URL}/leave/${leaveId}`,
        { headers: getAuthHeader() }
      );
    } catch (error) {
      console.error('Error deleting leave:', error);
      throw error;
    }
  },

  // Check if staff is on leave
  async checkStaffLeave(staffId, date) {
    try {
      const response = await axios.get(
        `${API_URL}/leave/check/${staffId}${date ? `?date=${date}` : ''}`,
        { headers: getAuthHeader() }
      );
      return response.data;
    } catch (error) {
      console.error('Error checking staff leave:', error);
      throw error;
    }
  },

  // Get available staff for a date
  async getAvailableStaff(params = {}) {
    try {
      const queryString = new URLSearchParams(params).toString();
      const response = await axios.get(
        `${API_URL}/leave/available-staff${queryString ? `?${queryString}` : ''}`,
        { headers: getAuthHeader() }
      );
      return response.data;
    } catch (error) {
      console.error('Error fetching available staff:', error);
      throw error;
    }
  },

  // Get leave calendar data
  async getLeaveCalendar(startDate, endDate) {
    try {
      const params = new URLSearchParams();
      if (startDate) params.append('startDate', startDate);
      if (endDate) params.append('endDate', endDate);
      
      const response = await axios.get(
        `${API_URL}/leave/calendar?${params.toString()}`,
        { headers: getAuthHeader() }
      );
      return response.data;
    } catch (error) {
      console.error('Error fetching leave calendar:', error);
      throw error;
    }
  },

  // Get staff for dropdown (doctors and nurses)
  async getStaff() {
    try {
      const response = await axios.get(
        `${API_URL}/users?role=staff`,
        { headers: getAuthHeader() }
      );
      return response.data;
    } catch (error) {
      console.error('Error fetching staff:', error);
      throw error;
    }
  }
};

// Payments service (PayPal REST via backend)
export const paymentsService = {
  getConfig() {
    return axios.get(`${API_URL}/payments/config`)
      .then(res => {
        console.log('PayPal config response:', res.data);
        if (!res.data.clientId) {
          throw new Error('Invalid PayPal configuration: Missing client ID');
        }
        return res.data;
      })
      .catch(error => {
        console.error('Error fetching PayPal config:', error);
        if (error.response) {
          // The request was made and the server responded with a status code
          // that falls out of the range of 2xx
          console.error('Response data:', error.response.data);
          console.error('Response status:', error.response.status);
          console.error('Response headers:', error.response.headers);
          throw new Error(error.response.data?.error || 'Failed to load payment configuration');
        } else if (error.request) {
          // The request was made but no response was received
          console.error('No response received:', error.request);
          throw new Error('No response from payment server. Please check your connection.');
        } else {
          // Something happened in setting up the request that triggered an Error
          console.error('Error setting up request:', error.message);
          throw new Error('Failed to initialize payment system');
        }
      });
  },
  
  createOrder({ amount = '0.50', currency = 'USD', description = 'Consultation Fee' } = {}) {
    console.log('Creating PayPal order:', { amount, currency, description });
    return axios.post(
      `${API_URL}/payments/create-order`, 
      { amount, currency, description },
      { 
        headers: {
          ...getAuthHeader(),
          'Content-Type': 'application/json'
        },
        timeout: 30000 // 30 seconds timeout
      }
    )
    .then(res => {
      console.log('Order created:', res.data);
      return res.data;
    })
    .catch(error => {
      console.error('Error creating PayPal order:', error);
      throw error;
    });
  },
  
  captureOrder({ orderId, appointmentId } = {}) {
    if (!orderId) {
      return Promise.reject(new Error('Order ID is required'));
    }
    
    console.log('Capturing PayPal order:', { orderId, appointmentId });
    return axios.post(
      `${API_URL}/payments/capture-order`,
      { orderId, appointmentId },
      { 
        headers: {
          ...getAuthHeader(),
          'Content-Type': 'application/json'
        },
        timeout: 30000 // 30 seconds timeout
      }
    )
    .then(res => {
      console.log('Order captured:', res.data);
      return res.data;
    })
    .catch(error => {
      console.error('Error capturing PayPal order:', error);
      throw error;
    });
  }
};

// Helper function to format time labels
function formatTimeLabel(time) {
  const [hours, minutes] = time.split(':');
  const hour = parseInt(hours, 10);
  const period = hour >= 12 ? 'PM' : 'AM';
  const formattedHour = hour % 12 || 12;
  return `${formattedHour}:${minutes} ${period}`;
}
