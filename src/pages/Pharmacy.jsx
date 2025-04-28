import React, { useState } from 'react';
import {
  Box,
  Paper,
  Tabs,
  Tab,
  Typography,
  Button,
  Grid,
  Card,
  CardContent,
  TextField,
  InputAdornment,
  Alert
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import AddIcon from '@mui/icons-material/Add';
import InventoryList from '../components/pharmacy/InventoryList';
import PrescriptionList from '../components/pharmacy/PrescriptionList';
import AddMedicineForm from '../components/pharmacy/AddMedicineForm';

// Mock data - replace with API calls
const lowStockThreshold = 10;
const expiringThreshold = 30; // days

export default function Pharmacy() {
  const [tabValue, setTabValue] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
  const [isAddMedicineOpen, setIsAddMedicineOpen] = useState(false);

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  // Mock statistics - replace with real data
  const statistics = {
    totalMedicines: 150,
    lowStock: 5,
    expiringSoon: 3,
    pendingPrescriptions: 8
  };

  return (
    <div>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
        <Typography variant="h4">
          Pharmacy Management
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => setIsAddMedicineOpen(true)}
        >
          Add Medicine
        </Button>
      </Box>

      {/* Statistics Cards */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Total Medicines
              </Typography>
              <Typography variant="h4">
                {statistics.totalMedicines}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Low Stock Items
              </Typography>
              <Typography variant="h4" color="error">
                {statistics.lowStock}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Expiring Soon
              </Typography>
              <Typography variant="h4" color="warning.main">
                {statistics.expiringSoon}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Pending Prescriptions
              </Typography>
              <Typography variant="h4" color="info.main">
                {statistics.pendingPrescriptions}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Alerts */}
      {statistics.lowStock > 0 && (
        <Alert severity="warning" sx={{ mb: 2 }}>
          {statistics.lowStock} medicines are running low on stock!
        </Alert>
      )}
      {statistics.expiringSoon > 0 && (
        <Alert severity="info" sx={{ mb: 2 }}>
          {statistics.expiringSoon} medicines are expiring within {expiringThreshold} days.
        </Alert>
      )}

      {/* Search Bar */}
      <TextField
        fullWidth
        variant="outlined"
        placeholder="Search medicines, prescriptions..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        sx={{ mb: 3 }}
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <SearchIcon />
            </InputAdornment>
          ),
        }}
      />

      {/* Tabs */}
      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 2 }}>
        <Tabs value={tabValue} onChange={handleTabChange}>
          <Tab label="Inventory" />
          <Tab label="Prescriptions" />
        </Tabs>
      </Box>

      {/* Tab Panels */}
      {tabValue === 0 && (
        <InventoryList 
          searchTerm={searchTerm}
          lowStockThreshold={lowStockThreshold}
        />
      )}
      {tabValue === 1 && (
        <PrescriptionList 
          searchTerm={searchTerm}
        />
      )}

      {/* Add Medicine Dialog */}
      <AddMedicineForm
        open={isAddMedicineOpen}
        onClose={() => setIsAddMedicineOpen(false)}
      />
    </div>
  );
}
