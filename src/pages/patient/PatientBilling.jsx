import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Grid,
  Card,
  CardContent,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
  CircularProgress,
  Divider,
  Stack,
  IconButton,
  Tooltip,
} from '@mui/material';
import {
  Payment as PaymentIcon,
  Receipt as ReceiptIcon,
  Download as DownloadIcon,
  Visibility as ViewIcon,
  CreditCard as CreditCardIcon,
  AccountBalance as BankIcon,
  Warning as WarningIcon,
  CheckCircle as CheckCircleIcon,
} from '@mui/icons-material';
import { Elements } from '@stripe/react-stripe-js';
import { loadStripe } from "@stripe/stripe-js";
import { stripePromise } from '../../config/stripe';
import StripePaymentForm from '../../components/StripePaymentForm';
import { useAuth } from '../../context/AuthContext';
import axios from 'axios';

const API_URL = 'http://localhost:5000/api';

const getAuthHeader = () => {
  const token = localStorage.getItem('token');
  return token ? { Authorization: `Bearer ${token}` } : {};
};

// Format currency as South African Rand
const formatCurrency = (amount) => {
  return new Intl.NumberFormat('en-ZA', {
    style: 'currency',
    currency: 'ZAR',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(amount || 0);
};

export default function PatientBilling() {
  const { user } = useAuth();
  const [bills, setBills] = useState([]);
  const [paymentHistory, setPaymentHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [paymentDialog, setPaymentDialog] = useState(false);
  const [selectedBill, setSelectedBill] = useState(null);
  const [paymentData, setPaymentData] = useState({
    amount: '',
    paymentMethod: 'stripe', // Default to Stripe
    billingAddress: '',
  });
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    console.log('PatientBilling mounted. user =', user);
    if (user && user.uid) {
      console.log('Fetching billing data for uid =', user.uid);
      fetchBillingData();
    } else {
      console.warn('PatientBilling: user.uid not available yet. Skipping initial fetch.');
    }
  }, [user && user.uid]);

  const fetchBillingData = async () => {
    try {
      setLoading(true);
      
      // Fetch bills
      const billsResponse = await axios.get(
        `${API_URL}/patients/${user.uid}/bills`,
        { headers: getAuthHeader() }
      );
      const billsData = billsResponse.data || [];
      console.log('Billing: fetched bills count =', billsData.length, billsData);
      setBills(billsData);

      // Fetch payment history
      const paymentsResponse = await axios.get(
        `${API_URL}/patients/${user.uid}/payments`,
        { headers: getAuthHeader() }
      );
      const paymentsData = paymentsResponse.data || [];
      console.log('Billing: fetched payments count =', paymentsData.length, paymentsData);
      setPaymentHistory(paymentsData);
    } catch (error) {
      console.error('Error fetching billing data:', error);
      setError('Failed to load billing information');
      setBills([]);
      setPaymentHistory([]);
    } finally {
      setLoading(false);
    }
  };

  const handlePayment = async (stripePaymentResult) => {
    try {
      setProcessing(true);
      setError('');

      // Create payment record with Stripe payment details
      const paymentRecord = {
        patientId: user.uid,
        billId: selectedBill._id,
        amount: parseFloat(stripePaymentResult.amount),
        paymentMethod: 'stripe',
        status: 'completed',
        createdAt: new Date(),
        transactionId: stripePaymentResult.paymentIntentId,
        currency: stripePaymentResult.currency,
      };

      await axios.post(
        `${API_URL}/patients/${user.uid}/payments`,
        paymentRecord,
        { headers: getAuthHeader() }
      );

      // Update bill status if fully paid
      const remainingAmount = selectedBill.amount - parseFloat(stripePaymentResult.amount);
      const billUpdate = remainingAmount <= 0
        ? { status: 'paid', paidAt: new Date() }
        : { amount: remainingAmount };

      await axios.put(
        `${API_URL}/bills/${selectedBill._id}`,
        billUpdate,
        { headers: getAuthHeader() }
      );

      // Refresh data
      await fetchBillingData();

      // Close dialog and reset form
      setPaymentDialog(false);
      setSelectedBill(null);
      setPaymentData({
        amount: '',
        paymentMethod: 'stripe',
        billingAddress: '',
      });

      alert('Payment processed successfully!');
    } catch (error) {
      console.error('Error processing payment:', error);
      setError('Failed to process payment. Please try again.');
    } finally {
      setProcessing(false);
    }
  };

  const openPaymentDialog = (bill) => {
    setSelectedBill(bill);
    setPaymentData({ ...paymentData, amount: bill.amount.toString() });
    setPaymentDialog(true);
  };

  const getBillStatusColor = (status) => {
    switch (status) {
      case 'paid': return 'success';
      case 'pending': return 'warning';
      case 'overdue': return 'error';
      default: return 'default';
    }
  };

  const getPaymentMethodIcon = (method) => {
    switch (method) {
      case 'credit_card': return <CreditCardIcon />;
      case 'bank_transfer': return <BankIcon />;
      default: return <PaymentIcon />;
    }
  };

  const totalOutstanding = bills
    .filter(bill => bill.status !== 'paid')
    .reduce((sum, bill) => sum + (bill.amount || 0), 0);

  const totalPaid = paymentHistory
    .filter(payment => payment.status === 'completed')
    .reduce((sum, payment) => sum + (payment.amount || 0), 0);

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 400 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
        <Typography variant="h4" gutterBottom>
          Billing & Payments
        </Typography>
        <Button variant="outlined" onClick={fetchBillingData} disabled={loading}>
          {loading ? 'Refreshing...' : 'Refresh'}
        </Button>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {/* Summary Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <WarningIcon sx={{ fontSize: 48, color: 'warning.main', mb: 1 }} />
              <Typography variant="h4" color="warning.main">
                {formatCurrency(totalOutstanding)}
              </Typography>
              <Typography variant="body1" color="text.secondary">
                Outstanding Balance
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <CheckCircleIcon sx={{ fontSize: 48, color: 'success.main', mb: 1 }} />
              <Typography variant="h4" color="success.main">
                {formatCurrency(totalPaid)}
              </Typography>
              <Typography variant="body1" color="text.secondary">
                Total Paid
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <ReceiptIcon sx={{ fontSize: 48, color: 'primary.main', mb: 1 }} />
              <Typography variant="h4" color="primary.main">
                {bills.length}
              </Typography>
              <Typography variant="body1" color="text.secondary">
                Total Bills
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Outstanding Bills */}
      <Paper sx={{ mb: 4 }}>
        <Box sx={{ p: 2, borderBottom: 1, borderColor: 'divider' }}>
          <Typography variant="h6">Outstanding Bills</Typography>
        </Box>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Bill ID</TableCell>
                <TableCell>Service</TableCell>
                <TableCell>Date</TableCell>
                <TableCell>Amount</TableCell>
                <TableCell>Due Date</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {bills.map((bill) => (
                <TableRow key={bill._id || bill.id}>
                  <TableCell>{bill.billNumber || (bill._id ? bill._id.slice(-8) : bill.id?.slice(-8))}</TableCell>
                  <TableCell>{bill.description || bill.service || 'Medical Service'}</TableCell>
                  <TableCell>
                    {bill.createdAt ? new Date(bill.createdAt).toLocaleDateString() : 'N/A'}
                  </TableCell>
                  <TableCell>{formatCurrency(bill.amount)}</TableCell>
                  <TableCell>
                    {bill.dueDate ? new Date(bill.dueDate).toLocaleDateString() : 'N/A'}
                  </TableCell>
                  <TableCell>
                    <Chip 
                      label={bill.status} 
                      color={getBillStatusColor(bill.status)}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>
                    <Stack direction="row" spacing={1}>
                      <Tooltip title="View Details">
                        <IconButton size="small">
                          <ViewIcon />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Download">
                        <IconButton size="small">
                          <DownloadIcon />
                        </IconButton>
                      </Tooltip>
                      <Button
                        size="small"
                        variant="contained"
                        startIcon={<PaymentIcon />}
                        onClick={() => openPaymentDialog(bill)}
                      >
                        Pay Now
                      </Button>
                    </Stack>
                  </TableCell>
                </TableRow>
              ))}
              {bills.filter(bill => bill.status !== 'paid').length === 0 && (
                <TableRow>
                  <TableCell colSpan={7} sx={{ textAlign: 'center', py: 4 }}>
                    <Typography color="text.secondary">
                      No outstanding bills
                    </Typography>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

      {/* Payment History */}
      <Paper>
        <Box sx={{ p: 2, borderBottom: 1, borderColor: 'divider' }}>
          <Typography variant="h6">Payment History</Typography>
        </Box>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Transaction ID</TableCell>
                <TableCell>Date</TableCell>
                <TableCell>Amount</TableCell>
                <TableCell>Payment Method</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {paymentHistory.map((payment) => (
                <TableRow key={payment._id || payment.id}>
                  <TableCell>{payment.transactionId}</TableCell>
                  <TableCell>
                    {payment.createdAt ? new Date(payment.createdAt).toLocaleDateString() : 'N/A'}
                  </TableCell>
                  <TableCell>{formatCurrency(payment.amount)}</TableCell>
                  <TableCell sx={{ display: 'flex', alignItems: 'center' }}>
                    {getPaymentMethodIcon(payment.paymentMethod)}
                    <Typography sx={{ ml: 1, textTransform: 'capitalize' }}>
                      {payment.paymentMethod?.replace('_', ' ')}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Chip 
                      label={payment.status} 
                      color={payment.status === 'completed' ? 'success' : 'warning'}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>
                    <Tooltip title="Download Receipt">
                      <IconButton size="small">
                        <DownloadIcon />
                      </IconButton>
                    </Tooltip>
                  </TableCell>
                </TableRow>
              ))}
              {paymentHistory.length === 0 && (
                <TableRow>
                  <TableCell colSpan={6} sx={{ textAlign: 'center', py: 4 }}>
                    <Typography color="text.secondary">
                      No payment history
                    </Typography>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

      {/* Payment Dialog */}
      <Dialog open={paymentDialog} onClose={() => setPaymentDialog(false)} maxWidth="md" fullWidth>
        <DialogTitle>Make Payment</DialogTitle>
        <DialogContent>
          {selectedBill && (
            <Box sx={{ mb: 3 }}>
              <Typography variant="subtitle1" gutterBottom>
                Bill Details
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Service: {selectedBill.description || selectedBill.service || 'Medical Service'}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Amount Due: {formatCurrency(selectedBill.amount)}
              </Typography>
              <Divider sx={{ my: 2 }} />
            </Box>
          )}

          <StripePaymentForm
            amount={selectedBill?.amount || 0}
            billId={selectedBill?._id}
            onSuccess={handlePayment}
            onError={(error) => setError(error)}
            onCancel={() => setPaymentDialog(false)}
          />

          {error && (
            <Alert severity="error" sx={{ mt: 2 }}>
              {error}
            </Alert>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setPaymentDialog(false)}>Cancel</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
