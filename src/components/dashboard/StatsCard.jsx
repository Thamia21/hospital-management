import React from 'react';
import { Card, CardContent, Box, Typography, Avatar } from '@mui/material';

const StatsCard = ({ title, value, icon, color = 'primary' }) => (
  <Card sx={{ height: '100%' }}>
    <CardContent>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
        <Avatar sx={{ bgcolor: `${color}.main`, mr: 2, color: 'white' }}>
          {icon}
        </Avatar>
        <Typography variant="h6" component="div">
          {title}
        </Typography>
      </Box>
      <Typography variant="h4" component="div" sx={{ textAlign: 'center', color: `${color}.main` }}>
        {value}
      </Typography>
    </CardContent>
  </Card>
);

export default StatsCard;
