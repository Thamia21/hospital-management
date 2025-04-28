import React from 'react';
import { 
  Box, 
  Button, 
  Container, 
  Typography, 
  Paper 
} from '@mui/material';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import RefreshIcon from '@mui/icons-material/Refresh';
import HomeIcon from '@mui/icons-material/Home';

class GlobalErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { 
      hasError: false,
      error: null,
      errorInfo: null
    };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    this.setState({
      error: error,
      errorInfo: errorInfo
    });
    
    // Log the error to your error reporting service
    console.error('Uncaught error:', error, errorInfo);
  }

  handleRefresh = () => {
    window.location.reload();
  };

  handleNavigateHome = () => {
    window.location.href = '/';
  };

  render() {
    if (this.state.hasError) {
      return (
        <Container maxWidth="md">
          <Paper 
            elevation={3} 
            sx={{ 
              p: 4, 
              mt: 8, 
              textAlign: 'center',
              backgroundColor: 'error.light',
              color: 'error.contrastText'
            }}
          >
            <ErrorOutlineIcon sx={{ fontSize: 60, mb: 2 }} />
            <Typography variant="h4" gutterBottom>
              Oops! Something went wrong
            </Typography>
            <Typography variant="body1" paragraph>
              We're sorry, but there was an error processing your request.
              Our team has been notified and is working to fix the issue.
            </Typography>
            {process.env.NODE_ENV === 'development' && (
              <Box 
                sx={{ 
                  mt: 2, 
                  p: 2, 
                  bgcolor: 'background.paper',
                  color: 'error.main',
                  borderRadius: 1,
                  textAlign: 'left',
                  fontFamily: 'monospace',
                  maxHeight: '200px',
                  overflow: 'auto'
                }}
              >
                <Typography variant="body2" component="pre">
                  {this.state.error?.toString()}
                </Typography>
                <Typography variant="body2" component="pre">
                  {this.state.errorInfo?.componentStack}
                </Typography>
              </Box>
            )}
            <Box sx={{ mt: 4, display: 'flex', gap: 2, justifyContent: 'center' }}>
              <Button
                variant="contained"
                color="primary"
                startIcon={<RefreshIcon />}
                onClick={this.handleRefresh}
              >
                Refresh Page
              </Button>
              <Button
                variant="outlined"
                color="inherit"
                startIcon={<HomeIcon />}
                onClick={this.handleNavigateHome}
              >
                Go to Homepage
              </Button>
            </Box>
          </Paper>
        </Container>
      );
    }

    return this.props.children;
  }
}

export default GlobalErrorBoundary;
