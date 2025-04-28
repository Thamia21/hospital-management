import React, { useState } from 'react';
import {
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
  Chip,
  Button,
  Box,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Grid
} from '@mui/material';
import PaymentIcon from '@mui/icons-material/Payment';
import ReceiptIcon from '@mui/icons-material/Receipt';
import CreditCardIcon from '@mui/icons-material/CreditCard';

// Mock data - replace with API calls
const payments = [
  {
    id: 'PAY-2023-001',
    invoiceId: 'INV-2023-001',
    patientName: 'John Doe',
    amount: 1250.00,
    date: '2023-12-01',
    method: 'Credit Card',
    status: 'Completed'
  },
  {
    id: 'PAY-2023-002',
    invoiceId: 'INV-2023-002',
    patientName: 'Jane Smith',
    amount: 1750.50,
    date: '2023-12-05',
    method: 'Bank Transfer',
    status: 'Pending'
  },
  {
    id: 'PAY-2023-003',
    invoiceId: 'INV-2023-003',
    patientName: 'Robert Johnson',
    amount: 850.75,
    date: '2023-12-07',
    method: 'Cash',
    status: 'Failed'
  }
];

export default function PaymentList({ searchTerm }) {
  const [selectedPayment, setSelectedPayment] = useState(null);

  const getStatusColor = (status) => {
    switch (status.toLowerCase()) {
      case 'completed':
        return 'success';
      case 'pending':
        return 'warning';
      case 'failed':
        return 'error';
      default:
        return 'default';
    }
  };

  const getPaymentMethodIcon = (method) => {
    switch (method.toLowerCase()) {
      case 'credit card':
        return <CreditCardIcon color="action" />;
      case 'bank transfer':
        return <PaymentIcon color="action" />;
      case 'cash':
        return <ReceiptIcon color="action" />;
      default:
        return null;
    }
  };

  const filteredPayments = payments.filter(payment =>
    payment.patientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    payment.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
    payment.invoiceId.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleViewDetails = (payment) => {
    setSelectedPayment(payment);
  };

  const handleCloseDetails = () => {
    setSelectedPayment(null);
  };

  return (
    <>
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Payment ID</TableCell>
              <TableCell>Invoice</TableCell>
              <TableCell>Patient</TableCell>
              <TableCell>Amount</TableCell>
              <TableCell>Date</TableCell>
              <TableCell>Method</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredPayments.map((payment) => (
              <TableRow key={payment.id}>
                <TableCell>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <PaymentIcon color="action" />
                    <Typography variant="subtitle2">{payment.id}</Typography>
                  </Box>
                </TableCell>
                <TableCell>
                  <Typography variant="body2">{payment.invoiceId}</Typography>
                </TableCell>
                <TableCell>{payment.patientName}</TableCell>
                <TableCell>
                  <Typography variant="subtitle2">
                    ${payment.amount.toFixed(2)}
                  </Typography>
                </TableCell>
                <TableCell>{payment.date}</TableCell>
                <TableCell>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    {getPaymentMethodIcon(payment.method)}
                    <Typography variant="body2">{payment.method}</Typography>
                  </Box>
                </TableCell>
                <TableCell>
                  <Chip
                    label={payment.status}
                    color={getStatusColor(payment.status)}
                    size="small"
                  />
                </TableCell>
                <TableCell>
                  <Button
                    size="small"
                    onClick={() => handleViewDetails(payment)}
                  >
                    Details
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Payment Details Dialog */}
      {selectedPayment && (
        <Dialog open={!!selectedPayment} onClose={handleCloseDetails} maxWidth="md" fullWidth>
          <DialogTitle>Payment Details: {selectedPayment.id}</DialogTitle>
          <DialogContent>
            <Grid container spacing={2}>
              <Grid item xs={12} md={6}>
                <Typography variant="h6">Payment Information</Typography>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                  <Typography>
                    <strong>Payment ID:</strong> {selectedPayment.id}
                  </Typography>
                  <Typography>
                    <strong>Invoice ID:</strong> {selectedPayment.invoiceId}
                  </Typography>
                  <Typography>
                    <strong>Amount:</strong> ${selectedPayment.amount.toFixed(2)}
                  </Typography>
                  <Typography>
                    <strong>Date:</strong> {selectedPayment.date}
                  </Typography>
                </Box>
              </Grid>
              <Grid item xs={12} md={6}>
                <Typography variant="h6">Patient Details</Typography>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                  <Typography>
                    <strong>Name:</strong> {selectedPayment.patientName}
                  </Typography>
                  <Typography>
                    <strong>Payment Method:</strong> {selectedPayment.method}
                  </Typography>
                  <Typography>
                    <strong>Status:</strong> 
                    <Chip
                      label={selectedPayment.status}
                      color={getStatusColor(selectedPayment.status)}
                      size="small"
                      sx={{ ml: 1 }}
                    />
                  </Typography>
                </Box>
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseDetails}>Close</Button>
            <Button 
              variant="contained" 
              startIcon={<ReceiptIcon />}
              onClick={() => window.print()}
            >
              Print Receipt
            </Button>
          </DialogActions>
        </Dialog>
      )}
    </>
  );
}
