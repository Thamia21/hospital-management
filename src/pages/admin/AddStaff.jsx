import React, { useState, useEffect } from 'react';
import { facilityApi } from '../../services/facilityApi';
import {
  Box, Container, Paper, Typography, TextField, Button, MenuItem, Grid, CircularProgress, Alert, FormControl, InputLabel, Select, Chip, ListSubheader, Autocomplete, Stack
} from '@mui/material';
import { Business as HospitalIcon, LocalHospital as ClinicIcon, LocationOn as LocationIcon } from '@mui/icons-material';
import Swal from 'sweetalert2';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';

// Comprehensive medical departments and specializations for South Africa
const medicalDepartments = [
  // 👨‍⚕️ General & Primary Care
  'General Medicine',
  'Family Medicine',
  'Internal Medicine',
  'Outpatient / OPD',
  'Emergency Department',

  // ❤️ Medical Specialties
  'Cardiology',
  'Endocrinology',
  'Gastroenterology',
  'Nephrology',
  'Pulmonology',
  'Rheumatology',
  'Infectious Diseases',
  'Oncology',
  'Haematology',
  'Neurology',
  'Dermatology',

  // 🧠 Surgical Specialties
  'General Surgery',
  'Orthopaedic Surgery',
  'Cardiothoracic Surgery',
  'Neurosurgery',
  'Plastic & Reconstructive Surgery',
  'Urology',
  'Vascular Surgery',
  'ENT (Otolaryngology)',
  'Ophthalmology',

  // 👶 Women, Children & Reproductive Health
  'Obstetrics & Gynaecology (OB/GYN)',
  'Paediatrics',
  'Neonatology',
  'Fertility / Reproductive Medicine',
  'Midwifery',

  // 🧍‍♂️ Mental Health & Behavioral Sciences
  'Psychiatry',
  'Psychology',
  'Substance Abuse & Rehabilitation',

  // 🦷 Dental & Oral Health
  'Dentistry',
  'Oral & Maxillofacial Surgery',
  'Orthodontics',
  'Periodontology',
  'Prosthodontics',

  // 🧫 Diagnostics & Support Services
  'Pathology',
  'Radiology',
  'Laboratory Services',
  'Nuclear Medicine',
  'Pharmacy',
  'Physiotherapy',
  'Occupational Therapy',
  'Dietetics & Nutrition',
  'Speech & Hearing Therapy',
  'Biomedical Engineering',

  // 💉 Public Health & Administrative
  'Public Health',
  'Epidemiology',
  'Health Information Systems',
  'Hospital Administration',
  'Nursing Services'
];

const doctorSpecializations = [
  // 👨‍⚕️ General & Primary Care
  'General Practitioner (GP)',
  'Family Doctor',
  'Internist',
  'Emergency Medicine Specialist',
  'Casualty Doctor',

  // ❤️ Medical Specialties
  'Cardiologist',
  'Endocrinologist',
  'Gastroenterologist',
  'Nephrologist',
  'Pulmonologist',
  'Rheumatologist',
  'Infectious Disease Specialist',
  'Oncologist',
  'Haematologist',
  'Neurologist',
  'Dermatologist',

  // 🧠 Surgical Specialties
  'General Surgeon',
  'Orthopaedic Surgeon',
  'Cardiothoracic Surgeon',
  'Neurosurgeon',
  'Plastic Surgeon',
  'Urologist',
  'Vascular Surgeon',
  'ENT Specialist',
  'Ophthalmologist',

  // 👶 Women, Children & Reproductive Health
  'Gynaecologist',
  'Obstetrician',
  'Paediatrician',
  'Neonatologist',
  'Fertility Specialist',
  'Midwife',
  'Nurse Practitioner',

  // 🧍‍♂️ Mental Health & Behavioral Sciences
  'Psychiatrist',
  'Clinical Psychologist',
  'Counsellor',
  'Addiction Specialist',

  // 🦷 Dental & Oral Health
  'Dentist',
  'Oral Surgeon',
  'Orthodontist',
  'Gum Specialist',
  'Prosthodontist',

  // 🧫 Diagnostics & Support Services
  'Pathologist',
  'Radiologist',
  'Lab Technologist',
  'Nuclear Medicine Specialist',
  'Pharmacist',
  'Physiotherapist',
  'Occupational Therapist',
  'Dietitian',
  'Nutritionist',
  'Speech Therapist',
  'Audiologist',
  'Biomedical Engineer',

  // 💉 Public Health & Administrative
  'Public Health Physician',
  'Epidemiologist',
  'Health Informatics Officer',
  'Medical Superintendent',
  'Hospital Manager',
  'Chief Nursing Officer',
  'Nurse Supervisor'
];

