import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Grid,
  Paper,
  Typography,
  Avatar,
  TextField,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Tab,
  Tabs,
  List,
  ListItem,
  ListItemIcon,
  ListItemText
} from '@mui/material';
import {
  School,
  Work,
  LocationOn,
  Phone,
  Email,
  Badge,
  CalendarToday,
  Star,
  EmojiEvents,
  TrendingUp,
  People,
  Assignment,
  Schedule
} from '@mui/icons-material';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';

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

export default function DoctorProfile() {
  const { user } = useAuth();
  const { t } = useLanguage();
  const [tabValue, setTabValue] = useState(0);
  const [loading, setLoading] = useState(true);
  const [profileData, setProfileData] = useState(null);
  const [stats, setStats] = useState(null);
  const [achievements, setAchievements] = useState([]);

  // Fetch doctor profile data
  useEffect(() => {
    const fetchDoctorData = async () => {
      try {
        setLoading(true);
        
        // Extract doctor info from user data
        if (user) {
          const doctorProfile = {
            firstName: user.name?.split(' ')[0] || 'Doctor',
            lastName: user.name?.split(' ').slice(1).join(' ') || '',
            email: user.email || '',
            phone: user.phone || '',
            specialization: user.specialization || 'General Practice',
            licenseNumber: user.licenseNumber || 'Not specified',
            department: user.department || 'General Medicine',
            experience: user.experience || 'Not specified',
            qualifications: user.qualifications || 'Medical Degree',
            address: user.address || 'Hospital Address',
            bio: `Experienced ${user.specialization || 'medical'} practitioner dedicated to providing quality healthcare.`,
            languages: user.languages || ['English'],
            consultationFee: 'Contact for rates',
            availability: 'Monday - Friday: 8:00 AM - 5:00 PM'
          };
          
          setProfileData(doctorProfile);
          
          // Mock stats - in real app, fetch from API
          setStats({
            totalPatients: Math.floor(Math.random() * 1000) + 500,
            appointmentsThisMonth: Math.floor(Math.random() * 50) + 30,
            successfulTreatments: (Math.random() * 5 + 95).toFixed(1),
            yearsExperience: parseInt(user.experience) || Math.floor(Math.random() * 20) + 5,
            certifications: Math.floor(Math.random() * 10) + 5,
            publications: Math.floor(Math.random() * 30) + 10
          });
          
          // Mock achievements - in real app, fetch from API
          setAchievements([
            { title: 'Excellence in Medical Practice', year: '2023', organization: 'Medical Board SA' },
            { title: 'Outstanding Patient Care', year: '2022', organization: 'Healthcare Excellence Awards' },
            { title: 'Medical Research Contribution', year: '2021', organization: 'SA Medical Journal' }
          ]);
        }
      } catch (error) {
        console.error('Error fetching doctor data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDoctorData();
  }, [user]);

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

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
        sx={{ 
          p: 4, 
          mb: 3, 
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          color: 'white',
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
                  border: '4px solid rgba(255,255,255,0.3)',
                  fontSize: '2rem'
                }}
              >
                {profileData.firstName[0]}{profileData.lastName[0]}
              </Avatar>
            </Grid>
            <Grid item xs>
              <Typography variant="h4" gutterBottom>
                {profileData.firstName} {profileData.lastName}
              </Typography>
              <Typography variant="h6" sx={{ opacity: 0.9, mb: 1 }}>
                {profileData.specialization} Specialist
              </Typography>
              <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mb: 2 }}>
                <Chip 
                  label={`${stats.yearsExperience} Years Experience`} 
                  sx={{ bgcolor: 'rgba(255,255,255,0.2)', color: 'white' }}
                />
                <Chip 
                  label={`${stats.totalPatients} Patients`} 
                  sx={{ bgcolor: 'rgba(255,255,255,0.2)', color: 'white' }}
                />
                <Chip 
                  label={`${stats.successfulTreatments}% Success Rate`} 
                  sx={{ bgcolor: 'rgba(255,255,255,0.2)', color: 'white' }}
                />
              </Box>
              <Typography variant="body1" sx={{ opacity: 0.9 }}>
                {profileData.bio}
              </Typography>
            </Grid>
          </Grid>
        </Box>
      </Paper>

      {/* Stats Cards */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={2}>
          <Card sx={{ textAlign: 'center', p: 2 }}>
            <People sx={{ fontSize: 40, color: '#667eea', mb: 1 }} />
            <Typography variant="h4" color="primary">{stats.totalPatients}</Typography>
            <Typography variant="body2" color="textSecondary">Total Patients</Typography>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={2}>
          <Card sx={{ textAlign: 'center', p: 2 }}>
            <Schedule sx={{ fontSize: 40, color: '#764ba2', mb: 1 }} />
            <Typography variant="h4" color="primary">{stats.appointmentsThisMonth}</Typography>
            <Typography variant="body2" color="textSecondary">This Month</Typography>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={2}>
          <Card sx={{ textAlign: 'center', p: 2 }}>
            <TrendingUp sx={{ fontSize: 40, color: '#52c41a', mb: 1 }} />
            <Typography variant="h4" color="primary">{stats.successfulTreatments}%</Typography>
            <Typography variant="body2" color="textSecondary">Success Rate</Typography>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={2}>
          <Card sx={{ textAlign: 'center', p: 2 }}>
            <EmojiEvents sx={{ fontSize: 40, color: '#faad14', mb: 1 }} />
            <Typography variant="h4" color="primary">{stats.certifications}</Typography>
            <Typography variant="body2" color="textSecondary">Certifications</Typography>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={2}>
          <Card sx={{ textAlign: 'center', p: 2 }}>
            <Assignment sx={{ fontSize: 40, color: '#722ed1', mb: 1 }} />
            <Typography variant="h4" color="primary">{stats.publications}</Typography>
            <Typography variant="body2" color="textSecondary">Publications</Typography>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={2}>
          <Card sx={{ textAlign: 'center', p: 2 }}>
            <Star sx={{ fontSize: 40, color: '#fa8c16', mb: 1 }} />
            <Typography variant="h4" color="primary">4.9</Typography>
            <Typography variant="body2" color="textSecondary">Rating</Typography>
          </Card>
        </Grid>
      </Grid>

      {/* Tabbed Content */}
      <Paper sx={{ width: '100%' }}>
        <Tabs
          value={tabValue}
          onChange={handleTabChange}
          aria-label="doctor profile tabs"
          sx={{ borderBottom: 1, borderColor: 'divider' }}
        >
          <Tab label="Personal Information" />
          <Tab label="Professional Details" />
          <Tab label="Achievements & Awards" />
          <Tab label="Schedule & Availability" />
        </Tabs>

        {/* Personal Information Tab */}
        <TabPanel value={tabValue} index={0}>
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
                InputProps={{ readOnly: true }}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Phone"
                value={profileData.phone}
                variant="filled"
                InputProps={{ readOnly: true }}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Address"
                value={profileData.address}
                variant="filled"
                InputProps={{ readOnly: true }}
                multiline
                rows={2}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Bio"
                value={profileData.bio}
                variant="filled"
                InputProps={{ readOnly: true }}
                multiline
                rows={3}
              />
            </Grid>
          </Grid>
        </TabPanel>

        {/* Professional Details Tab */}
        <TabPanel value={tabValue} index={1}>
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Specialization"
                value={profileData.specialization}
                variant="filled"
                InputProps={{ readOnly: true }}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="License Number"
                value={profileData.licenseNumber}
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
                InputProps={{ readOnly: true }}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Experience"
                value={profileData.experience}
                variant="filled"
                InputProps={{ readOnly: true }}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Qualifications"
                value={profileData.qualifications}
                variant="filled"
                InputProps={{ readOnly: true }}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Consultation Fee"
                value={profileData.consultationFee}
                variant="filled"
                InputProps={{ readOnly: true }}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Languages Spoken"
                value={profileData.languages.join(', ')}
                variant="filled"
                InputProps={{ readOnly: true }}
              />
            </Grid>
          </Grid>
        </TabPanel>

        {/* Achievements Tab */}
        <TabPanel value={tabValue} index={2}>
          <Typography variant="h6" gutterBottom>Awards & Recognition</Typography>
          <List>
            {achievements.map((achievement, index) => (
              <ListItem key={index} sx={{ border: '1px solid #e0e0e0', borderRadius: 1, mb: 1 }}>
                <ListItemIcon>
                  <EmojiEvents sx={{ color: '#faad14' }} />
                </ListItemIcon>
                <ListItemText
                  primary={achievement.title}
                  secondary={`${achievement.organization} • ${achievement.year}`}
                />
              </ListItem>
            ))}
          </List>
        </TabPanel>

        {/* Schedule Tab */}
        <TabPanel value={tabValue} index={3}>
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>Working Hours</Typography>
                  <Typography variant="body1">{profileData.availability}</Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} md={6}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>Consultation Fee</Typography>
                  <Typography variant="body1">{profileData.consultationFee}</Typography>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </TabPanel>
      </Paper>
    </Container>
  );
}
