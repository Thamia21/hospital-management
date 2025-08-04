import React from 'react';
import { Card, CardContent, Typography, Box } from '@mui/material';
import { AttachMoney as MoneyIcon, TrendingUp as TrendingUpIcon } from '@mui/icons-material';

const RevenueWidget = ({ revenue }) => {
  return (
    <Card>
      <CardContent>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <Typography color="text.secondary" variant="body2">Total Revenue</Typography>
            <Typography variant="h5">${(revenue?.total || 0).toLocaleString()}</Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
              <TrendingUpIcon color="success" fontSize="small" />
              <Typography variant="body2" color="success.main" sx={{ ml: 0.5 }}>
                {revenue?.change || 0}% from last month
              </Typography>
            </Box>
          </div>
          <MoneyIcon color="primary" sx={{ fontSize: 56, opacity: 0.3 }} />
        </Box>
      </CardContent>
    </Card>
  );
};

export default RevenueWidget;
