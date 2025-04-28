import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useError } from '../context/ErrorContext';
import { useLoading } from '../context/LoadingContext';
import { useRealTime } from '../context/RealTimeContext';
import axios from 'axios';

const API_BASE_URL = '/api';

// Base API instance
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
});

// Query key factory
export const queryKeys = {
  patients: {
    all: ['patients'],
    detail: (id) => ['patients', id],
    appointments: (id) => ['patients', id, 'appointments'],
  },
  doctors: {
    all: ['doctors'],
    detail: (id) => ['doctors', id],
    schedule: (id) => ['doctors', id, 'schedule'],
  },
  appointments: {
    all: ['appointments'],
    detail: (id) => ['appointments', id],
    upcoming: ['appointments', 'upcoming'],
  },
  medications: {
    all: ['medications'],
    detail: (id) => ['medications', id],
    inventory: ['medications', 'inventory'],
  },
  invoices: {
    all: ['invoices'],
    detail: (id) => ['invoices', id],
    unpaid: ['invoices', 'unpaid'],
  },
};

// Patients hooks
export const usePatients = (filters = {}) => {
  const { showLoading, hideLoading } = useLoading();
  const { showError } = useError();
  const { subscribe } = useRealTime();

  const query = useQuery({
    queryKey: queryKeys.patients.all,
    queryFn: async () => {
      const response = await api.get('/patients', { params: filters });
      return response.data;
    },
    onError: (error) => {
      showError(error.message);
    },
  });

  // Subscribe to real-time updates
  React.useEffect(() => {
    const unsubscribe = subscribe('PATIENT_UPDATED', () => {
      query.refetch();
    });
    return () => unsubscribe();
  }, [subscribe]);

  return query;
};

export const usePatient = (id) => {
  const queryClient = useQueryClient();
  const { showError } = useError();
  const { subscribe } = useRealTime();

  const query = useQuery({
    queryKey: queryKeys.patients.detail(id),
    queryFn: async () => {
      const response = await api.get(`/patients/${id}`);
      return response.data;
    },
    enabled: !!id,
  });

  // Subscribe to real-time updates
  React.useEffect(() => {
    const unsubscribe = subscribe('PATIENT_UPDATED', (updatedPatient) => {
      if (updatedPatient.id === id) {
        queryClient.setQueryData(queryKeys.patients.detail(id), updatedPatient);
      }
    });
    return () => unsubscribe();
  }, [id, subscribe, queryClient]);

  return query;
};

// Appointments hooks
export const useAppointments = (filters = {}) => {
  const { showError } = useError();
  const { subscribe } = useRealTime();

  const query = useQuery({
    queryKey: queryKeys.appointments.all,
    queryFn: async () => {
      const response = await api.get('/appointments', { params: filters });
      return response.data;
    },
  });

  // Subscribe to real-time updates
  React.useEffect(() => {
    const unsubscribe = subscribe('APPOINTMENT_UPDATED', () => {
      query.refetch();
    });
    return () => unsubscribe();
  }, [subscribe]);

  return query;
};

export const useCreateAppointment = () => {
  const queryClient = useQueryClient();
  const { showSuccess, showError } = useError();
  const { sendUpdate } = useRealTime();

  return useMutation({
    mutationFn: async (appointmentData) => {
      const response = await api.post('/appointments', appointmentData);
      return response.data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries(queryKeys.appointments.all);
      sendUpdate('APPOINTMENT_CREATED', data);
      showSuccess('Appointment created successfully');
    },
    onError: (error) => {
      showError(error.message);
    },
  });
};

// Medications hooks
export const useMedications = (filters = {}) => {
  const { showError } = useError();

  return useQuery({
    queryKey: queryKeys.medications.all,
    queryFn: async () => {
      const response = await api.get('/medications', { params: filters });
      return response.data;
    },
  });
};

export const usePrescribeMedication = () => {
  const queryClient = useQueryClient();
  const { showSuccess, showError } = useError();
  const { sendUpdate } = useRealTime();

  return useMutation({
    mutationFn: async (prescriptionData) => {
      const response = await api.post('/prescriptions', prescriptionData);
      return response.data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries(queryKeys.medications.all);
      sendUpdate('MEDICATION_PRESCRIBED', data);
      showSuccess('Medication prescribed successfully');
    },
    onError: (error) => {
      showError(error.message);
    },
  });
};

// Invoices hooks
export const useInvoices = (filters = {}) => {
  const { showError } = useError();
  const { subscribe } = useRealTime();

  const query = useQuery({
    queryKey: queryKeys.invoices.all,
    queryFn: async () => {
      const response = await api.get('/invoices', { params: filters });
      return response.data;
    },
  });

  // Subscribe to real-time updates
  React.useEffect(() => {
    const unsubscribe = subscribe('INVOICE_CREATED', () => {
      query.refetch();
    });
    return () => unsubscribe();
  }, [subscribe]);

  return query;
};

export const useCreateInvoice = () => {
  const queryClient = useQueryClient();
  const { showSuccess, showError } = useError();
  const { sendUpdate } = useRealTime();

  return useMutation({
    mutationFn: async (invoiceData) => {
      const response = await api.post('/invoices', invoiceData);
      return response.data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries(queryKeys.invoices.all);
      sendUpdate('INVOICE_CREATED', data);
      showSuccess('Invoice created successfully');
    },
    onError: (error) => {
      showError(error.message);
    },
  });
};
