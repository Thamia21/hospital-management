const express = require('express');
const auth = require('../middleware/auth');
const Appointment = require('../models/Appointment');

const router = express.Router();

// Initialize Stripe
let stripe = null;
if (process.env.STRIPE_SECRET_KEY) {
  stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
  console.log('✅ Stripe initialized successfully');
} else {
  console.error('⚠️ STRIPE_SECRET_KEY not found in environment variables');
}

// -------------------
// Stripe Config (frontend)
router.get('/config', async (req, res) => {
  try {
    const publishableKey = process.env.VITE_STRIPE_PUBLISHABLE_KEY || process.env.STRIPE_PUBLISHABLE_KEY;

    if (!publishableKey) {
      return res.status(500).json({
        error: 'Payment system is not properly configured',
        details: 'Missing Stripe publishable key in server configuration'
      });
    }

    res.json({
      publishableKey,
      currency: 'zar'
    });
  } catch (err) {
    console.error('Error in /config endpoint:', err);
    res.status(500).json({
      error: 'Failed to load payment configuration',
      details: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
  }
});

// -------------------
// Create Stripe Payment Intent
router.post('/create-payment-intent', async (req, res) => {
  try {
    if (!stripe) {
      return res.status(500).json({
        error: 'Payment system not configured',
        details: 'Stripe secret key not found'
      });
    }

    const { amount, currency = 'zar', billId } = req.body;

    if (!amount || amount <= 0) {
      return res.status(400).json({ error: 'Valid amount is required' });
    }

    const amountInCents = Math.round(amount * 100);

    const paymentIntent = await stripe.paymentIntents.create({
      amount: amountInCents,
      currency: currency.toLowerCase(),
      metadata: {
        billId: billId || '',
        patientId: req.user?.id || req.user?._id || 'anonymous'
      },
      automatic_payment_methods: { enabled: true },
    });

    res.json({
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id
    });
  } catch (error) {
    console.error('Stripe Payment Intent creation error:', error);
    res.status(500).json({
      error: 'Failed to create payment intent',
      details: error.message
    });
  }
});

// -------------------
// Optional: Stripe Webhook endpoint
router.post('/webhook', express.raw({ type: 'application/json' }), async (req, res) => {
  try {
    const sig = req.headers['stripe-signature'];
    const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;

    let event;

    if (endpointSecret) {
      event = stripe.webhooks.constructEvent(req.body, sig, endpointSecret);
    } else {
      // For development/testing without webhook verification
      event = req.body;
    }

    switch (event.type) {
      case 'payment_intent.succeeded':
        console.log('Payment succeeded:', event.data.object.id);
        break;

      case 'payment_intent.payment_failed':
        console.log('Payment failed:', event.data.object.id);
        break;

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    res.json({ received: true });
  } catch (error) {
    console.error('Webhook error:', error.message);
    res.status(400).send(`Webhook Error: ${error.message}`);
  }
});

module.exports = router;
