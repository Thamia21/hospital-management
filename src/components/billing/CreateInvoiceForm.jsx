import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Grid,
  Typography,
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';

// Mock service list - replace with actual services from backend
const availableServices = [
  { id: 1, name: 'Consultation', basePrice: 250.00 },
  { id: 2, name: 'X-Ray', basePrice: 500.00 },
  { id: 3, name: 'Lab Test', basePrice: 300.00 },
  { id: 4, name: 'Emergency Room', basePrice: 1000.00 },
  { id: 5, name: 'Medication', basePrice: 100.00 },
  { id: 6, name: 'Surgery', basePrice: 2500.00 }
];

export default function CreateInvoiceForm({ open, onClose }) {
  const [patientDetails, setPatientDetails] = useState({
    name: '',
    id: '',
    email: '',
    phone: ''
  });

  const [services, setServices] = useState([]);
  const [selectedService, setSelectedService] = useState('');
  const [serviceQuantity, setServiceQuantity] = useState(1);

  const calculateTotal = () => {
    return services.reduce((total, service) => total + service.price * service.quantity, 0);
  };

  const handleAddService = () => {
    if (!selectedService) return;

    const service = availableServices.find(s => s.name === selectedService);
    const newService = {
      ...service,
      quantity: serviceQuantity,
      price: service.basePrice
    };

    setServices([...services, newService]);
    setSelectedService('');
    setServiceQuantity(1);
  };

  const handleRemoveService = (index) => {
    const updatedServices = [...services];
    updatedServices.splice(index, 1);
    setServices(updatedServices);
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    // Prepare invoice data
    const invoiceData = {
      patientDetails,
      services,
      total: calculateTotal(),
      date: new Date().toISOString()
    };

    console.log('Invoice Data:', invoiceData);
    onClose();
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>Create New Invoice</DialogTitle>
      <form onSubmit={handleSubmit}>
        <DialogContent>
          {/* Patient Details */}
          <Typography variant="h6" gutterBottom>Patient Information</Typography>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Patient Name"
                value={patientDetails.name}
                onChange={(e) => setPatientDetails(prev => ({ ...prev, name: e.target.value }))}
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Patient ID"
                value={patientDetails.id}
                onChange={(e) => setPatientDetails(prev => ({ ...prev, id: e.target.value }))}
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Email"
                type="email"
                value={patientDetails.email}
                onChange={(e) => setPatientDetails(prev => ({ ...prev, email: e.target.value }))}
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Phone Number"
                type="tel"
                value={patientDetails.phone}
                onChange={(e) => setPatientDetails(prev => ({ ...prev, phone: e.target.value }))}
                required
              />
            </Grid>
          </Grid>

          {/* Service Selection */}
          <Typography variant="h6" gutterBottom sx={{ mt: 3 }}>
            Services
          </Typography>
          <Grid container spacing={2} sx={{ mb: 2 }}>
            <Grid item xs={8}>
              <TextField
                fullWidth
                select
                label="Select Service"
                value={selectedService}
                onChange={(e) => setSelectedService(e.target.value)}
                SelectProps={{ native: true }}
              >
                <option value="">Select a service</option>
                {availableServices.map((service) => (
                  <option key={service.id} value={service.name}>
                    {service.name} - ${service.basePrice.toFixed(2)}
                  </option>
                ))}
              </TextField>
            </Grid>
            <Grid item xs={2}>
              <TextField
                fullWidth
                type="number"
                label="Quantity"
                value={serviceQuantity}
                onChange={(e) => setServiceQuantity(Number(e.target.value))}
                inputProps={{ min: 1 }}
              />
            </Grid>
            <Grid item xs={2}>
              <Button
                fullWidth
                variant="contained"
                startIcon={<AddIcon />}
                onClick={handleAddService}
                disabled={!selectedService}
              >
                Add
              </Button>
            </Grid>
          </Grid>

          {/* Selected Services Table */}
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Service</TableCell>
                  <TableCell>Price</TableCell>
                  <TableCell>Quantity</TableCell>
                  <TableCell>Total</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {services.map((service, index) => (
                  <TableRow key={index}>
                    <TableCell>{service.name}</TableCell>
                    <TableCell>${service.price.toFixed(2)}</TableCell>
                    <TableCell>{service.quantity}</TableCell>
                    <TableCell>
                      ${(service.price * service.quantity).toFixed(2)}
                    </TableCell>
                    <TableCell>
                      <IconButton 
                        size="small" 
                        color="error"
                        onClick={() => handleRemoveService(index)}
                      >
                        <DeleteIcon />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
                <TableRow>
                  <TableCell colSpan={3}>
                    <strong>Total</strong>
                  </TableCell>
                  <TableCell>
                    <strong>${calculateTotal().toFixed(2)}</strong>
                  </TableCell>
                  <TableCell />
                </TableRow>
              </TableBody>
            </Table>
          </TableContainer>
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose}>Cancel</Button>
          <Button 
            type="submit" 
            variant="contained" 
            color="primary"
            disabled={services.length === 0}
          >
            Create Invoice
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
}
