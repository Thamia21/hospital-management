import React from 'react';
import { Box, Paper, Typography, List, ListItem, ListItemText, Divider, useTheme } from '@mui/material';
import { 
  CheckCircle as CheckCircleIcon, 
  Error as ErrorIcon, 
  Info as InfoIcon,
  Warning as WarningIcon,
  Schedule as ScheduleIcon
} from '@mui/icons-material';

// Helper function to get activity icon based on type
const getActivityIcon = (type) => {
  switch (type) {
    case 'success':
      return <CheckCircleIcon color="success" />;
    case 'error':
      return <ErrorIcon color="error" />;
    case 'warning':
      return <WarningIcon color="warning" />;
    default:
      return <InfoIcon color="info" />;
  }
};

// Format date to readable string
const formatDate = (dateString) => {
  if (!dateString) return 'Just now';
  
  const date = new Date(dateString);
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  }).format(date);
};

// Mock activity data - replace with actual data from props or API
const mockActivities = [
  {
    id: 1,
    type: 'success',
    message: 'Profile updated successfully',
    timestamp: new Date(Date.now() - 1000 * 60 * 5), // 5 minutes ago
    details: 'Changed profile picture and contact information'
  },
  {
    id: 2,
    type: 'info',
    message: 'Logged in from new device',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2), // 2 hours ago
    details: 'Chrome on Windows 10, IP: 192.168.1.1'
  },
  {
    id: 3,
    type: 'warning',
    message: 'Password changed',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24), // 1 day ago
    details: 'Password was last changed 90 days ago'
  },
  {
    id: 4,
    type: 'error',
    message: 'Failed login attempt',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 48), // 2 days ago
    details: 'Incorrect password entered 3 times'
  },
];

const ActivityLog = ({ user, loading = false }) => {
  const theme = useTheme();
  
  // In a real app, you would fetch this from an API or context
  const activities = user?.activities || mockActivities;

  return (
    <Paper elevation={2} sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h6">Recent Activity</Typography>
        <Box sx={{ display: 'flex', alignItems: 'center', color: 'text.secondary' }}>
          <ScheduleIcon sx={{ mr: 1, fontSize: 20 }} />
          <Typography variant="body2">
            {new Date().toLocaleDateString('en-US', {
              year: 'numeric',
              month: 'long',
              day: 'numeric'
            })}
          </Typography>
        </Box>
      </Box>
      
      <Divider sx={{ mb: 2 }} />
      
      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
          <CircularProgress />
        </Box>
      ) : activities.length > 0 ? (
        <List sx={{ width: '100%', bgcolor: 'background.paper' }}>
          {activities.map((activity, index) => (
            <React.Fragment key={activity.id}>
              <ListItem alignItems="flex-start" sx={{ py: 2 }}>
                <Box sx={{ mr: 2, display: 'flex', alignItems: 'center' }}>
                  {getActivityIcon(activity.type)}
                </Box>
                <ListItemText
                  primary={
                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                      <Typography variant="subtitle2" component="span">
                        {activity.message}
                      </Typography>
                      <Typography variant="caption" color="text.secondary" sx={{ ml: 2 }}>
                        {formatDate(activity.timestamp)}
                      </Typography>
                    </Box>
                  }
                  secondary={
                    <Typography
                      component="span"
                      variant="body2"
                      color="text.secondary"
                      sx={{ display: 'block', mt: 0.5 }}
                    >
                      {activity.details}
                    </Typography>
                  }
                />
              </ListItem>
              {index < activities.length - 1 && <Divider variant="inset" component="li" />}
            </React.Fragment>
          ))}
        </List>
      ) : (
        <Box sx={{ textAlign: 'center', py: 4, color: 'text.secondary' }}>
          <ScheduleIcon sx={{ fontSize: 48, opacity: 0.5, mb: 1 }} />
          <Typography>No recent activity found</Typography>
        </Box>
      )}
      
      {activities.length > 0 && (
        <Box sx={{ mt: 2, textAlign: 'center' }}>
          <Button size="small" color="primary">
            View All Activity
          </Button>
        </Box>
      )}
    </Paper>
  );
};

export default ActivityLog;