// Create mapping between departments and their related specializations
const departmentSpecializationMap = {
  // 👨‍⚕️ General & Primary Care
  'General Medicine': ['General Practitioner (GP)', 'Family Doctor', 'Internist'],
  'Family Medicine': ['Family Doctor', 'General Practitioner (GP)'],
  'Internal Medicine': ['Internist', 'General Practitioner (GP)'],
  'Outpatient / OPD': ['General Practitioner (GP)', 'Family Doctor'],
  'Emergency Department': ['Emergency Medicine Specialist', 'Casualty Doctor'],

  // ❤️ Medical Specialties
  'Cardiology': ['Cardiologist'],
  'Endocrinology': ['Endocrinologist'],
  'Gastroenterology': ['Gastroenterologist'],
  'Nephrology': ['Nephrologist'],
  'Pulmonology': ['Pulmonologist'],
  'Rheumatology': ['Rheumatologist'],
  'Infectious Diseases': ['Infectious Disease Specialist'],
  'Oncology': ['Oncologist'],
  'Haematology': ['Haematologist'],
  'Neurology': ['Neurologist'],
  'Dermatology': ['Dermatologist'],

  // 🧠 Surgical Specialties
  'General Surgery': ['General Surgeon'],
  'Orthopaedic Surgery': ['Orthopaedic Surgeon'],
  'Cardiothoracic Surgery': ['Cardiothoracic Surgeon'],
  'Neurosurgery': ['Neurosurgeon'],
  'Plastic & Reconstructive Surgery': ['Plastic Surgeon'],
  'Urology': ['Urologist'],
  'Vascular Surgery': ['Vascular Surgeon'],
  'ENT (Otolaryngology)': ['ENT Specialist'],
  'Ophthalmology': ['Ophthalmologist'],

  // 👶 Women, Children & Reproductive Health
  'Obstetrics & Gynaecology (OB/GYN)': ['Gynaecologist', 'Obstetrician'],
  'Paediatrics': ['Paediatrician'],
  'Neonatology': ['Neonatologist'],
  'Fertility / Reproductive Medicine': ['Fertility Specialist'],
  'Midwifery': ['Midwife', 'Nurse Practitioner'],

  // 🧍‍♂️ Mental Health & Behavioral Sciences
  'Psychiatry': ['Psychiatrist'],
  'Psychology': ['Clinical Psychologist', 'Counsellor'],
  'Substance Abuse & Rehabilitation': ['Addiction Specialist'],

  // 🦷 Dental & Oral Health
  'Dentistry': ['Dentist'],
  'Oral & Maxillofacial Surgery': ['Oral Surgeon'],
  'Orthodontics': ['Orthodontist'],
  'Periodontology': ['Gum Specialist'],
  'Prosthodontics': ['Prosthodontist'],

  // 🧫 Diagnostics & Support Services
  'Pathology': ['Pathologist'],
  'Radiology': ['Radiologist'],
  'Laboratory Services': ['Lab Technologist'],
  'Nuclear Medicine': ['Nuclear Medicine Specialist'],
  'Pharmacy': ['Pharmacist'],
  'Physiotherapy': ['Physiotherapist'],
  'Occupational Therapy': ['Occupational Therapist'],
  'Dietetics & Nutrition': ['Dietitian', 'Nutritionist'],
  'Speech & Hearing Therapy': ['Speech Therapist', 'Audiologist'],
  'Biomedical Engineering': ['Biomedical Engineer'],

  // 💉 Public Health & Administrative
  'Public Health': ['Public Health Physician'],
  'Epidemiology': ['Epidemiologist'],
  'Health Information Systems': ['Health Informatics Officer'],
  'Hospital Administration': ['Medical Superintendent', 'Hospital Manager'],
  'Nursing Services': ['Chief Nursing Officer', 'Nurse Supervisor', 'Nurse Practitioner']
};

