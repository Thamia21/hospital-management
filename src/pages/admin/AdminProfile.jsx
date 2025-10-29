import React, { useState, useEffect } from 'react';
import {
  Container,
  Paper,
  Box,
  Typography,
  Grid,
  TextField,
  Avatar,
  Chip,
  Card,
  CardContent,
  Divider,
  CircularProgress,
  alpha
} from '@mui/material';
import {
  AdminPanelSettings as AdminIcon,
  Email as EmailIcon,
  Phone as PhoneIcon,
  Business as BusinessIcon,
  CalendarToday as CalendarIcon,
  Security as SecurityIcon,
  VerifiedUser as VerifiedIcon
} from '@mui/icons-material';
import { useAuth } from '../../context/AuthContext';

const AdminProfile = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [profileData, setProfileData] = useState(null);
  const [stats, setStats] = useState(null);

  useEffect(() => {
    const fetchAdminData = async () => {
      try {
        setLoading(true);
        if (user) {
          // Build profile from user context
          const adminProfile = {
            firstName: user.name?.split(' ')[0] || 'Admin',
            lastName: user.name?.split(' ').slice(1).join(' ') || 'User',
            email: user.email || '',
            phone: user.phone || 'Not specified',
            userId: user.userId || user._id || '',
            department: user.department || 'System Administration',
            role: 'System Administrator',
            joinDate: user.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A',
            lastLogin: new Date().toLocaleDateString(),
            permissions: user.permissions || ['Full System Access', 'User Management', 'Staff Management', 'Facility Management', 'Reports & Analytics']
          };

          setProfileData(adminProfile);

          // Mock stats - in production, fetch from API
          setStats({
            totalStaff: Math.floor(Math.random() * 100) + 50,
            totalPatients: Math.floor(Math.random() * 1000) + 500,
            activeUsers: Math.floor(Math.random() * 150) + 100,
            systemUptime: '99.9%',
            pendingApprovals: Math.floor(Math.random() * 10),
            recentActions: Math.floor(Math.random() * 50) + 20
          });
        }
      } catch (error) {
        console.error('Error fetching admin data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchAdminData();
  }, [user]);

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ py: 4, display: 'flex', justifyContent: 'center' }}>
        <CircularProgress size={60} />
      </Container>
    );
  }

  if (!profileData || !stats) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Typography variant="h6" color="error">
          Unable to load profile data. Please try again later.
        </Typography>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* Header Section */}
      <Paper
        elevation={0}
        sx={{
          p: 4,
          mb: 4,
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          color: 'white',
          borderRadius: 3,
          position: 'relative',
          overflow: 'hidden'
        }}
      >
        <Box sx={{ position: 'relative', zIndex: 1 }}>
          <Grid container spacing={3} alignItems="center">
            <Grid item>
              <Avatar
                sx={{
                  width: 120,
                  height: 120,
                  bgcolor: alpha('#fff', 0.2),
                  border: '4px solid white',
                  fontSize: '3rem',
                  fontWeight: 700
                }}
              >
                {profileData.firstName[0]}{profileData.lastName[0]}
              </Avatar>
            </Grid>
            <Grid item xs>
              <Typography variant="h4" sx={{ fontWeight: 700, mb: 1 }}>
                {profileData.firstName} {profileData.lastName}
              </Typography>
              <Box sx={{ display: 'flex', gap: 1, mb: 2, flexWrap: 'wrap' }}>
                <Chip
                  icon={<AdminIcon sx={{ color: 'white !important' }} />}
                  label={profileData.role}
                  sx={{
                    bgcolor: alpha('#fff', 0.2),
                    color: 'white',
                    fontWeight: 600,
                    border: '1px solid white'
                  }}
                />
                <Chip
                  icon={<VerifiedIcon sx={{ color: 'white !important' }} />}
                  label="Verified"
                  sx={{
                    bgcolor: alpha('#4caf50', 0.3),
                    color: 'white',
                    fontWeight: 600,
                    border: '1px solid white'
                  }}
                />
              </Box>
              <Typography variant="body1" sx={{ opacity: 0.95 }}>
                {profileData.department}
              </Typography>
            </Grid>
          </Grid>
        </Box>
      </Paper>

      {/* Stats Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={4}>
          <Card sx={{ borderRadius: 2, boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}>
            <CardContent>
              <Typography color="text.secondary" gutterBottom>
                Total Staff
              </Typography>
              <Typography variant="h4" sx={{ color: '#667eea', fontWeight: 700 }}>
                {stats.totalStaff}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={4}>
          <Card sx={{ borderRadius: 2, boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}>
            <CardContent>
              <Typography color="text.secondary" gutterBottom>
                Total Patients
              </Typography>
              <Typography variant="h4" sx={{ color: '#4caf50', fontWeight: 700 }}>
                {stats.totalPatients}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={4}>
          <Card sx={{ borderRadius: 2, boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}>
            <CardContent>
              <Typography color="text.secondary" gutterBottom>
                Active Users
              </Typography>
              <Typography variant="h4" sx={{ color: '#ff9800', fontWeight: 700 }}>
                {stats.activeUsers}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={4}>
          <Card sx={{ borderRadius: 2, boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}>
            <CardContent>
              <Typography color="text.secondary" gutterBottom>
                System Uptime
              </Typography>
              <Typography variant="h4" sx={{ color: '#2196f3', fontWeight: 700 }}>
                {stats.systemUptime}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={4}>
          <Card sx={{ borderRadius: 2, boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}>
            <CardContent>
              <Typography color="text.secondary" gutterBottom>
                Pending Approvals
              </Typography>
              <Typography variant="h4" sx={{ color: '#f44336', fontWeight: 700 }}>
                {stats.pendingApprovals}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={4}>
          <Card sx={{ borderRadius: 2, boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}>
            <CardContent>
              <Typography color="text.secondary" gutterBottom>
                Recent Actions
              </Typography>
              <Typography variant="h4" sx={{ color: '#9c27b0', fontWeight: 700 }}>
                {stats.recentActions}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Profile Information */}
      <Paper elevation={0} sx={{ p: 4, borderRadius: 3, boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}>
        <Typography variant="h5" sx={{ mb: 3, fontWeight: 700 }}>
          Profile Information
        </Typography>

        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="First Name"
              value={profileData.firstName}
              variant="filled"
              InputProps={{ readOnly: true }}
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Last Name"
              value={profileData.lastName}
              variant="filled"
              InputProps={{ readOnly: true }}
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Email"
              value={profileData.email}
              variant="filled"
              InputProps={{
                readOnly: true,
                startAdornment: <EmailIcon sx={{ mr: 1, color: 'action.active' }} />
              }}
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Phone"
              value={profileData.phone}
              variant="filled"
              InputProps={{
                readOnly: true,
                startAdornment: <PhoneIcon sx={{ mr: 1, color: 'action.active' }} />
              }}
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="User ID"
              value={profileData.userId.slice(-8)}
              variant="filled"
              InputProps={{ readOnly: true }}
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Department"
              value={profileData.department}
              variant="filled"
              InputProps={{
                readOnly: true,
                startAdornment: <BusinessIcon sx={{ mr: 1, color: 'action.active' }} />
              }}
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Join Date"
              value={profileData.joinDate}
              variant="filled"
              InputProps={{
                readOnly: true,
                startAdornment: <CalendarIcon sx={{ mr: 1, color: 'action.active' }} />
              }}
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Last Login"
              value={profileData.lastLogin}
              variant="filled"
              InputProps={{ readOnly: true }}
            />
          </Grid>
        </Grid>

        <Divider sx={{ my: 4 }} />

        {/* Permissions Section */}
        <Box>
          <Typography variant="h6" sx={{ mb: 2, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 1 }}>
            <SecurityIcon /> System Permissions
          </Typography>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
            {profileData.permissions.map((permission, index) => (
              <Chip
                key={index}
                label={permission}
                sx={{
                  bgcolor: alpha('#667eea', 0.1),
                  color: '#667eea',
                  fontWeight: 600,
                  border: '1px solid',
                  borderColor: alpha('#667eea', 0.3)
                }}
              />
            ))}
          </Box>
        </Box>
      </Paper>
    </Container>
  );
};

export default AdminProfile;
