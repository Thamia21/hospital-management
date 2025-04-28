import React, { useEffect, useState } from 'react';
import { Paper, Typography, CircularProgress } from '@mui/material';
import { Line } from 'react-chartjs-2';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';

const PatientTrendsWidget = () => {
  const { token } = useAuth();
  const [loading, setLoading] = useState(true);
  const [trends, setTrends] = useState([]);

  useEffect(() => {
    const fetchTrends = async () => {
      setLoading(true);
      try {
        const res = await axios.get('/api/patients/trends', { headers: { Authorization: `Bearer ${token}` } });
        setTrends(res.data || []);
      } catch {
        setTrends([]);
      } finally {
        setLoading(false);
      }
    };
    fetchTrends();
  }, [token]);

  const chartData = {
    labels: trends.map(t => t.month),
    datasets: [
      {
        label: 'Patients Registered',
        data: trends.map(t => t.count),
        backgroundColor: '#1976d2',
        borderColor: '#1976d2',
        fill: false,
      },
    ],
  };

  return (
    <Paper sx={{ p: 2, bgcolor: '#e1f5fe', minWidth: 280 }}>
      <Typography variant="subtitle2">Patient Trends</Typography>
      {loading ? <CircularProgress size={20} /> : (
        <Line data={chartData} height={120} />
      )}
    </Paper>
  );
};

export default PatientTrendsWidget;
