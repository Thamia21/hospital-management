import React from 'react';
import { Grid, Paper, Typography } from '@mui/material';
import { styled } from '@mui/material/styles';

const Item = styled(Paper)(({ theme }) => ({
  backgroundColor: theme.palette.mode === 'dark' ? '#1A2027' : '#fff',
  ...theme.typography.body2,
  padding: theme.spacing(2),
  textAlign: 'center',
  color: theme.palette.text.secondary,
  height: '100%',
}));

export default function Dashboard() {
  return (
    <div>
      <Typography variant="h4" gutterBottom>
        Dashboard
      </Typography>
      
      <Grid container spacing={3}>
        <Grid item xs={12} md={6} lg={3}>
          <Item>
            <Typography variant="h6">Total Patients</Typography>
            <Typography variant="h3">150</Typography>
          </Item>
        </Grid>
        
        <Grid item xs={12} md={6} lg={3}>
          <Item>
            <Typography variant="h6">Today's Appointments</Typography>
            <Typography variant="h3">24</Typography>
          </Item>
        </Grid>
        
        <Grid item xs={12} md={6} lg={3}>
          <Item>
            <Typography variant="h6">Available Doctors</Typography>
            <Typography variant="h3">8</Typography>
          </Item>
        </Grid>
        
        <Grid item xs={12} md={6} lg={3}>
          <Item>
            <Typography variant="h6">Pending Reports</Typography>
            <Typography variant="h3">12</Typography>
          </Item>
        </Grid>
        
        <Grid item xs={12} md={8}>
          <Item>
            <Typography variant="h6" gutterBottom>
              Recent Appointments
            </Typography>
            {/* Add appointment list or table here */}
          </Item>
        </Grid>
        
        <Grid item xs={12} md={4}>
          <Item>
            <Typography variant="h6" gutterBottom>
              Notifications
            </Typography>
            {/* Add notifications list here */}
          </Item>
        </Grid>
      </Grid>
    </div>
  );
}
