const express = require('express');
const axios = require('axios');
const auth = require('../middleware/auth');
const Appointment = require('../models/Appointment');

const router = express.Router();

const PAYPAL_CLIENT_ID = process.env.PAYPAL_CLIENT_ID || '';
const PAYPAL_SECRET = process.env.PAYPAL_SECRET || '';
const PAYPAL_MODE = (process.env.PAYPAL_MODE || 'sandbox').toLowerCase(); // 'sandbox' | 'live'

const PAYPAL_BASE_URL = PAYPAL_MODE === 'live'
  ? 'https://api-m.paypal.com'
  : 'https://api-m.sandbox.paypal.com';

async function getAccessToken() {
  const authString = Buffer.from(`${PAYPAL_CLIENT_ID}:${PAYPAL_SECRET}`).toString('base64');
  const res = await axios.post(
    `${PAYPAL_BASE_URL}/v1/oauth2/token`,
    new URLSearchParams({ grant_type: 'client_credentials' }),
    {
      headers: {
        Authorization: `Basic ${authString}`,
        'Content-Type': 'application/x-www-form-urlencoded'
      }
    }
  );
  return res.data.access_token;
}

// Get PayPal config (client id and mode) - public endpoint
router.get('/config', async (req, res) => {
  try {
    console.log('Received request for PayPal config');
    
    if (!PAYPAL_CLIENT_ID) {
      console.error('PAYPAL_CLIENT_ID is not configured on the server');
      return res.status(500).json({ 
        error: 'Payment system is not properly configured',
        details: 'Missing PayPal client ID in server configuration'
      });
    }

    if (!PAYPAL_SECRET) {
      console.error('PAYPAL_SECRET is not configured on the server');
      return res.status(500).json({
        error: 'Payment system is not properly configured',
        details: 'Missing PayPal secret in server configuration'
      });
    }

    console.log('Returning PayPal config:', { 
      clientId: PAYPAL_CLIENT_ID ? '***' + PAYPAL_CLIENT_ID.slice(-4) : 'missing',
      mode: PAYPAL_MODE 
    });

    res.json({ 
      clientId: PAYPAL_CLIENT_ID, 
      mode: PAYPAL_MODE 
    });
  } catch (err) {
    console.error('Error in /config endpoint:', err);
    res.status(500).json({ 
      error: 'Failed to load payment configuration',
      details: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
  }
});

// Create PayPal order
router.post('/create-order', auth, async (req, res) => {
  try {
    const { amount = '50.00', currency = 'USD', description = 'Consultation Fee' } = req.body || {};

    const accessToken = await getAccessToken();
    const orderRes = await axios.post(
      `${PAYPAL_BASE_URL}/v2/checkout/orders`,
      {
        intent: 'CAPTURE',
        purchase_units: [
          {
            amount: {
              currency_code: currency,
              value: amount
            },
            description
          }
        ]
      },
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        }
      }
    );

    res.json(orderRes.data);
  } catch (err) {
    console.error('PayPal create-order error:', err.response?.data || err.message);
    res.status(500).json({ error: err.response?.data || err.message });
  }
});

// Capture PayPal order and optionally attach to appointment
router.post('/capture-order', auth, async (req, res) => {
  try {
    const { orderId, appointmentId } = req.body;
    if (!orderId) return res.status(400).json({ error: 'orderId is required' });

    const accessToken = await getAccessToken();
    const captureRes = await axios.post(
      `${PAYPAL_BASE_URL}/v2/checkout/orders/${orderId}/capture`,
      {},
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        }
      }
    );

    const capture = captureRes.data;

    // If appointmentId is provided, update appointment payment fields
    if (appointmentId) {
      try {
        const purchaseUnit = capture.purchase_units?.[0];
        const payments = purchaseUnit?.payments;
        const captured = payments?.captures?.[0];
        const amountVal = captured?.amount?.value;
        const currencyCode = captured?.amount?.currency_code;

        await Appointment.findByIdAndUpdate(
          appointmentId,
          {
            paymentStatus: 'PAID',
            paymentProvider: 'PAYPAL',
            paymentOrderId: orderId,
            paymentAmount: amountVal ? Number(amountVal) : undefined,
            paymentCurrency: currencyCode
          },
          { new: true }
        );
      } catch (apErr) {
        console.error('Failed to update appointment with payment:', apErr);
      }
    }

    res.json(capture);
  } catch (err) {
    console.error('PayPal capture-order error:', err.response?.data || err.message);
    res.status(500).json({ error: err.response?.data || err.message });
  }
});

module.exports = router;
