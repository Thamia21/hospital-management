import React, { useState, useEffect } from 'react';
import {
  CardElement,
  useStripe,
  useElements,
} from '@stripe/react-stripe-js';
import {
  Box,
  Typography,
  TextField,
  Button,
  Alert,
  CircularProgress,
  Grid,
} from '@mui/material';
import { Payment as PaymentIcon } from '@mui/icons-material';

const CARD_ELEMENT_OPTIONS = {
  style: {
    base: {
      color: '#32325d',
      fontFamily: '"Helvetica Neue", Helvetica, sans-serif',
      fontSmoothing: 'antialiased',
      fontSize: '16px',
      '::placeholder': {
        color: '#aab7c4',
      },
    },
    invalid: {
      color: '#fa755a',
      iconColor: '#fa755a',
    },
  },
};

export default function StripePaymentForm({
  amount,
  billId,
  onSuccess,
  onError,
  onCancel
}) {
  const stripe = useStripe();
  const elements = useElements();
  const [clientSecret, setClientSecret] = useState('');
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState('');
  const [billingDetails, setBillingDetails] = useState({
    name: '',
    email: '',
    address: '',
  });

  useEffect(() => {
    // Create PaymentIntent when component mounts
    createPaymentIntent();
  }, [amount]);

  const createPaymentIntent = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/payments/create-payment-intent', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          amount: amount, // Send amount in rands, backend converts to cents
          currency: 'zar',
          billId: billId,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to create payment intent');
      }

      const data = await response.json();
      setClientSecret(data.clientSecret);
    } catch (err) {
      console.error('Error creating payment intent:', err);
      setError('Failed to initialize payment. Please try again.');
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    if (!billingDetails.name || !billingDetails.email) {
      setError('Please fill in all required fields');
      return;
    }

    setProcessing(true);
    setError('');

    try {
      const { error: paymentMethodError, paymentMethod } = await stripe.createPaymentMethod({
        type: 'card',
        card: elements.getElement(CardElement),
        billing_details: {
          name: billingDetails.name,
          email: billingDetails.email,
          address: {
            line1: billingDetails.address,
          },
        },
      });

      if (paymentMethodError) {
        throw new Error(paymentMethodError.message);
      }

      // Confirm payment with PaymentIntent
      const { error: confirmError, paymentIntent } = await stripe.confirmCardPayment(
        clientSecret,
        {
          payment_method: paymentMethod.id,
        }
      );

      if (confirmError) {
        throw new Error(confirmError.message);
      }

      if (paymentIntent.status === 'succeeded') {
        // Payment successful
        onSuccess({
          paymentIntentId: paymentIntent.id,
          amount: amount,
          currency: 'ZAR',
        });
      }
    } catch (err) {
      console.error('Payment error:', err);
      setError(err.message || 'Payment failed. Please try again.');
      onError(err.message || 'Payment failed. Please try again.');
    } finally {
      setProcessing(false);
    }
  };

  return (
    <Box sx={{ width: '100%' }}>
      <Typography variant="h6" gutterBottom>
        Payment Details
      </Typography>

      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={12}>
          <TextField
            fullWidth
            required
            label="Full Name"
            value={billingDetails.name}
            onChange={(e) => setBillingDetails({ ...billingDetails, name: e.target.value })}
            placeholder="John Doe"
          />
        </Grid>
        <Grid item xs={12}>
          <TextField
            fullWidth
            required
            label="Email Address"
            type="email"
            value={billingDetails.email}
            onChange={(e) => setBillingDetails({ ...billingDetails, email: e.target.value })}
            placeholder="john@example.com"
          />
        </Grid>
        <Grid item xs={12}>
          <TextField
            fullWidth
            label="Billing Address"
            multiline
            rows={2}
            value={billingDetails.address}
            onChange={(e) => setBillingDetails({ ...billingDetails, address: e.target.value })}
            placeholder="123 Main St, Johannesburg, 2000"
          />
        </Grid>
      </Grid>

      <Typography variant="h6" gutterBottom>
        Card Information
      </Typography>

      <Box
        sx={{
          p: 2,
          border: '1px solid',
          borderColor: 'grey.300',
          borderRadius: 1,
          mb: 3,
        }}
      >
        <CardElement options={CARD_ELEMENT_OPTIONS} />
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
        <Button
          type="button"
          onClick={onCancel}
          disabled={processing}
        >
          Cancel
        </Button>
        <Button
          type="button"
          variant="contained"
          disabled={!stripe || processing}
          startIcon={processing ? <CircularProgress size={20} /> : <PaymentIcon />}
          onClick={handleSubmit}
        >
          {processing ? 'Processing...' : `Pay R ${amount.toFixed(2)}`}
        </Button>
      </Box>
    </Box>
  );
}
