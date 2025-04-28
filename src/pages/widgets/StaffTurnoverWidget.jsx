import React, { useEffect, useState } from 'react';
import { Paper, Typography, CircularProgress } from '@mui/material';
import { Bar } from 'react-chartjs-2';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';

const StaffTurnoverWidget = () => {
  const { token } = useAuth();
  const [loading, setLoading] = useState(true);
  const [turnover, setTurnover] = useState([]);

  useEffect(() => {
    const fetchTurnover = async () => {
      setLoading(true);
      try {
        const res = await axios.get('/api/users/turnover', { headers: { Authorization: `Bearer ${token}` } });
        setTurnover(res.data || []);
      } catch {
        setTurnover([]);
      } finally {
        setLoading(false);
      }
    };
    fetchTurnover();
  }, [token]);

  const chartData = {
    labels: turnover.map(t => t.month),
    datasets: [
      {
        label: 'Staff Left',
        data: turnover.map(t => t.left),
        backgroundColor: '#e57373',
      },
      {
        label: 'Staff Joined',
        data: turnover.map(t => t.joined),
        backgroundColor: '#81c784',
      },
    ],
  };

  return (
    <Paper sx={{ p: 2, bgcolor: '#fce4ec', minWidth: 280 }}>
      <Typography variant="subtitle2">Staff Turnover</Typography>
      {loading ? <CircularProgress size={20} /> : (
        <Bar data={chartData} height={120} />
      )}
    </Paper>
  );
};

export default StaffTurnoverWidget;
