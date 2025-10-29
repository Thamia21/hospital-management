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
  LocalHospital,
  Favorite
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

export default function NurseProfile() {
  const { user } = useAuth();
  const { t } = useLanguage();
  const [tabValue, setTabValue] = useState(0);
  const [loading, setLoading] = useState(true);
  const [profileData, setProfileData] = useState(null);
  const [stats, setStats] = useState(null);
  const [achievements, setAchievements] = useState([]);

  // Fetch nurse profile data
  useEffect(() => {
    const fetchNurseData = async () => {
      try {
        setLoading(true);
        
        // Extract nurse info from user data
        if (user) {
          const nurseProfile = {
            firstName: user.name?.split(' ')[0] || 'Nurse',
            lastName: user.name?.split(' ').slice(1).join(' ') || '',
            email: user.email || '',
            phone: user.phone || '',
            specialization: user.specialization || 'General Nursing',
            licenseNumber: user.licenseNumber || 'Not specified',
            department: user.department || 'General Ward',
            experience: user.experience || 'Not specified',
            qualifications: user.qualifications || 'Nursing Degree',
            address: user.address || 'Hospital Address',
            bio: `Dedicated ${user.specialization || 'nursing'} professional committed to providing compassionate patient care.`,
            languages: user.languages || ['English'],
            shift: user.shift || 'Day Shift',
            availability: 'Monday - Friday: 7:00 AM - 7:00 PM'
          };
          
          setProfileData(nurseProfile);
          
          // Mock stats - in real app, fetch from API
          setStats({
            totalPatients: Math.floor(Math.random() * 800) + 400,
            shiftsThisMonth: Math.floor(Math.random() * 20) + 15,
            patientSatisfaction: (Math.random() * 5 + 95).toFixed(1),
            yearsExperience: parseInt(user.experience) || Math.floor(Math.random() * 15) + 3,
            certifications: Math.floor(Math.random() * 8) + 3,
            trainingSessions: Math.floor(Math.random() * 20) + 5
          });
          
          // Mock achievements
          setAchievements([
            { title: 'Excellence in Patient Care', year: '2023', organization: 'Nursing Board SA' },
            { title: 'Outstanding Nursing Practice', year: '2022', organization: 'Healthcare Excellence Awards' },
            { title: 'Compassionate Care Award', year: '2021', organization: 'SA Nursing Council' }
          ]);
        }
      } catch (error) {
        console.error('Error fetching nurse data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchNurseData();
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
      <Paper sx={{ p: 3, mb: 3, borderRadius: 2 }}>
        <Grid container spacing={3} alignItems="center">
          <Grid item>
            <Avatar
              sx={{
                width: 120,
                height: 120,
                bgcolor: '#1976d2',
                fontSize: '3rem'
              }}
            >
              {profileData.firstName?.[0]}{profileData.lastName?.[0]}
            </Avatar>
          </Grid>
          <Grid item xs>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1 }}>
              <Typography variant="h4" sx={{ fontWeight: 600 }}>
                {profileData.firstName} {profileData.lastName}
              </Typography>
              <Chip
                icon={<LocalHospital />}
                label="Registered Nurse"
                color="primary"
                sx={{ fontWeight: 600 }}
              />
            </Box>
            <Typography variant="h6" color="text.secondary" sx={{ mb: 1 }}>
              {profileData.specialization}
            </Typography>
            <Box sx={{ display: 'flex', gap: 3, flexWrap: 'wrap' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Work fontSize="small" color="action" />
                <Typography variant="body2">{profileData.department}</Typography>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Badge fontSize="small" color="action" />
                <Typography variant="body2">{profileData.licenseNumber}</Typography>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <CalendarToday fontSize="small" color="action" />
                <Typography variant="body2">{profileData.experience} years experience</Typography>
              </Box>
            </Box>
          </Grid>
        </Grid>
      </Paper>

      {/* Stats Cards */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={4}>
          <Card sx={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: 'white' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography variant="h4" sx={{ fontWeight: 700 }}>
                    {stats.totalPatients}
                  </Typography>
                  <Typography variant="body2" sx={{ opacity: 0.9 }}>
                    Total Patients Cared For
                  </Typography>
                </Box>
                <People sx={{ fontSize: 40, opacity: 0.8 }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={4}>
          <Card sx={{ background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)', color: 'white' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography variant="h4" sx={{ fontWeight: 700 }}>
                    {stats.shiftsThisMonth}
                  </Typography>
                  <Typography variant="body2" sx={{ opacity: 0.9 }}>
                    Shifts This Month
                  </Typography>
                </Box>
                <Assignment sx={{ fontSize: 40, opacity: 0.8 }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={4}>
          <Card sx={{ background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)', color: 'white' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography variant="h4" sx={{ fontWeight: 700 }}>
                    {stats.patientSatisfaction}%
                  </Typography>
                  <Typography variant="body2" sx={{ opacity: 0.9 }}>
                    Patient Satisfaction
                  </Typography>
                </Box>
                <Favorite sx={{ fontSize: 40, opacity: 0.8 }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={4}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography variant="h4" sx={{ fontWeight: 700, color: '#1976d2' }}>
                    {stats.yearsExperience}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Years Experience
                  </Typography>
                </Box>
                <TrendingUp sx={{ fontSize: 40, color: '#1976d2' }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={4}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography variant="h4" sx={{ fontWeight: 700, color: '#2e7d32' }}>
                    {stats.certifications}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Certifications
                  </Typography>
                </Box>
                <Star sx={{ fontSize: 40, color: '#2e7d32' }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={4}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography variant="h4" sx={{ fontWeight: 700, color: '#ed6c02' }}>
                    {stats.trainingSessions}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Training Sessions
                  </Typography>
                </Box>
                <School sx={{ fontSize: 40, color: '#ed6c02' }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Tabs Section */}
      <Paper sx={{ borderRadius: 2 }}>
        <Tabs
          value={tabValue}
          onChange={handleTabChange}
          sx={{ borderBottom: 1, borderColor: 'divider' }}
        >
          <Tab label="Personal Information" />
          <Tab label="Professional Details" />
          <Tab label="Achievements" />
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
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Bio"
                value={profileData.bio}
                multiline
                rows={4}
                variant="filled"
                InputProps={{ readOnly: true }}
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
                label="Shift"
                value={profileData.shift}
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
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Availability"
                value={profileData.availability}
                variant="filled"
                InputProps={{ readOnly: true }}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Languages"
                value={profileData.languages.join(', ')}
                variant="filled"
                InputProps={{ readOnly: true }}
              />
            </Grid>
          </Grid>
        </TabPanel>

        {/* Achievements Tab */}
        <TabPanel value={tabValue} index={2}>
          <List>
            {achievements.map((achievement, index) => (
              <ListItem key={index} sx={{ py: 2 }}>
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
      </Paper>
    </Container>
  );
}
