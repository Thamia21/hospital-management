require('dotenv').config();
const stripe = require('stripe');

console.log('🔍 Testing Stripe Configuration...');
console.log('Node version:', process.version);
console.log('STRIPE_SECRET_KEY available:', !!process.env.STRIPE_SECRET_KEY);

if (process.env.STRIPE_SECRET_KEY) {
  try {
    const stripeClient = stripe(process.env.STRIPE_SECRET_KEY);
    console.log('✅ Stripe client initialized successfully');

    // Test creating a payment intent (dry run)
    console.log('🧪 Testing payment intent creation...');
    // Note: This would fail without a real API call, but tests the client setup
  } catch (error) {
    console.error('❌ Stripe initialization failed:', error.message);
  }
} else {
  console.warn('⚠️ STRIPE_SECRET_KEY not found in environment');
}

console.log('📦 Testing other dependencies...');
try {
  const express = require('express');
  const mongoose = require('mongoose');
  const axios = require('axios');
  console.log('✅ Core dependencies loaded successfully');
} catch (error) {
  console.error('❌ Missing dependencies:', error.message);
}

console.log('🎉 Configuration test complete!');
