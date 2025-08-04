import React from 'react';
import { Card, CardContent, Typography, Box, Divider } from '@mui/material';
import { PersonAdd as PersonAddIcon, PersonRemove as PersonRemoveIcon } from '@mui/icons-material';

const StaffTurnoverWidget = ({ stats }) => {
  return (
    <Card>
      <CardContent>
        <Typography variant="h6" gutterBottom>Staff Turnover</Typography>
        
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <PersonAddIcon color="success" sx={{ mr: 1 }} />
            <Box>
              <Typography variant="h6">{stats?.newHires || 0}</Typography>
              <Typography variant="body2" color="text.secondary">New Hires</Typography>
            </Box>
          </Box>
          
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <PersonRemoveIcon color="error" sx={{ mr: 1 }} />
            <Box>
              <Typography variant="h6">{stats?.terminations || 0}</Typography>
              <Typography variant="body2" color="text.secondary">Terminations</Typography>
            </Box>
          </Box>
        </Box>
        
        <Divider sx={{ my: 2 }} />
        
        <Box>
          <Typography variant="body2" gutterBottom>Turnover Rate</Typography>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Box sx={{ width: '100%', mr: 1 }}>
              <Box 
                sx={{
                  height: 24,
                  backgroundColor: '#e0e0e0',
                  borderRadius: 1,
                  overflow: 'hidden'
                }}
              >
                <Box 
                  sx={{
                    height: '100%',
                    width: `${Math.min(stats?.turnoverRate || 0, 100)}%`,
                    backgroundColor: stats?.turnoverRate > 15 ? 'error.main' : 'success.main',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'flex-end',
                    pr: 1,
                    color: 'white',
                    fontSize: '0.75rem',
                    fontWeight: 'bold'
                  }}
                >
                  {stats?.turnoverRate?.toFixed(1)}%
                </Box>
              </Box>
            </Box>
          </Box>
          <Typography variant="caption" color="text.secondary">
            {stats?.turnoverRate > 15 ? 'High turnover rate' : 'Healthy turnover rate'}
          </Typography>
        </Box>
      </CardContent>
    </Card>
  );
};

export default StaffTurnoverWidget;