const AddStaff = () => {
  const { user, token } = useAuth();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    employeeId: '',
    role: '',
    department: '',
    specialization: '',
    licenseNumber: '',
    facilityId: '',
    employmentStatus: 'full-time',
    hireDate: new Date().toISOString().split('T')[0], // Today's date as default
  });
  const [facilities, setFacilities] = useState([]);
  const [filteredSpecializations, setFilteredSpecializations] = useState(doctorSpecializations);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    facilityApi.getAll().then(data => {
      // Sort facilities by province to avoid duplicated headers warning
      const sortedFacilities = data.sort((a, b) => {
        const provinceA = a.province || 'Other';
        const provinceB = b.province || 'Other';
        return provinceA.localeCompare(provinceB);
      });
      setFacilities(sortedFacilities);
    });
  }, []);

  // Group facilities by province for better organization
  const facilitiesByProvince = facilities.reduce((acc, facility) => {
    const province = facility.province || 'Other';
    if (!acc[province]) acc[province] = [];
    acc[province].push(facility);
    return acc;
  }, {});

  // Get facility display info
  const getFacilityDisplayInfo = (facility) => {
    const icon = facility.type === 'HOSPITAL' ? <HospitalIcon sx={{ mr: 1, fontSize: 16 }} /> : <ClinicIcon sx={{ mr: 1, fontSize: 16 }} />;
    const location = [facility.province, facility.district].filter(Boolean).join(', ') || 'Location not specified';

    return {
      icon,
      primary: facility.name,
      secondary: `${facility.type} • ${location}`,
      fullInfo: `${facility.name} (${facility.type}) - ${location}`
    };
  };

  // Only allow admin
  if (!user || user.role !== 'ADMIN') {
    return <Alert severity="error">Unauthorized: Only admins can add staff.</Alert>;
  }

  // Filter specializations based on selected department
  useEffect(() => {
    if (formData.department && departmentSpecializationMap[formData.department]) {
      setFilteredSpecializations(departmentSpecializationMap[formData.department]);
      // Reset specialization if it's not in the filtered list
      if (formData.specialization && !departmentSpecializationMap[formData.department].includes(formData.specialization)) {
        setFormData(prev => ({ ...prev, specialization: '' }));
      }
    } else {
      setFilteredSpecializations(doctorSpecializations);
    }
  }, [formData.department, formData.specialization]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    if (!formData.facilityId) {
      setError('Please select a hospital or clinic');
      setLoading(false);
      return;
    }
    try {
      const res = await axios.post('/api/users/add-staff', formData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      Swal.fire({
        icon: 'success',
        title: 'Success!',
        text: 'Staff member added! An email has been sent for them to set their own password.',
        confirmButtonColor: '#3085d6',
      });
      setFormData({
        name: '', email: '', phone: '', employeeId: '', role: '', department: '', specialization: '', licenseNumber: '', facilityId: '', employmentStatus: 'full-time', hireDate: new Date().toISOString().split('T')[0]
      });
      setFilteredSpecializations(doctorSpecializations);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to add staff.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: '#f7fafd', py: 6, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <Container maxWidth="sm">
        <Paper elevation={6} sx={{ borderRadius: 4, p: { xs: 2, sm: 6 }, boxShadow: 6 }}>
          <Typography variant="h5" sx={{ mb: 4, fontWeight: 600 }}>Add Staff Member</Typography>
          <form onSubmit={handleSubmit}>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <TextField label="Full Name" name="name" value={formData.name} onChange={handleChange} fullWidth required />
              </Grid>
              <Grid item xs={12}>
                <TextField label="Email Address" name="email" type="email" value={formData.email} onChange={handleChange} fullWidth required />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField label="Phone Number" name="phone" value={formData.phone} onChange={handleChange} fullWidth placeholder="+27 XX XXX XXXX" />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  label="Employee/Staff ID"
                  name="employeeId"
                  value={formData.employeeId}
                  onChange={handleChange}
                  fullWidth
                  placeholder="EMP001"
                  helperText="Unique identifier for this staff member"
                />
              </Grid>

              <Grid item xs={12}>
                <FormControl fullWidth required error={!formData.facilityId && !!error}>
                  <Autocomplete
                    id="facility-select"
                    options={facilities}
                    value={facilities.find(f => f._id === formData.facilityId) || null}
                    onChange={(event, newValue) => {
                      setFormData(prev => ({ ...prev, facilityId: newValue?._id || '' }));
                    }}
                    groupBy={(option) => option.province || 'Other'}
                    getOptionLabel={(option) => getFacilityDisplayInfo(option).fullInfo}
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        label="Select Hospital or Clinic"
                        error={!formData.facilityId && !!error}
                        helperText={!formData.facilityId && error ? error : 'Choose the healthcare facility where this staff member will work'}
                        required
                      />
                    )}
                    renderOption={(props, option) => {
                      const { icon, primary, secondary } = getFacilityDisplayInfo(option);
                      // Remove key from props to avoid React warning
                      const { key, ...restProps } = props;
                      return (
                        <Box component="li" key={option._id} {...restProps} sx={{ py: 1, ...restProps.sx }}>
                          <Stack direction="row" alignItems="center" spacing={1}>
                            {icon}
                            <Box>
                              <Typography variant="body1" sx={{ fontWeight: 500 }}>
                                {primary}
                              </Typography>
                              <Typography variant="body2" color="text.secondary">
                                {secondary}
                              </Typography>
                            </Box>
                          </Stack>
                        </Box>
                      );
                    }}
                    renderGroup={(params) => (
                      <Box key={params.key} sx={{ px: 2, py: 1, backgroundColor: 'grey.50' }}>
                        <Typography variant="subtitle2" sx={{ fontWeight: 600, color: 'primary.main' }}>
                          {params.group}
                        </Typography>
                        <Box>
                          {params.children}
                        </Box>
                      </Box>
                    )}
                    noOptionsText="No facilities found"
                    loading={loading}
                    sx={{
                      '& .MuiAutocomplete-popupIndicator': { transform: 'none' },
                      '& .MuiAutocomplete-clearIndicator': { visibility: 'visible' }
                    }}
                  />
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  label="Employment Status"
                  name="employmentStatus"
                  value={formData.employmentStatus}
                  onChange={handleChange}
                  select
                  fullWidth
                  helperText="Select the employment type"
                >
                  <MenuItem value="full-time">Full-time</MenuItem>
                  <MenuItem value="part-time">Part-time</MenuItem>
                  <MenuItem value="contract">Contract</MenuItem>
                  <MenuItem value="locum">Locum/Temporary</MenuItem>
                </TextField>
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  label="Hire Date"
                  name="hireDate"
                  type="date"
                  value={formData.hireDate}
                  onChange={handleChange}
                  fullWidth
                  InputLabelProps={{ shrink: true }}
                  helperText="Date when employment begins"
                />
              </Grid>
              <Grid item xs={12}>
                <TextField label="Role" name="role" value={formData.role} onChange={handleChange} select fullWidth required>
                  <MenuItem value="DOCTOR">Doctor</MenuItem>
                  <MenuItem value="NURSE">Nurse</MenuItem>
                </TextField>
              </Grid>
              <Grid item xs={12}>
                <TextField
                  label="Department"
                  name="department"
                  value={formData.department}
                  onChange={handleChange}
                  select
                  fullWidth
                  helperText="Select the medical department where this staff member will work"
                >
                  <MenuItem value="">Select Department...</MenuItem>
                  {medicalDepartments.map((dept) => (
                    <MenuItem key={dept} value={dept}>
                      {dept}
                    </MenuItem>
                  ))}
                </TextField>
              </Grid>
              <Grid item xs={12}>
                <TextField
                  label="Specialization"
                  name="specialization"
                  value={formData.specialization}
                  onChange={handleChange}
                  select
                  fullWidth
                  helperText={formData.department ? `Available specializations for ${formData.department}` : "Select the specific specialization or role"}
                >
                  <MenuItem value="">Select Specialization...</MenuItem>
                  {filteredSpecializations.map((spec) => (
                    <MenuItem key={spec} value={spec}>
                      {spec}
                    </MenuItem>
                  ))}
                </TextField>
              </Grid>
              <Grid item xs={12}>
                <TextField label="License Number" name="licenseNumber" value={formData.licenseNumber} onChange={handleChange} fullWidth />
              </Grid>
              {error && (
                <Grid item xs={12}>
                  <Alert severity="error">{error}</Alert>
                </Grid>
              )}
              <Grid item xs={12}>
                <Button type="submit" variant="contained" color="primary" fullWidth disabled={loading}>
                  {loading ? <CircularProgress size={24} /> : 'Add Staff'}
                </Button>
              </Grid>
            </Grid>
          </form>
        </Paper>
      </Container>
    </Box>
  );
};

export default AddStaff;
