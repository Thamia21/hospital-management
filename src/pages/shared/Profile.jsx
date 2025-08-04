import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import {
  Box,
  Container,
  Grid,
  Tabs,
  Tab,
  Typography,
  Paper,
  Divider,
  Button,
  Alert,
  Snackbar,
  CircularProgress,
  useTheme,
  useMediaQuery
} from '@mui/material';
import { useAuth } from '../../context/AuthContext';

// Import profile sections
import ProfileOverview from '../../components/profile/ProfileOverview';
import SecuritySettings from '../../components/profile/SecuritySettings';
import NotificationSettings from '../../components/profile/NotificationSettings';
import ProfessionalInfo from '../../components/profile/ProfessionalInfo';
import Documents from '../../components/profile/Documents';
import ActivityLog from '../../components/profile/ActivityLog';

// Tab panel component
function TabPanel({ children, value, index, ...other }) {
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`profile-tabpanel-${index}`}
      aria-labelledby={`profile-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ p: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );
}

function a11yProps(index) {
  return {
    id: `profile-tab-${index}`,
    'aria-controls': `profile-tabpanel-${index}`,
  };
}

export default function Profile() {
  const { user, updateProfile } = useAuth();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [tabValue, setTabValue] = useState(0);
  const [loading, setLoading] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  const handleSnackbarClose = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  const showSuccess = (message) => {
    setSnackbar({ open: true, message, severity: 'success' });
  };

  const showError = (message) => {
    setSnackbar({ open: true, message, severity: 'error' });
  };

  const handleProfileUpdate = async (data) => {
    try {
      setLoading(true);
      await updateProfile(data);
      showSuccess('Profile updated successfully');
    } catch (error) {
      console.error('Error updating profile:', error);
      showError(error.message || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  const tabs = [
    { label: 'Overview', component: <ProfileOverview user={user} onUpdate={handleProfileUpdate} /> },
    { label: 'Security', component: <SecuritySettings user={user} onUpdate={handleProfileUpdate} /> },
    { label: 'Notifications', component: <NotificationSettings user={user} onUpdate={handleProfileUpdate} /> },
  ];

  // Add professional info tab for staff
  if (user?.roles?.some(role => ['DOCTOR', 'NURSE', 'ADMIN'].includes(role))) {
    tabs.push({ label: 'Professional', component: <ProfessionalInfo user={user} onUpdate={handleProfileUpdate} /> });
  }

  // Add documents tab
  tabs.push({ label: 'Documents', component: <Documents user={user} /> });
  
  // Add activity log tab for staff
  if (user?.roles?.some(role => ['DOCTOR', 'NURSE', 'ADMIN'].includes(role))) {
    tabs.push({ label: 'Activity', component: <ActivityLog user={user} /> });
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        My Profile
      </Typography>
      
      <Paper sx={{ width: '100%', mb: 3 }}>
        <Tabs
          value={tabValue}
          onChange={handleTabChange}
          aria-label="profile tabs"
          variant={isMobile ? 'scrollable' : 'standard'}
          scrollButtons={isMobile ? 'auto' : false}
          allowScrollButtonsMobile
          sx={{
            borderBottom: 1,
            borderColor: 'divider',
            '& .MuiTabs-flexContainer': {
              flexWrap: isMobile ? 'wrap' : 'nowrap',
            },
          }}
        >
          {tabs.map((tab, index) => (
            <Tab 
              key={index} 
              label={tab.label} 
              {...a11yProps(index)} 
              sx={{ minWidth: 'auto', px: 2 }}
            />
          ))}
        </Tabs>
        
        {tabs.map((tab, index) => (
          <TabPanel key={index} value={tabValue} index={index}>
            {React.cloneElement(tab.component, { loading })}
          </TabPanel>
        ))}
      </Paper>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleSnackbarClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert onClose={handleSnackbarClose} severity={snackbar.severity} sx={{ width: '100%' }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Container>
  );
}
