import React from 'react';
import { Grid } from '@mui/material';
import {
  Person as PersonIcon,
  CheckCircle as CheckCircleIcon,
  Schedule as ScheduleIcon,
  Cancel as CancelIcon,
} from '@mui/icons-material';
import StatsCard from './StatsCard';

const DashboardStats = ({ stats, todayAppointmentsCount }) => {
  return (
    <Grid container spacing={3} sx={{ mb: 4 }}>
      <Grid item xs={12} sm={6} md={3}>
        <StatsCard
          title="Today's Patients"
          value={todayAppointmentsCount}
          icon={<PersonIcon />}
          color="primary"
        />
      </Grid>
      <Grid item xs={12} sm={6} md={3}>
        <StatsCard
          title="Completed"
          value={stats?.completedToday || 0}
          icon={<CheckCircleIcon />}
          color="success"
        />
      </Grid>
      <Grid item xs={12} sm={6} md={3}>
        <StatsCard
          title="Pending"
          value={stats?.pendingToday || 0}
          icon={<ScheduleIcon />}
          color="warning"
        />
      </Grid>
      <Grid item xs={12} sm={6} md={3}>
        <StatsCard
          title="Cancelled"
          value={stats?.cancelledToday || 0}
          icon={<CancelIcon />}
          color="error"
        />
      </Grid>
    </Grid>
  );
};

export default DashboardStats;
