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
};

// Appointment service
export const appointmentService = {
  async getAppointments() {
    const res = await axios.get(`${API_URL}/appointments`, { headers: getAuthHeader() });
    return res.data;
  },
  async createAppointment(appointmentData) {
    const res = await axios.post(`${API_URL}/appointments`, appointmentData, { headers: getAuthHeader() });
    return res.data;
  },
  async updateAppointmentStatus(appointmentId, status) {
    const res = await axios.put(`${API_URL}/appointments/${appointmentId}`, { status }, { headers: getAuthHeader() });
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
      // Get appointments for the user
      const appointmentsQuery = query(
        collection(db, 'appointments'),
        where('patientId', '==', userId)
      );
      const appointmentsSnapshot = await getDocs(appointmentsQuery);
      const appointments = appointmentsSnapshot.docs.map(convertDoc);

      // Fetch doctor details for each appointment
      const appointmentsWithDoctors = await Promise.all(
        appointments.map(async (appointment) => {
          try {
            if (!appointment.doctorId) {
              return { ...appointment, doctorName: 'Unknown' };
            }

            const doctorDoc = await getDoc(doc(db, 'doctors', appointment.doctorId));
            if (!doctorDoc.exists()) {
              return { ...appointment, doctorName: 'Unknown' };
            }

            const doctorData = doctorDoc.data();
            return {
              ...appointment,
              doctorName: `${doctorData.firstName} ${doctorData.lastName}`,
              doctorSpecialty: doctorData.department || 'General'
            };
          } catch (error) {
            console.error('Error fetching doctor details:', error);
            return { ...appointment, doctorName: 'Unknown' };
          }
        })
      );

      // Sort appointments by date
      return appointmentsWithDoctors.sort((a, b) => {
        const dateA = a.date?.toDate?.() || new Date(a.date);
        const dateB = b.date?.toDate?.() || new Date(b.date);
        return dateA - dateB;
      });
    } catch (error) {
      console.error('Error fetching appointments:', error);
      throw new Error('Failed to fetch appointments');
    }
  },

  async getPrescriptions(userId) {
    try {
      const q = query(
        collection(db, 'prescriptions'),
        where('patientId', '==', userId)
      );
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(convertDoc);
    } catch (error) {
      throw new Error(error.message || 'Failed to get prescriptions');
    }
  },

  async getBills(userId) {
    try {
      const q = query(
        collection(db, 'bills'),
        where('patientId', '==', userId)
      );
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(convertDoc);
    } catch (error) {
      throw new Error(error.message || 'Failed to get bills');
    }
  },

  async bookAppointment(appointmentData) {
    try {
      // Validate required fields
      const requiredFields = [
        'patientId', 'doctorId', 'date', 
        'time', 'reason', 'status'
      ];
      
      for (const field of requiredFields) {
        if (!appointmentData[field]) {
          throw new Error(`${field} is required`);
        }
      }

      // Check for existing appointment at same time
      const appointmentsRef = collection(db, 'appointments');
      const q = query(
        appointmentsRef, 
        where('doctorId', '==', appointmentData.doctorId),
        where('date', '==', appointmentData.date),
        where('time', '==', appointmentData.time)
      );
      const existingAppointmentsSnapshot = await getDocs(q);

      if (!existingAppointmentsSnapshot.empty) {
        throw new Error('This time slot is no longer available');
      }

      // Ensure we're storing dates as Firestore Timestamps
      const firestoreData = {
        ...appointmentData,
        date: Timestamp.fromDate(appointmentData.date),
        createdAt: serverTimestamp(),
        status: appointmentData.status.toUpperCase() // Normalize status case
      };

      console.log('Saving appointment to Firestore:', firestoreData);

      // Add appointment to Firestore
      const docRef = await addDoc(appointmentsRef, firestoreData);

      return { 
        id: docRef.id,
        ...appointmentData,
        status: appointmentData.status.toUpperCase()
      };
    } catch (error) {
      console.error('Appointment booking error:', error);
      throw error;
    }
  }
};

