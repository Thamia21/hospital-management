import React, { useState } from 'react';
import {
  Box,
  Container,
  Paper,
  Typography,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
  Grid,
  Alert,
  Tabs,
  Tab,
  Card,
  CardContent,
  FormControl,
  InputLabel,
  Select
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Check as CheckIcon,
  Close as CloseIcon,
  CalendarToday as CalendarIcon,
  Person as PersonIcon,
  Schedule as ScheduleIcon
} from '@mui/icons-material';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { format } from 'date-fns';
import { leaveService } from '@/services/api';
import { useAuth } from '@/context/AuthContext';

const LEAVE_TYPES = [
  { value: 'ANNUAL', label: 'Annual Leave', color: 'primary' },
  { value: 'SICK', label: 'Sick Leave', color: 'warning' },
  { value: 'MATERNITY', label: 'Maternity Leave', color: 'secondary' },
  { value: 'EMERGENCY', label: 'Emergency Leave', color: 'error' },
  { value: 'CONFERENCE', label: 'Conference', color: 'info' },
  { value: 'TRAINING', label: 'Training', color: 'success' },
  { value: 'OTHER', label: 'Other', color: 'default' }
];

const STATUS_COLORS = {
  PENDING: 'warning',
  APPROVED: 'success',
  REJECTED: 'error',
  ACTIVE: 'info',
  COMPLETED: 'default'
};

