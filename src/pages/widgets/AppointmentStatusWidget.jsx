import React, { useEffect, useState } from 'react';
import { Paper, Typography, CircularProgress } from '@mui/material';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';

const AppointmentStatusWidget = () => {
  const { token } = useAuth();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ total: 0, upcoming: 0, completed: 0 });

  useEffect(() => {
    const fetchStats = async () => {
      setLoading(true);
      try {
        const res = await axios.get('/api/appointments/stats', { headers: { Authorization: `Bearer ${token}` } });
        setStats(res.data);
      } catch {
        setStats({ total: 0, upcoming: 0, completed: 0 });
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, [token]);

  return (
    <Paper sx={{ p: 2, bgcolor: '#b2ebf2', minWidth: 180 }}>
      <Typography variant="subtitle2">Appointments</Typography>
      {loading ? <CircularProgress size={20} /> : (
        <>
          <Typography variant="h5">{stats.total}</Typography>
          <Typography variant="caption" color="primary.main">Upcoming: {stats.upcoming}</Typography><br />
          <Typography variant="caption" color="success.main">Completed: {stats.completed}</Typography>
        </>
      )}
    </Paper>
  );
};

export default AppointmentStatusWidget;
