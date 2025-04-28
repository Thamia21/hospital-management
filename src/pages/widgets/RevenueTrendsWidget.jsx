import React, { useEffect, useState } from 'react';
import { Paper, Typography, CircularProgress } from '@mui/material';
import { Line } from 'react-chartjs-2';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';

const RevenueTrendsWidget = () => {
  const { token } = useAuth();
  const [loading, setLoading] = useState(true);
  const [trends, setTrends] = useState([]);

  useEffect(() => {
    const fetchTrends = async () => {
      setLoading(true);
      try {
        const res = await axios.get('/api/finance/revenue-trends', { headers: { Authorization: `Bearer ${token}` } });
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
        label: 'Revenue',
        data: trends.map(t => t.amount),
        backgroundColor: '#ffb300',
        borderColor: '#ffb300',
        fill: false,
      },
    ],
  };

  return (
    <Paper sx={{ p: 2, bgcolor: '#fffde7', minWidth: 280 }}>
      <Typography variant="subtitle2">Revenue Trends</Typography>
      {loading ? <CircularProgress size={20} /> : (
        <Line data={chartData} height={120} />
      )}
    </Paper>
  );
};

export default RevenueTrendsWidget;
