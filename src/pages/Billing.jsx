import React, { useState } from 'react';
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  Button,
  Tabs,
  Tab,
  TextField,
  InputAdornment
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import AddIcon from '@mui/icons-material/Add';
import InvoiceList from '../components/billing/InvoiceList';
import PaymentList from '../components/billing/PaymentList';
import CreateInvoiceForm from '../components/billing/CreateInvoiceForm';

export default function Billing() {
  const [tabValue, setTabValue] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
  const [isCreateInvoiceOpen, setIsCreateInvoiceOpen] = useState(false);

  // Mock financial statistics
  const financialStats = {
    totalRevenue: 125750.00,
    pendingInvoices: 42,
    paidInvoices: 156,
    outstandingBalance: 35620.50,
    averageInvoiceValue: 1850.75
  };

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  return (
    <div>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
        <Typography variant="h4">
          Billing & Financial Management
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => setIsCreateInvoiceOpen(true)}
        >
          Create Invoice
        </Button>
      </Box>

      {/* Financial Statistics Cards */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={4}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Total Revenue
              </Typography>
              <Typography variant="h4" color="primary">
                ${financialStats.totalRevenue.toLocaleString()}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={4}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Outstanding Balance
              </Typography>
              <Typography variant="h4" color="error">
                ${financialStats.outstandingBalance.toLocaleString()}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={4}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Average Invoice Value
              </Typography>
              <Typography variant="h4" color="info.main">
                ${financialStats.averageInvoiceValue.toLocaleString()}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Search and Tabs */}
      <Box sx={{ display: 'flex', mb: 2 }}>
        <TextField
          fullWidth
          variant="outlined"
          placeholder="Search invoices, patients, payments..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          sx={{ mr: 2 }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            ),
          }}
        />
        <Tabs value={tabValue} onChange={handleTabChange}>
          <Tab label="Invoices" />
          <Tab label="Payments" />
        </Tabs>
      </Box>

      {/* Tab Panels */}
      {tabValue === 0 && (
        <InvoiceList 
          searchTerm={searchTerm}
          pendingInvoices={financialStats.pendingInvoices}
          paidInvoices={financialStats.paidInvoices}
        />
      )}
      {tabValue === 1 && (
        <PaymentList 
          searchTerm={searchTerm}
        />
      )}

      {/* Create Invoice Dialog */}
      <CreateInvoiceForm
        open={isCreateInvoiceOpen}
        onClose={() => setIsCreateInvoiceOpen(false)}
      />
    </div>
  );
}
