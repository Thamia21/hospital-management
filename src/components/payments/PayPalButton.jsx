import React, { useEffect, useRef, useState, useCallback } from 'react';
import { Box, CircularProgress, Button, Alert, Typography } from '@mui/material';
import { paymentsService } from '../../services/api';
import { useSnackbar } from 'notistack';

// Track SDK loading state globally
let paypalSdkPromise = null;

const PayPalButton = ({ amount, currency = 'USD', description = '', onApproved }) => {
  const { enqueueSnackbar } = useSnackbar();
  const paypalRef = useRef();
  const buttonsRef = useRef(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [retryCount, setRetryCount] = useState(0);
  const isMounted = useRef(true);
  const isInitializing = useRef(false);

  // Load PayPal SDK with retry logic
  const loadPayPalSdk = useCallback(async () => {
    try {
      console.log('Loading PayPal SDK...');
      
      // Get PayPal config
      const config = await paymentsService.getConfig().catch(err => {
        console.error('Failed to load PayPal config:', err);
        enqueueSnackbar('Failed to initialize payment system. Please try again later.', { variant: 'error' });
        throw new Error('Failed to load payment configuration');
      });
      
      if (!config?.clientId) {
        const errorMsg = 'Payment system is not properly configured';
        console.error('Missing PayPal client ID in config:', config);
        enqueueSnackbar(errorMsg, { variant: 'error' });
        throw new Error(errorMsg);
      }

      // If SDK is already loaded, return it
      if (window.paypal || window.paypal_sdk) {
        console.log('PayPal SDK already loaded');
        return window.paypal || window.paypal_sdk;
      }

      // If SDK is already being loaded, return the existing promise
      if (paypalSdkPromise) {
        console.log('PayPal SDK load already in progress');
        return paypalSdkPromise;
      }

      // Create a new promise to load the SDK
      paypalSdkPromise = new Promise((resolve, reject) => {
        // Clean up any existing PayPal SDK scripts
        const existingScripts = document.querySelectorAll('script[src*="paypal.com/sdk"]');
        console.log('Found existing PayPal scripts:', existingScripts.length);
        existingScripts.forEach(script => {
          script.remove();
        });

        const script = document.createElement('script');
        const clientId = config.clientId.trim();
        const sdkUrl = `https://www.paypal.com/sdk/js?client-id=${clientId}&currency=${currency}&components=buttons&intent=capture`;
        
        console.log('Loading PayPal SDK from:', sdkUrl);
        script.src = sdkUrl;
        script.async = true;
        // Remove custom namespace so SDK attaches to window.paypal
        // script.setAttribute('data-namespace', 'paypal_sdk');
        script.setAttribute('data-sdk-integration-source', 'integrationbuilder');

        script.onload = () => {
          console.log('PayPal script loaded, waiting for SDK global...');
          const maxAttempts = 20; // ~2 seconds
          let attempts = 0;
          const interval = setInterval(() => {
            const sdk = window.paypal || window.paypal_sdk;
            if (sdk) {
              clearInterval(interval);
              console.log('PayPal SDK loaded successfully');
              resolve(sdk);
            } else if (++attempts >= maxAttempts) {
              clearInterval(interval);
              console.error('PayPal SDK not available in window object after waiting');
              reject(new Error('Failed to initialize PayPal SDK'));
            }
          }, 100);
        };

        script.onerror = (error) => {
          console.error('Error loading PayPal SDK script:', error);
          reject(new Error('Failed to load PayPal SDK script'));
        };

        // Add to head instead of body
        document.head.appendChild(script);
      });

      return paypalSdkPromise;
    } catch (error) {
      console.error('Error in loadPayPalSdk:', error);
      paypalSdkPromise = null;
      throw error;
    }
  }, [currency]);

  // Initialize PayPal buttons
  const initializePayPal = useCallback(async () => {
    if (!isMounted.current) return;
    
    if (isInitializing.current) {
      console.log('initializePayPal called while already initializing; skipping');
      return;
    }

    isInitializing.current = true;
    try {
      setLoading(true);
      setError('');
      
      // Clear any previous buttons and errors
      if (paypalRef.current) {
        console.log('Clearing previous PayPal container');
        paypalRef.current.innerHTML = '';
      } else {
        console.error('paypalRef.current is null');
        return;
      }
      
      // Clear any existing buttons
      if (paypalRef.current && paypalRef.current.hasChildNodes()) {
        paypalRef.current.innerHTML = '';
      }

      // Load PayPal SDK
      const paypal = await loadPayPalSdk();
      if (!isMounted.current) return;

      // Create new buttons instance
      if (buttonsRef.current) {
        try {
          await buttonsRef.current.close();
        } catch (e) {
          console.warn('Error closing previous PayPal buttons:', e);
        }
        buttonsRef.current = null;
      }

      const buttons = paypal.Buttons({
        style: {
          layout: 'vertical',
          color: 'blue',
          shape: 'rect',
          label: 'paypal',
          height: 40,
          tagline: false
        },
        createOrder: async (data, actions) => {
          try {
            const order = await paymentsService.createOrder({
              amount: String(amount),
              currency,
              description
            });
            return order.id;
          } catch (err) {
            console.error('Create order error:', err);
            setError('Failed to create payment. Please try again.');
            throw err;
          }
        },
        onApprove: async (data, actions) => {
          try {
            const capture = await paymentsService.captureOrder({ 
              orderId: data.orderID,
              appointmentId: onApproved?.appointmentId
            });
            if (isMounted.current && onApproved) {
              onApproved({ orderId: data.orderID, capture });
            }
          } catch (err) {
            console.error('Capture order error:', err);
            throw new Error('Payment processing failed');
          }
        },
        onError: (err) => {
          console.error('PayPal Buttons error:', err);
          if (isMounted.current) {
            setError('Error processing payment. Please try again.');
          }
        },
        onCancel: () => {
          console.log('Payment cancelled by user');
        }
      });

      if (paypalRef.current && buttons.isEligible()) {
        await buttons.render(paypalRef.current);
        buttonsRef.current = buttons;
      } else {
        throw new Error('Unable to render PayPal buttons');
      }
      
      setLoading(false);
    } catch (err) {
      console.error('PayPal initialization error:', err);
      if (isMounted.current) {
        setError(err.message || 'Failed to initialize payment processor');
        setLoading(false);
      }
    } finally {
      isInitializing.current = false;
    }
  }, [amount, currency, description, onApproved, loadPayPalSdk]);

  const handleRetry = async () => {
    try {
      setError('');
      setLoading(true);
      // Clear the PayPal SDK promise to force a fresh load
      paypalSdkPromise = null;
      // Reset the buttons ref
      buttonsRef.current = null;
      // Force a small delay before retrying
      await new Promise(resolve => setTimeout(resolve, 500));
      // Increment retry count to trigger re-initialization
      setRetryCount(prev => prev + 1);
    } catch (err) {
      console.error('Error during retry:', err);
      setError('Failed to retry payment. Please try again.');
      setLoading(false);
    }
  };

  const handleHardRefresh = () => {
    window.location.reload();
  };

  // Initialize on mount and when retryCount changes
  useEffect(() => {
    isMounted.current = true;
    let retryTimer;
    
    const init = async () => {
      try {
        await initializePayPal();
      } catch (err) {
        console.error('Failed to initialize PayPal:', err);
        setError('Failed to load payment options. Please try again.');
        setLoading(false);
        
        // Auto-retry after 5 seconds if still mounted
        if (isMounted.current) {
          retryTimer = setTimeout(() => {
            if (isMounted.current) {
              handleRetry();
            }
          }, 5000);
        }
      }
    };
    
    init();

    return () => {
      isMounted.current = false;
      // Clean up buttons on unmount
      if (buttonsRef.current) {
        try {
          buttonsRef.current.close();
        } catch (e) {
          console.warn('Error cleaning up PayPal buttons:', e);
        }
        buttonsRef.current = null;
      }
      // Clear any pending retry timers
      if (retryTimer) {
        clearTimeout(retryTimer);
      }
    };
  }, [initializePayPal, retryCount]);

  return (
    <Box sx={{ minHeight: '200px', position: 'relative' }}>
      <div
        ref={paypalRef}
        style={{
          minHeight: '200px',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
        }}
      />

      {loading && (
        <Box
          sx={{
            position: 'absolute',
            inset: 0,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 2,
            backgroundColor: 'rgba(255,255,255,0.8)',
            pointerEvents: 'auto'
          }}
        >
          <CircularProgress />
          <Typography>Loading payment options...</Typography>
        </Box>
      )}

      {error && (
        <Box
          sx={{
            position: 'absolute',
            inset: 0,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 2,
            p: 2,
            textAlign: 'center',
            backgroundColor: 'rgba(255,255,255,0.9)',
            pointerEvents: 'auto'
          }}
        >
          <Alert severity="error" sx={{ width: '100%', mb: 2 }}>
            {error}
          </Alert>
          <Button
            variant="contained"
            color="primary"
            onClick={handleRetry}
            disabled={loading}
          >
            Try Again
          </Button>
          <Button
            variant="outlined"
            color="primary"
            onClick={handleHardRefresh}
            disabled={loading}
            sx={{ mt: 1 }}
          >
            Hard Refresh
          </Button>
        </Box>
      )}
    </Box>
  );
};

export default PayPalButton;
