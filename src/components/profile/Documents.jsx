import React, { useState } from 'react';
import { Box, Paper, Typography, Button, CircularProgress } from '@mui/material';
import { CloudUpload as CloudUploadIcon } from '@mui/icons-material';

const Documents = ({ user, onUpdate, loading = false }) => {
  // State for handling uploads
  const [isUploading, setIsUploading] = useState(false);
  
  // Handle document upload
  const handleFileUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;
    
    setIsUploading(true);
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Update parent component with the new document
      const newDocument = {
        id: `doc_${Date.now()}`,
        name: file.name,
        type: file.type,
        size: file.size,
        uploadedAt: new Date().toISOString(),
      };
      
      onUpdate && onUpdate({
        documents: [...(user?.documents || []), newDocument]
      });
      
    } catch (error) {
      console.error('Error uploading document:', error);
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <Paper elevation={2} sx={{ p: 3, mb: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h6">Documents</Typography>
        <Button
          variant="contained"
          color="primary"
          component="label"
          disabled={loading || isUploading}
          startIcon={isUploading ? <CircularProgress size={20} /> : <CloudUploadIcon />}
        >
          <input
            type="file"
            hidden
            onChange={handleFileUpload}
            accept=".pdf,.doc,.docx,.xls,.xlsx,.jpg,.jpeg,.png"
          />
          {isUploading ? 'Uploading...' : 'Upload Document'}
        </Button>
      </Box>
      
      {/* Document list will go here */}
      <Box sx={{ minHeight: 200, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Typography color="textSecondary">
          {user?.documents?.length ? 'Documents list will be displayed here' : 'No documents uploaded yet'}
        </Typography>
      </Box>
    </Paper>
  );
};

export default Documents;
