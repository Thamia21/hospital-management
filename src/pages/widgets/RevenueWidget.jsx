import React, { useEffect, useState } from 'react';
import { Paper, Typography, CircularProgress } from '@mui/material';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';

const RevenueWidget = () => {
  const { token } = useAuth();
  const [loading, setLoading] = useState(true);
  const [revenue, setRevenue] = useState(0);

  useEffect(() => {
    const fetchRevenue = async () => {
      setLoading(true);
      try {
        const res = await axios.get('/api/finance/revenue', { headers: { Authorization: `Bearer ${token}` } });
        setRevenue(res.data.total || 0);
      } catch {
        setRevenue(0);
      } finally {
        setLoading(false);
      }
    };
    fetchRevenue();
  }, [token]);

  return (
    <Paper sx={{ p: 2, bgcolor: '#ffe082', minWidth: 180 }}>
      <Typography variant="subtitle2">Revenue</Typography>
      {loading ? <CircularProgress size={20} /> : (
        <Typography variant="h5">${revenue.toLocaleString()}</Typography>
      )}
    </Paper>
  );
};

export default RevenueWidget;
