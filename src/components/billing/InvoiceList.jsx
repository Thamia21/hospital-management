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
  DialogActions
} from '@mui/material';
import ReceiptIcon from '@mui/icons-material/Receipt';
import PrintIcon from '@mui/icons-material/Print';
import PaymentIcon from '@mui/icons-material/Payment';

// Mock data - replace with API calls
const invoices = [
  {
    id: 'INV-2023-001',
    patientName: 'John Doe',
    patientId: 'P001',
    date: '2023-12-01',
    totalAmount: 1250.00,
    status: 'Paid',
    services: [
      { name: 'Consultation', price: 250.00 },
      { name: 'X-Ray', price: 500.00 },
      { name: 'Medication', price: 500.00 }
    ]
  },
  {
    id: 'INV-2023-002',
    patientName: 'Jane Smith',
    patientId: 'P002',
    date: '2023-12-05',
    totalAmount: 1750.50,
    status: 'Pending',
    services: [
      { name: 'Emergency Room', price: 1000.00 },
      { name: 'Lab Tests', price: 750.50 }
    ]
  },
  {
    id: 'INV-2023-003',
    patientName: 'Robert Johnson',
    patientId: 'P003',
    date: '2023-12-07',
    totalAmount: 850.75,
    status: 'Overdue',
    services: [
      { name: 'Specialist Consultation', price: 350.75 },
      { name: 'Prescription', price: 500.00 }
    ]
  }
];

export default function InvoiceList({ searchTerm, pendingInvoices, paidInvoices }) {
  const [selectedInvoice, setSelectedInvoice] = useState(null);

  const getStatusColor = (status) => {
    switch (status.toLowerCase()) {
      case 'paid':
        return 'success';
      case 'pending':
        return 'warning';
      case 'overdue':
        return 'error';
      default:
        return 'default';
    }
  };

  const filteredInvoices = invoices.filter(invoice =>
    invoice.patientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    invoice.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
    invoice.patientId.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleViewDetails = (invoice) => {
    setSelectedInvoice(invoice);
  };

  const handleCloseDetails = () => {
    setSelectedInvoice(null);
  };

  return (
    <>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
        <Box>
          <Chip 
            label={`Pending: ${pendingInvoices}`} 
            color="warning" 
            variant="outlined" 
            sx={{ mr: 1 }}
          />
          <Chip 
            label={`Paid: ${paidInvoices}`} 
            color="success" 
            variant="outlined" 
          />
        </Box>
      </Box>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Invoice Number</TableCell>
              <TableCell>Patient Details</TableCell>
              <TableCell>Date</TableCell>
              <TableCell>Total Amount</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredInvoices.map((invoice) => (
              <TableRow key={invoice.id}>
                <TableCell>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <ReceiptIcon color="action" />
                    <Typography variant="subtitle2">{invoice.id}</Typography>
                  </Box>
                </TableCell>
                <TableCell>
                  <Typography variant="subtitle2">{invoice.patientName}</Typography>
                  <Typography variant="body2" color="textSecondary">
                    Patient ID: {invoice.patientId}
                  </Typography>
                </TableCell>
                <TableCell>{invoice.date}</TableCell>
                <TableCell>
                  <Typography variant="subtitle2">
                    ${invoice.totalAmount.toFixed(2)}
                  </Typography>
                </TableCell>
                <TableCell>
                  <Chip
                    label={invoice.status}
                    color={getStatusColor(invoice.status)}
                    size="small"
                  />
                </TableCell>
                <TableCell>
                  <Button
                    startIcon={<PrintIcon />}
                    size="small"
                    onClick={() => handleViewDetails(invoice)}
                  >
                    Details
                  </Button>
                  <Button
                    startIcon={<PaymentIcon />}
                    size="small"
                    color="primary"
                    disabled={invoice.status === 'Paid'}
                  >
                    Pay
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Invoice Details Dialog */}
      {selectedInvoice && (
        <Dialog open={!!selectedInvoice} onClose={handleCloseDetails} maxWidth="md" fullWidth>
          <DialogTitle>Invoice Details: {selectedInvoice.id}</DialogTitle>
          <DialogContent>
            <Box sx={{ mb: 2 }}>
              <Typography variant="h6">Patient Information</Typography>
              <Typography>Name: {selectedInvoice.patientName}</Typography>
              <Typography>Patient ID: {selectedInvoice.patientId}</Typography>
            </Box>

            <Box sx={{ mb: 2 }}>
              <Typography variant="h6">Services</Typography>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Service</TableCell>
                    <TableCell align="right">Price</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {selectedInvoice.services.map((service, index) => (
                    <TableRow key={index}>
                      <TableCell>{service.name}</TableCell>
                      <TableCell align="right">${service.price.toFixed(2)}</TableCell>
                    </TableRow>
                  ))}
                  <TableRow>
                    <TableCell><strong>Total</strong></TableCell>
                    <TableCell align="right">
                      <strong>${selectedInvoice.totalAmount.toFixed(2)}</strong>
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseDetails}>Close</Button>
            <Button 
              variant="contained" 
              startIcon={<PrintIcon />}
              onClick={() => window.print()}
            >
              Print Invoice
            </Button>
          </DialogActions>
        </Dialog>
      )}
    </>
  );
}
