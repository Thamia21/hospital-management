import React, { useEffect, useState } from 'react';
import { Paper, Typography, CircularProgress } from '@mui/material';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';

const PatientStatsWidget = () => {
  const { token } = useAuth();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ total: 0, active: 0 });

  useEffect(() => {
    const fetchStats = async () => {
      setLoading(true);
      try {
        const res = await axios.get('/api/patients/stats', { headers: { Authorization: `Bearer ${token}` } });
        setStats(res.data);
      } catch {
        setStats({ total: 0, active: 0 });
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, [token]);

  return (
    <Paper sx={{ p: 2, bgcolor: '#e1bee7', minWidth: 180 }}>
      <Typography variant="subtitle2">Patients</Typography>
      {loading ? <CircularProgress size={20} /> : (
        <>
          <Typography variant="h5">{stats.total}</Typography>
          <Typography variant="caption" color="success.main">Active: {stats.active}</Typography>
        </>
      )}
    </Paper>
  );
};

export default PatientStatsWidget;