const LeaveDialog = ({ open, onClose, leave, onSubmit, staff }) => {
  const [formData, setFormData] = useState({
    staffId: leave?.staffId?._id || '',
    staffType: leave?.staffType || 'DOCTOR',
    leaveType: leave?.leaveType || 'ANNUAL',
    startDate: leave?.startDate ? format(new Date(leave.startDate), 'yyyy-MM-dd') : '',
    endDate: leave?.endDate ? format(new Date(leave.endDate), 'yyyy-MM-dd') : '',
    reason: leave?.reason || '',
    notes: leave?.notes || '',
    emergencyContact: {
      name: leave?.emergencyContact?.name || '',
      phone: leave?.emergencyContact?.phone || '',
      relationship: leave?.emergencyContact?.relationship || ''
    }
  });

  const [errors, setErrors] = useState({});

  const handleChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: null }));
    }
  };

  const handleEmergencyContactChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      emergencyContact: {
        ...prev.emergencyContact,
        [field]: value
      }
    }));
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.staffId) newErrors.staffId = 'Staff member is required';
    if (!formData.startDate) newErrors.startDate = 'Start date is required';
    if (!formData.endDate) newErrors.endDate = 'End date is required';
    if (!formData.reason) newErrors.reason = 'Reason is required';
    
    if (formData.startDate && formData.endDate && new Date(formData.startDate) >= new Date(formData.endDate)) {
      newErrors.endDate = 'End date must be after start date';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    if (validateForm()) {
      onSubmit(formData);
    }
  };

  const filteredStaff = staff?.filter(s => s.role === formData.staffType) || [];

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <ScheduleIcon color="primary" />
          {leave ? 'Edit Leave Request' : 'Create Leave Request'}
        </Box>
      </DialogTitle>
      <DialogContent>
        <Grid container spacing={2} sx={{ mt: 1 }}>
          <Grid item xs={12} sm={6}>
            <FormControl fullWidth error={!!errors.staffType}>
              <InputLabel>Staff Type</InputLabel>
              <Select
                value={formData.staffType}
                onChange={(e) => {
                  handleChange('staffType', e.target.value);
                  handleChange('staffId', ''); // Reset staff selection
                }}
                label="Staff Type"
              >
                <MenuItem value="DOCTOR">Doctor</MenuItem>
                <MenuItem value="NURSE">Nurse</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          
          <Grid item xs={12} sm={6}>
            <FormControl fullWidth error={!!errors.staffId}>
              <InputLabel>Staff Member</InputLabel>
              <Select
                value={formData.staffId}
                onChange={(e) => handleChange('staffId', e.target.value)}
                label="Staff Member"
              >
                {filteredStaff.map((member) => (
                  <MenuItem key={member._id} value={member._id}>
                    {member.name} - {member.specialization}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={12} sm={6}>
            <FormControl fullWidth>
              <InputLabel>Leave Type</InputLabel>
              <Select
                value={formData.leaveType}
                onChange={(e) => handleChange('leaveType', e.target.value)}
                label="Leave Type"
              >
                {LEAVE_TYPES.map((type) => (
                  <MenuItem key={type.value} value={type.value}>
                    {type.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Start Date"
              type="date"
              value={formData.startDate}
              onChange={(e) => handleChange('startDate', e.target.value)}
              InputLabelProps={{ shrink: true }}
              error={!!errors.startDate}
              helperText={errors.startDate}
              inputProps={{
                min: new Date().toISOString().split('T')[0]
              }}
            />
          </Grid>

          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="End Date"
              type="date"
              value={formData.endDate}
              onChange={(e) => handleChange('endDate', e.target.value)}
              InputLabelProps={{ shrink: true }}
              error={!!errors.endDate}
              helperText={errors.endDate}
              inputProps={{
                min: formData.startDate || new Date().toISOString().split('T')[0]
              }}
            />
          </Grid>

          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Reason"
              multiline
              rows={3}
              value={formData.reason}
              onChange={(e) => handleChange('reason', e.target.value)}
              error={!!errors.reason}
              helperText={errors.reason}
            />
          </Grid>

          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Additional Notes"
              multiline
              rows={2}
              value={formData.notes}
              onChange={(e) => handleChange('notes', e.target.value)}
            />
          </Grid>

          <Grid item xs={12}>
            <Typography variant="subtitle2" gutterBottom>
              Emergency Contact (Optional)
            </Typography>
          </Grid>

          <Grid item xs={12} sm={4}>
            <TextField
              fullWidth
              label="Contact Name"
              value={formData.emergencyContact.name}
              onChange={(e) => handleEmergencyContactChange('name', e.target.value)}
            />
          </Grid>

          <Grid item xs={12} sm={4}>
            <TextField
              fullWidth
              label="Contact Phone"
              value={formData.emergencyContact.phone}
              onChange={(e) => handleEmergencyContactChange('phone', e.target.value)}
            />
          </Grid>

          <Grid item xs={12} sm={4}>
            <TextField
              fullWidth
              label="Relationship"
              value={formData.emergencyContact.relationship}
              onChange={(e) => handleEmergencyContactChange('relationship', e.target.value)}
            />
          </Grid>
        </Grid>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button onClick={handleSubmit} variant="contained">
          {leave ? 'Update' : 'Create'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default function LeaveManagement() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [tabValue, setTabValue] = useState(0);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedLeave, setSelectedLeave] = useState(null);
  const [statusFilter, setStatusFilter] = useState('');

  // Fetch leave requests
  const { data: leaves, isLoading } = useQuery({
    queryKey: ['leaves', statusFilter],
    queryFn: () => leaveService.getLeaves({ status: statusFilter }),
    enabled: user?.role === 'ADMIN'
  });

  // Fetch staff for dropdown
  const { data: staff } = useQuery({
    queryKey: ['staff'],
    queryFn: () => leaveService.getStaff(),
    enabled: user?.role === 'ADMIN'
  });

  // Create/Update leave mutation
  const createLeaveMutation = useMutation({
    mutationFn: (leaveData) => 
      selectedLeave 
        ? leaveService.updateLeave(selectedLeave._id, leaveData)
        : leaveService.createLeave(leaveData),
    onSuccess: () => {
      queryClient.invalidateQueries(['leaves']);
      setDialogOpen(false);
      setSelectedLeave(null);
    }
  });

  // Approve/Reject leave mutation
  const updateStatusMutation = useMutation({
    mutationFn: ({ leaveId, status }) => 
      leaveService.updateLeave(leaveId, { status }),
    onSuccess: () => {
      queryClient.invalidateQueries(['leaves']);
    }
  });

  // Delete leave mutation
  const deleteLeaveMutation = useMutation({
    mutationFn: (leaveId) => leaveService.deleteLeave(leaveId),
    onSuccess: () => {
      queryClient.invalidateQueries(['leaves']);
    }
  });

  const handleCreateLeave = () => {
    setSelectedLeave(null);
    setDialogOpen(true);
  };

  const handleEditLeave = (leave) => {
    setSelectedLeave(leave);
    setDialogOpen(true);
  };

  const handleSubmitLeave = (leaveData) => {
    createLeaveMutation.mutate(leaveData);
  };

  const handleApprove = (leaveId) => {
    updateStatusMutation.mutate({ leaveId, status: 'APPROVED' });
  };

  const handleReject = (leaveId) => {
    updateStatusMutation.mutate({ leaveId, status: 'REJECTED' });
  };

  const handleDelete = (leaveId) => {
    if (window.confirm('Are you sure you want to delete this leave request?')) {
      deleteLeaveMutation.mutate(leaveId);
    }
  };

  const getLeaveTypeInfo = (type) => {
    return LEAVE_TYPES.find(t => t.value === type) || LEAVE_TYPES[0];
  };

  const filteredLeaves = leaves?.filter(leave => {
    if (tabValue === 0) return leave.status === 'PENDING';
    if (tabValue === 1) return leave.status === 'APPROVED';
    if (tabValue === 2) return ['REJECTED', 'COMPLETED'].includes(leave.status);
    return true;
  }) || [];

  if (user?.role !== 'ADMIN') {
    return (
      <Container maxWidth="md" sx={{ py: 4 }}>
        <Alert severity="error">
          Access denied. This page is only available to administrators.
        </Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h4" component="h1">
          Leave Management
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={handleCreateLeave}
        >
          Create Leave Request
        </Button>
      </Box>

      <Paper sx={{ mb: 3 }}>
        <Tabs
          value={tabValue}
          onChange={(e, newValue) => setTabValue(newValue)}
          sx={{ borderBottom: 1, borderColor: 'divider' }}
        >
          <Tab label="Pending Requests" />
          <Tab label="Approved Leave" />
          <Tab label="Completed/Rejected" />
        </Tabs>

        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Staff Member</TableCell>
                <TableCell>Leave Type</TableCell>
                <TableCell>Duration</TableCell>
                <TableCell>Reason</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredLeaves.map((leave) => {
                const leaveType = getLeaveTypeInfo(leave.leaveType);
                return (
                  <TableRow key={leave._id}>
                    <TableCell>
                      <Box>
                        <Typography variant="body2" fontWeight="medium">
                          {leave.staffId?.name}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {leave.staffId?.specialization} • {leave.staffType}
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={leaveType.label}
                        color={leaveType.color}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">
                        {format(new Date(leave.startDate), 'MMM dd, yyyy')} - 
                        {format(new Date(leave.endDate), 'MMM dd, yyyy')}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" sx={{ maxWidth: 200 }}>
                        {leave.reason}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={leave.status}
                        color={STATUS_COLORS[leave.status]}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', gap: 1 }}>
                        {leave.status === 'PENDING' && (
                          <>
                            <IconButton
                              size="small"
                              color="success"
                              onClick={() => handleApprove(leave._id)}
                              title="Approve"
                            >
                              <CheckIcon />
                            </IconButton>
                            <IconButton
                              size="small"
                              color="error"
                              onClick={() => handleReject(leave._id)}
                              title="Reject"
                            >
                              <CloseIcon />
                            </IconButton>
                          </>
                        )}
                        <IconButton
                          size="small"
                          onClick={() => handleEditLeave(leave)}
                          title="Edit"
                        >
                          <EditIcon />
                        </IconButton>
                        <IconButton
                          size="small"
                          color="error"
                          onClick={() => handleDelete(leave._id)}
                          title="Delete"
                        >
                          <DeleteIcon />
                        </IconButton>
                      </Box>
                    </TableCell>
                  </TableRow>
                );
              })}
              {filteredLeaves.length === 0 && (
                <TableRow>
                  <TableCell colSpan={6} align="center" sx={{ py: 4 }}>
                    <Typography color="text.secondary">
                      No leave requests found
                    </Typography>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

      <LeaveDialog
        open={dialogOpen}
        onClose={() => {
          setDialogOpen(false);
          setSelectedLeave(null);
        }}
        leave={selectedLeave}
        onSubmit={handleSubmitLeave}
        staff={staff}
      />
    </Container>
  );
}
