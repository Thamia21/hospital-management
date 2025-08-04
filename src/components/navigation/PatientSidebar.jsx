import React from 'react';
import {
  Drawer,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Box,
  Button
} from '@mui/material';
import {
  Dashboard as DashboardIcon,
  MedicalServices as MedicalServicesIcon,
  Medication as MedicationIcon,
  Payments as PaymentsIcon,
  EventNote as EventNoteIcon,
  Settings as SettingsIcon,
  Chat as ChatIcon,
  Logout as LogoutIcon
} from '@mui/icons-material';
import { Link as RouterLink, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import styles from './PatientSidebar.module.css';

const drawerWidth = 240;

const PatientSidebar = ({ mobileOpen = false, handleDrawerToggle = () => {} }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { logout } = useAuth();
  const { t } = useLanguage();
  const menuItems = [
    {
      text: t('nav.dashboard', 'Dashboard'),
      icon: <DashboardIcon />,
      path: '/patient-portal'
    },
    {
      text: t('nav.healthSummary', 'Health Summary'),
      icon: <MedicalServicesIcon />,
      path: '/health-summary'
    },
    {
      text: t('nav.messages', 'Messages'),
      icon: <ChatIcon />,
      path: '/patient-messages'
    },
    {
      text: t('nav.appointments', 'Appointments'),
      icon: <EventNoteIcon />,
      path: '/book-appointment'
    },
    {
      text: t('nav.testResults', 'Test Results'),
      icon: <MedicalServicesIcon />,
      path: '/test-results'
    },
    {
      text: t('nav.medicalRecords', 'Medical Records'),
      icon: <MedicalServicesIcon />,
      path: '/patient-medical-records'
    },
    {
      text: t('nav.prescriptions', 'Prescriptions'),
      icon: <MedicationIcon />,
      path: '/patient-prescriptions'
    },
    {
      text: t('nav.billing', 'Billing'),
      icon: <PaymentsIcon />,
      path: '/patient-billing'
    },
    {
      text: t('nav.settings', 'Settings'),
      icon: <SettingsIcon />,
      path: '/settings'
    }
  ];

  return (
    <>
      {/* Mobile Drawer */}
      <Drawer
        variant="temporary"
        open={mobileOpen}
        onClose={handleDrawerToggle}
        ModalProps={{ keepMounted: true }}
        className={styles['sidebar-root']}
        sx={{
          display: { xs: 'block', sm: 'none' },
          [`& .MuiDrawer-paper`]: {
            width: drawerWidth,
            boxSizing: 'border-box',
            background: 'transparent',
            borderRight: 'none',
          },
        }}
      >
        <div className={styles['sidebar-header']}>
          <span>{t('nav.patientPortal', 'Patient Portal')}</span>
        </div>
        <Box sx={{ overflow: 'auto' }}>
          <List className={styles['sidebar-list']}>
            {menuItems.map((item) => {
              const isActive = location.pathname === item.path || (item.path !== '/' && location.pathname.startsWith(item.path));
              return (
                <ListItem
                  button
                  key={item.text}
                  component={RouterLink}
                  to={item.path}
                  className={isActive ? `${styles['sidebar-listitem']} ${styles['active']}` : styles['sidebar-listitem']}
                  onClick={handleDrawerToggle}
                >
                  <ListItemIcon>{item.icon}</ListItemIcon>
                  <ListItemText primary={item.text} />
                </ListItem>
              );
            })}
          </List>
        </Box>
        {/* Logout button at the bottom */}
        <Box sx={{ width: '100%' }}>
          <Button
            variant="contained"
            fullWidth
            startIcon={<LogoutIcon />}
            className={styles['logout-btn']}
            onClick={async () => {
              await logout();
              navigate('/login');
            }}
          >
            {t('nav.logout', 'Logout')}
          </Button>
        </Box>
      </Drawer>
      {/* Permanent Drawer for desktop */}
      <Drawer
        variant="permanent"
        className={styles['sidebar-root']}
        sx={{
          width: drawerWidth,
          flexShrink: 0,
          [`& .MuiDrawer-paper`]: {
            width: drawerWidth,
            boxSizing: 'border-box',
            background: 'transparent',
            borderRight: 'none',
          },
          display: { xs: 'none', sm: 'block' },
        }}
      >
        <div className={styles['sidebar-header']}>
          <span>{t('nav.patientPortal', 'Patient Portal')}</span>
        </div>
        <Box sx={{ overflow: 'auto' }}>
          <List className={styles['sidebar-list']}>
            {menuItems.map((item) => {
              const isActive = location.pathname === item.path || (item.path !== '/' && location.pathname.startsWith(item.path));
              return (
                <ListItem
                  button
                  key={item.text}
                  component={RouterLink}
                  to={item.path}
                  className={isActive ? `${styles['sidebar-listitem']} ${styles['active']}` : styles['sidebar-listitem']}
                >
                  <ListItemIcon>{item.icon}</ListItemIcon>
                  <ListItemText primary={item.text} />
                </ListItem>
              );
            })}
          </List>
        </Box>
        {/* Logout button at the bottom */}
        <Box sx={{ width: '100%' }}>
          <Button
            variant="contained"
            fullWidth
            startIcon={<LogoutIcon />}
            className={styles['logout-btn']}
            onClick={async () => {
              await logout();
              navigate('/login');
            }}
          >
            {t('nav.logout', 'Logout')}
          </Button>
        </Box>
      </Drawer>
    </>
  );
};

export default PatientSidebar;
