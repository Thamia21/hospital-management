import React, { useEffect, useState } from 'react';
import {
  Box, Container, Paper, Typography, Button, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, IconButton, CircularProgress, Dialog, DialogTitle, DialogContent, DialogActions, TextField, MenuItem, Alert, Switch, TablePagination, InputAdornment, FormControl, InputLabel, Select, Chip, OutlinedInput
} from '@mui/material';
import { Edit, Delete, Search as SearchIcon, Block, CheckCircle, Download as DownloadIcon, PictureAsPdf as PdfIcon } from '@mui/icons-material';
import { Bar } from 'react-chartjs-2';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import 'chart.js/auto';
import Swal from 'sweetalert2';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';

const roles = [
  { value: 'DOCTOR', label: 'Doctor' },
  { value: 'NURSE', label: 'Nurse' }
];

const StaffManagement = () => {
  const { user, token } = useAuth();
  const [staff, setStaff] = useState([]);
  const [facilities, setFacilities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editStaff, setEditStaff] = useState(null);
  const [editLoading, setEditLoading] = useState(false);
  const [adminFacilityId, setAdminFacilityId] = useState(null);

  // Search, filters, and pagination
  const [search, setSearch] = useState('');
  const [filterRole, setFilterRole] = useState('');
  const [filterDepartment, setFilterDepartment] = useState('');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [selected, setSelected] = useState([]); // bulk selection

  // Get unique departments for filter dropdown
  const departments = Array.from(new Set(staff.map(s => s.department).filter(Boolean)));


  // Only allow admin
  if (!user || user.role !== 'ADMIN') {
    return <Alert severity="error">Unauthorized: Only admins can manage staff.</Alert>;
  }

  const fetchAdminData = async () => {
    try {
      // Fetch fresh admin data from backend (includes latest facilityId)
      const res = await axios.get(`/api/users/${user?._id || user?.id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      console.log('👤 Admin data from backend:', res.data);
      setAdminFacilityId(res.data.facilityId);
      return res.data.facilityId;
    } catch (err) {
      console.error('❌ Error fetching admin data:', err);
      return null;
    }
  };

  const fetchStaff = async () => {
    setLoading(true);
    try {
      // Get fresh admin facility ID from backend
      const facilityId = await fetchAdminData();
      
      console.log('🔍 Fetching staff for admin facility:', facilityId);
      const res = await axios.get('/api/users?role=staff', {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      // Filter staff by role (DOCTOR or NURSE)
      let staffList = res.data.filter(u => u.role === 'DOCTOR' || u.role === 'NURSE');
      
      // Filter by admin's facility if admin has a facility assigned
      if (facilityId) {
        staffList = staffList.filter(s => {
          // Handle both populated and non-populated facilityId
          const staffFacilityId = s.facilityId?._id || s.facilityId;
          return staffFacilityId && staffFacilityId.toString() === facilityId.toString();
        });
        console.log(`✅ Filtered to ${staffList.length} staff in admin's facility`);
      } else {
        console.log('⚠️ Admin has no facility - showing all staff');
      }
      
      setStaff(staffList);
    } catch (err) {
      console.error('❌ Error fetching staff:', err);
      setError('Failed to fetch staff.');
    } finally {
      setLoading(false);
    }
  };

  const fetchFacilities = async () => {
    try {
      const res = await axios.get('/api/facilities');
      setFacilities(res.data);
    } catch (err) {
      console.error('Failed to fetch facilities:', err);
    }
  };

  useEffect(() => {
    fetchStaff();
    fetchFacilities();
    // eslint-disable-next-line
  }, []);

  const handleEdit = (staffMember) => {
    setEditStaff(staffMember);
    setEditDialogOpen(true);
  };

  const handleEditChange = (e) => {
    const { name, value } = e.target;
    setEditStaff(prev => ({ ...prev, [name]: value }));
  };

  const handleFacilityChange = (event) => {
    const { value } = event.target;
    setEditStaff(prev => ({
      ...prev,
      facilityIds: typeof value === 'string' ? value.split(',') : value
    }));
  };

  const handleEditSave = async () => {
    setEditLoading(true);
    try {
      await axios.put(`/api/users/${editStaff._id}`, editStaff, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setEditDialogOpen(false);
      fetchStaff();
      Swal.fire('Updated!', 'Staff details updated.', 'success');
    } catch (err) {
      Swal.fire('Error', 'Failed to update staff.', 'error');
    } finally {
      setEditLoading(false);
    }
  };

  const handleDelete = async (staffId) => {
    const confirm = await Swal.fire({
      title: 'Are you sure?',
      text: 'This will delete the staff account.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes, delete it!'
    });
    if (!confirm.isConfirmed) return;
    try {
      await axios.delete(`/api/users/${staffId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchStaff();
      Swal.fire('Deleted!', 'Staff account deleted.', 'success');
    } catch (err) {
      Swal.fire('Error', 'Failed to delete staff.', 'error');
    }
  };

  // Enable/disable staff
  const handleToggleActive = async (staffMember) => {
    try {
      await axios.put(`/api/users/${staffMember._id}`, { isActive: !staffMember.isActive }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchStaff();
      Swal.fire('Success', `Staff account ${staffMember.isActive ? 'disabled' : 'enabled'}.`, 'success');
    } catch (err) {
      Swal.fire('Error', 'Failed to update staff status.', 'error');
    }
  };

  // Filtered and paginated staff
  const filteredStaff = staff.filter(s => {
    const matchesSearch =
      s.name?.toLowerCase().includes(search.toLowerCase()) ||
      s.department?.toLowerCase().includes(search.toLowerCase()) ||
      s.role?.toLowerCase().includes(search.toLowerCase());
    const matchesRole = filterRole ? s.role === filterRole : true;
    const matchesDept = filterDepartment ? s.department === filterDepartment : true;
    return matchesSearch && matchesRole && matchesDept;
  });
  const paginatedStaff = filteredStaff.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

  // Analytics/statistics
  const totalStaff = staff.length;
  const totalDoctors = staff.filter(s => s.role === 'DOCTOR').length;
  const totalNurses = staff.filter(s => s.role === 'NURSE').length;
  const totalActive = staff.filter(s => s.isActive !== false).length;
  const totalDisabled = staff.filter(s => s.isActive === false).length;

  // Staff by department for bar chart
  const departmentCounts = departments.map(dept => staff.filter(s => s.department === dept).length);
  const barChartData = {
    labels: departments,
    datasets: [
      {
        label: 'Staff by Department',
        data: departmentCounts,
        backgroundColor: '#1976d2',
      },
    ],
  };

  // Recent activity (last 5 changes, simulated from staff array by updatedAt desc)
  const recentActivity = [...staff].sort((a, b) => new Date(b.updatedAt || b.createdAt) - new Date(a.updatedAt || a.createdAt)).slice(0, 5);

  // CSV export
  const handleExportCSV = () => {
    const headers = ['Name','Email','Role','Department','Specialization','License Number','Status'];
    const rows = filteredStaff.map(s => [s.name, s.email, s.role, s.department, s.specialization, s.licenseNumber, s.isActive !== false ? 'Active' : 'Disabled']);
    let csvContent = [headers, ...rows].map(e => e.map(x => '"'+(x||'')+'"').join(",")).join("\n");
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'staff.csv';
    a.click();
    window.URL.revokeObjectURL(url);
  };

  // PDF export
  const handleExportPDF = () => {
    const doc = new jsPDF();
    const headers = [['Name','Email','Role','Department','Specialization','License Number','Status']];
    const rows = filteredStaff.map(s => [s.name, s.email, s.role, s.department, s.specialization, s.licenseNumber, s.isActive !== false ? 'Active' : 'Disabled']);
    autoTable(doc, {
      head: headers,
      body: rows,
      startY: 20,
      styles: { fontSize: 9 },
      headStyles: { fillColor: [25, 118, 210] }
    });
    doc.text('Staff List', 14, 15);
    doc.save('staff.pdf');
  };


  // Bulk actions
  const handleSelectAll = (e) => {
    if (e.target.checked) {
      setSelected(paginatedStaff.map(s => s._id));
    } else {
      setSelected([]);
    }
  };
  const handleSelect = (id) => {
    setSelected(prev => prev.includes(id) ? prev.filter(sid => sid !== id) : [...prev, id]);
  };
  const handleBulkEnable = async () => {
    await Promise.all(selected.map(id => axios.put(`/api/users/${id}`, { isActive: true }, { headers: { Authorization: `Bearer ${token}` } })));
    setSelected([]);
    fetchStaff();
    Swal.fire('Success', 'Selected staff enabled.', 'success');
  };
  const handleBulkDisable = async () => {
    await Promise.all(selected.map(id => axios.put(`/api/users/${id}`, { isActive: false }, { headers: { Authorization: `Bearer ${token}` } })));
    setSelected([]);
    fetchStaff();
    Swal.fire('Success', 'Selected staff disabled.', 'success');
  };
  const handleBulkDelete = async () => {
    const confirm = await Swal.fire({
      title: 'Are you sure?',
      text: 'This will delete all selected staff accounts.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes, delete them!'
    });
    if (!confirm.isConfirmed) return;
    await Promise.all(selected.map(id => axios.delete(`/api/users/${id}`, { headers: { Authorization: `Bearer ${token}` } })));
    setSelected([]);
    fetchStaff();
    Swal.fire('Deleted!', 'Selected staff accounts deleted.', 'success');
  };


  return (
    <Box sx={{ minHeight: '100vh', bgcolor: '#f7fafd', py: 6, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <Container maxWidth="md">
        <Paper elevation={6} sx={{ borderRadius: 4, p: { xs: 2, sm: 6 }, boxShadow: 6 }}>
          <Typography variant="h5" sx={{ mb: 2, fontWeight: 600 }}>Staff Management</Typography>
          
          {/* Facility Info Banner */}
          {adminFacilityId && (
            <Alert severity="info" sx={{ mb: 3 }}>
              <Typography variant="body2">
                <strong>Facility-Based Management:</strong> You are managing staff for your assigned facility only.
                {staff.length === 0 && ' No staff members found in your facility.'}
              </Typography>
            </Alert>
          )}
          
          {!adminFacilityId && !loading && (
            <Alert severity="warning" sx={{ mb: 3 }}>
              <Typography variant="body2">
                <strong>No Facility Assigned:</strong> You are viewing all staff across all facilities.
              </Typography>
            </Alert>
          )}
          {/* Analytics/statistics */}
          <Box sx={{ mb: 2, display: 'flex', gap: 3, flexWrap: 'wrap' }}>
            <Paper sx={{ p: 2, minWidth: 120, bgcolor: '#e3f2fd' }}>
              <Typography variant="subtitle2">Total Staff</Typography>
              <Typography variant="h6">{totalStaff}</Typography>
            </Paper>
            <Paper sx={{ p: 2, minWidth: 120, bgcolor: '#e8f5e9' }}>
              <Typography variant="subtitle2">Doctors</Typography>
              <Typography variant="h6">{totalDoctors}</Typography>
            </Paper>
            <Paper sx={{ p: 2, minWidth: 120, bgcolor: '#fffde7' }}>
              <Typography variant="subtitle2">Nurses</Typography>
              <Typography variant="h6">{totalNurses}</Typography>
            </Paper>
            <Paper sx={{ p: 2, minWidth: 120, bgcolor: '#f3e5f5' }}>
              <Typography variant="subtitle2">Active</Typography>
              <Typography variant="h6">{totalActive}</Typography>
            </Paper>
            <Paper sx={{ p: 2, minWidth: 120, bgcolor: '#ffebee' }}>
              <Typography variant="subtitle2">Disabled</Typography>
              <Typography variant="h6">{totalDisabled}</Typography>
            </Paper>
          </Box>
          {/* Staff by department bar chart */}
          {departments.length > 0 && (
            <Box sx={{ mb: 2, maxWidth: 600 }}>
              <Paper sx={{ p: 2 }}>
                <Typography variant="subtitle2" sx={{ mb: 1 }}>Staff by Department</Typography>
                <Bar data={barChartData} options={{ plugins: { legend: { display: false } } }} height={120} />
              </Paper>
            </Box>
          )}
          {/* Recent activity */}
          <Box sx={{ mb: 2, maxWidth: 600 }}>
            <Paper sx={{ p: 2 }}>
              <Typography variant="subtitle2" sx={{ mb: 1 }}>Recent Staff Activity</Typography>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Name</TableCell>
                    <TableCell>Role</TableCell>
                    <TableCell>Department</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell>Last Update</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {recentActivity.map((s) => (
                    <TableRow key={s._id}>
                      <TableCell>{s.name}</TableCell>
                      <TableCell>{s.role}</TableCell>
                      <TableCell>{s.department}</TableCell>
                      <TableCell>{s.isActive !== false ? 'Active' : 'Disabled'}</TableCell>
                      <TableCell>{new Date(s.updatedAt || s.createdAt).toLocaleString()}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Paper>
          </Box>

          {/* Filters and search */}
          <Box sx={{ mb: 2, display: 'flex', gap: 2, flexWrap: 'wrap', alignItems: 'center' }}>
            <TextField
              select
              label="Role"
              value={filterRole}
              onChange={e => setFilterRole(e.target.value)}
              sx={{ width: 150 }}
              size="small"
            >
              <MenuItem value="">All Roles</MenuItem>
              <MenuItem value="DOCTOR">Doctor</MenuItem>
              <MenuItem value="NURSE">Nurse</MenuItem>
            </TextField>
            <TextField
              select
              label="Department"
              value={filterDepartment}
              onChange={e => setFilterDepartment(e.target.value)}
              sx={{ width: 180 }}
              size="small"
            >
              <MenuItem value="">All Departments</MenuItem>
              {departments.map(dept => (
                <MenuItem key={dept} value={dept}>{dept}</MenuItem>
              ))}
            </TextField>
            <TextField
              placeholder="Search staff by name..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon />
                  </InputAdornment>
                )
              }}
              sx={{ width: 300 }}
              size="small"
            />
          </Box>
          {/* Export CSV and Bulk actions */}
          <Box sx={{ mb: 2, display: 'flex', gap: 2, flexWrap: 'wrap', alignItems: 'center' }}>
            <Button variant="outlined" color="primary" startIcon={<DownloadIcon />} onClick={handleExportCSV}>
              Export CSV
            </Button>
            <Button variant="outlined" color="error" startIcon={<PdfIcon />} onClick={handleExportPDF}>
              Export PDF
            </Button>
            {selected.length > 0 && (
              <>
                <Button variant="contained" color="success" onClick={handleBulkEnable}>Enable Selected</Button>
                <Button variant="contained" color="warning" onClick={handleBulkDisable}>Disable Selected</Button>
                <Button variant="contained" color="error" onClick={handleBulkDelete}>Delete Selected</Button>
                <Typography sx={{ ml: 2 }}>{selected.length} selected</Typography>
              </>
            )}
          </Box>

          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
              <CircularProgress />
            </Box>
          ) : error ? (
            <Alert severity="error">{error}</Alert>
          ) : (
            <>
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell padding="checkbox">
                        <input
                          type="checkbox"
                          checked={selected.length === paginatedStaff.length && paginatedStaff.length > 0}
                          onChange={handleSelectAll}
                          style={{ cursor: 'pointer', width: 18, height: 18 }}
                        />
                      </TableCell>
                      <TableCell>Name</TableCell>
                      <TableCell>Email</TableCell>
                      <TableCell>Role</TableCell>
                      <TableCell>Department</TableCell>
                      <TableCell>Specialization</TableCell>
                      <TableCell>Facilities</TableCell>
                      <TableCell>License #</TableCell>
                      <TableCell>Status</TableCell>
                      <TableCell>Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {paginatedStaff.map((s) => (
                      <TableRow key={s._id} selected={selected.includes(s._id)}>
                        <TableCell padding="checkbox">
                          <input
                            type="checkbox"
                            checked={selected.includes(s._id)}
                            onChange={() => handleSelect(s._id)}
                            style={{ cursor: 'pointer', width: 18, height: 18 }}
                          />
                        </TableCell>
                        <TableCell>{s.name}</TableCell>
                        <TableCell>{s.email}</TableCell>
                        <TableCell>{s.role}</TableCell>
                        <TableCell>{s.department}</TableCell>
                        <TableCell>{s.specialization}</TableCell>
                        <TableCell>
                          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                            {s.facilityNames && s.facilityNames.length > 0 ? (
                              s.facilityNames.map((name, idx) => (
                                <Chip key={idx} label={name} size="small" color="primary" variant="outlined" />
                              ))
                            ) : (
                              <Typography variant="caption" color="text.secondary">No facilities</Typography>
                            )}
                          </Box>
                        </TableCell>
                        <TableCell>{s.licenseNumber}</TableCell>
                        <TableCell>
                          <Switch
                            checked={s.isActive !== false}
                            onChange={() => handleToggleActive(s)}
                            color={s.isActive !== false ? 'success' : 'default'}
                            icon={<Block />}
                            checkedIcon={<CheckCircle />}
                          />
                          <Typography variant="caption" color={s.isActive !== false ? 'success.main' : 'error.main'}>
                            {s.isActive !== false ? 'Active' : 'Disabled'}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <IconButton color="primary" onClick={() => handleEdit(s)}><Edit /></IconButton>
                          <IconButton color="error" onClick={() => handleDelete(s._id)}><Delete /></IconButton>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
              {/* Pagination */}
              <TablePagination
                component="div"
                count={filteredStaff.length}
                page={page}
                onPageChange={(e, newPage) => setPage(newPage)}
                rowsPerPage={rowsPerPage}
                onRowsPerPageChange={e => { setRowsPerPage(parseInt(e.target.value, 10)); setPage(0); }}
                rowsPerPageOptions={[5, 10, 25, 50]}
              />
            </>
          )}
        </Paper>
        {/* Edit Dialog */}
        <Dialog open={editDialogOpen} onClose={() => setEditDialogOpen(false)}>
          <DialogTitle>Edit Staff</DialogTitle>
          <DialogContent>
            <TextField label="Name" name="name" value={editStaff?.name || ''} onChange={handleEditChange} fullWidth sx={{ mb: 2 }} />
            <TextField label="Email" name="email" value={editStaff?.email || ''} onChange={handleEditChange} fullWidth sx={{ mb: 2 }} />
            <TextField label="Role" name="role" value={editStaff?.role || ''} onChange={handleEditChange} select fullWidth sx={{ mb: 2 }}>
              {roles.map(option => <MenuItem key={option.value} value={option.value}>{option.label}</MenuItem>)}
            </TextField>
            <TextField label="Department" name="department" value={editStaff?.department || ''} onChange={handleEditChange} fullWidth sx={{ mb: 2 }} />
            <TextField label="Specialization" name="specialization" value={editStaff?.specialization || ''} onChange={handleEditChange} fullWidth sx={{ mb: 2 }} />
            <TextField label="License Number" name="licenseNumber" value={editStaff?.licenseNumber || ''} onChange={handleEditChange} fullWidth sx={{ mb: 2 }} />
            
            <FormControl fullWidth sx={{ mb: 2 }}>
              <InputLabel id="facility-select-label">Facilities</InputLabel>
              <Select
                labelId="facility-select-label"
                id="facility-select"
                multiple
                value={editStaff?.facilityIds || []}
                onChange={handleFacilityChange}
                input={<OutlinedInput label="Facilities" />}
                renderValue={(selected) => (
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                    {selected.map((value) => {
                      const facility = facilities.find(f => f._id === value);
                      return (
                        <Chip key={value} label={facility?.name || value} size="small" />
                      );
                    })}
                  </Box>
                )}
              >
                {facilities.map((facility) => (
                  <MenuItem key={facility._id} value={facility._id}>
                    {facility.name} - {facility.province}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setEditDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleEditSave} disabled={editLoading} variant="contained" color="primary">
              {editLoading ? <CircularProgress size={20} /> : 'Save'}
            </Button>
          </DialogActions>
        </Dialog>
      </Container>
    </Box>
  );
};

export default StaffManagement;