// Doctor service
export const doctorService = {
  async getDoctors() {
    try {
      console.log('Fetching doctors...');
      const doctorsQuery = query(
        collection(db, 'users'),
        where('role', 'in', ['DOCTOR', 'doctor'])
      );
      const doctorsSnapshot = await getDocs(doctorsQuery);
      
      const doctors = doctorsSnapshot.docs.map(doc => {
        const data = doc.data();
        console.log('Raw doctor data:', data); // Debug log
        return {
          id: doc.id,
          firstName: data.firstName,
          lastName: data.lastName,
          specialization: data.specialization, 
          ...data
        };
      });
      
      return doctors;
    } catch (error) {
      console.error('Error fetching doctors:', error);
      throw new Error('Unable to fetch doctors');
    }
  },

  async getNurses() {
    try {
      console.log('Fetching nurses...');
      const nursesQuery = query(
        collection(db, 'users'),
        where('role', 'in', ['NURSE', 'nurse'])
      );
      const nursesSnapshot = await getDocs(nursesQuery);
      
      const nurses = nursesSnapshot.docs.map(doc => {
        const data = doc.data();
        console.log('Raw nurse data:', data); // Debug log
        return {
          id: doc.id,
          firstName: data.firstName,
          lastName: data.lastName,
          specialization: data.specialization, 
          ...data
        };
      });
      
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

      // Convert date to start and end of day
      const startDate = new Date(date);
      startDate.setHours(0, 0, 0, 0);
      const endDate = new Date(date);
      endDate.setHours(23, 59, 59, 999);

      // Query existing appointments for this doctor on this date
      const appointmentsRef = collection(db, 'appointments');
      const q = query(
        appointmentsRef,
        where('doctorId', '==', doctorId),
        where('date', '>=', startDate),
        where('date', '<=', endDate)
      );

      const appointmentsSnapshot = await getDocs(q);
      const bookedAppointments = appointmentsSnapshot.docs.map(convertDoc);

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
          // Handle string time format (HH:mm)
          if (typeof appointment.time === 'string') {
            const appointmentTime = parseTimeString(appointment.time);
            return appointmentTime && 
                   appointmentTime.hours === slotTime.hours && 
                   appointmentTime.minutes === slotTime.minutes;
          }
          
          // Handle Firestore Timestamp
          if (appointment.time instanceof Timestamp) {
            const appointmentDate = appointment.time.toDate();
            return appointmentDate.getHours() === slotTime.hours && 
                   appointmentDate.getMinutes() === slotTime.minutes;
          }

          return false;
        });
      }).map(time => ({ 
        time, 
        label: format(parse(time, 'HH:mm', new Date()), 'h:mm a')
      }));

      return availableTimeSlots;
    } catch (error) {
      console.error('Error fetching time slots:', error);
      throw error;
    }
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

  async getDoctorDashboardStats(doctorId) {
    try {
      // Get doctor details
      const doctorDoc = await getDoc(doc(db, 'doctors', doctorId));
      if (!doctorDoc.exists()) {
        throw new Error('Doctor not found');
      }
      const doctorData = doctorDoc.data();

      // Get today's appointments
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);

      // Query appointments for the doctor
      const appointmentsQuery = query(
        collection(db, 'appointments'),
        where('doctorId', '==', doctorId),
        where('date', '>=', today),
        where('date', '<', tomorrow)
      );

      const appointmentsSnapshot = await getDocs(appointmentsQuery);
      const appointments = appointmentsSnapshot.docs.map(convertDoc);

      // Calculate today's stats
      const completedToday = appointments.filter(apt => 
        apt.status?.toUpperCase() === 'COMPLETED'
      ).length;

      const pendingToday = appointments.filter(apt => 
        !apt.status || 
        apt.status?.toUpperCase() === 'PENDING'
      ).length;

      const cancelledToday = appointments.filter(apt => 
        apt.status?.toUpperCase() === 'CANCELLED'
      ).length;

      // Get weekly appointments
      const weekStart = new Date(today);
      weekStart.setDate(weekStart.getDate() - weekStart.getDay());
      const weekEnd = new Date(weekStart);
      weekEnd.setDate(weekEnd.getDate() + 7);

      // Query for weekly appointments
      const weeklyAppointmentsQuery = query(
        collection(db, 'appointments'),
        where('doctorId', '==', doctorId),
        where('date', '>=', weekStart),
        where('date', '<', weekEnd)
      );

      const weeklySnapshot = await getDocs(weeklyAppointmentsQuery);
      const weeklyAppointments = weeklySnapshot.docs.map(convertDoc);

      // Calculate weekly patient load
      const maxWeeklyCapacity = 40;
      const weeklyPatientLoad = Math.round((weeklyAppointments.length / maxWeeklyCapacity) * 100);

      // Get recent notifications (last 5)
      const notificationsQuery = query(
        collection(db, 'notifications'),
        where('userId', '==', doctorId),
        orderBy('createdAt', 'desc'),
        limit(5)
      );

      const notificationsSnapshot = await getDocs(notificationsQuery);
      const recentNotifications = notificationsSnapshot.docs.map(convertDoc);

      // Calculate satisfaction rate (placeholder)
      const satisfactionRate = 92;

      return {
        doctorName: `${doctorData.firstName} ${doctorData.lastName}`,
        stats: {
          completedToday,
          pendingToday,
          cancelledToday,
          weeklyPatientLoad,
          satisfactionRate,
        },
        recentNotifications
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

// Helper function to format time labels
function formatTimeLabel(time) {
  const [hours, minutes] = time.split(':');
  const hour = parseInt(hours, 10);
  const period = hour >= 12 ? 'PM' : 'AM';
  const formattedHour = hour % 12 || 12;
  return `${formattedHour}:${minutes} ${period}`;
}
