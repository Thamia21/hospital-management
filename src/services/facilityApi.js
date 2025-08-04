import axios from 'axios';
const API_URL = 'http://localhost:5000/api/facilities';

// Helper function to get auth header
const getAuthHeader = () => {
  const token = localStorage.getItem('token');
  return token ? { headers: { Authorization: `Bearer ${token}` } } : {};
};

export const facilityApi = {
  getAll: async () => {
    const res = await axios.get(API_URL, getAuthHeader());
    return res.data;
  },
  getById: async (id) => {
    const res = await axios.get(`${API_URL}/${id}`, getAuthHeader());
    return res.data;
  },
  create: async (facility) => {
    const res = await axios.post(API_URL, facility, getAuthHeader());
    return res.data;
  },
  update: async (id, facility) => {
    const res = await axios.put(`${API_URL}/${id}`, facility, getAuthHeader());
    return res.data;
  },
  delete: async (id) => {
    const res = await axios.delete(`${API_URL}/${id}`, getAuthHeader());
    return res.data;
  }
};
