// Test Stripe Payment Intent Creation
const axios = require('axios');
const jwt = require('jsonwebtoken');

async function testStripePaymentIntent() {
  try {
    console.log('🔍 Testing Stripe Payment Intent Creation...');

    // First, login to get a token (using demo patient credentials)
    const loginResponse = await axios.post('http://localhost:5000/api/auth/login', {
      email: 'john.doe@example.com',
      password: 'patient123'
    });

    const token = loginResponse.data.token;
    console.log('✅ Login successful, got token');

    // Test payment intent creation
    const paymentIntentResponse = await axios.post(
      'http://localhost:5000/api/payments/create-payment-intent',
      {
        amount: 150.50,
        currency: 'zar',
        billId: 'test-bill-123'
      },
      {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      }
    );

    console.log('✅ Payment Intent created successfully!');
    console.log('Response:', paymentIntentResponse.data);

    return paymentIntentResponse.data;
  } catch (error) {
    console.error('❌ Test failed:', error.response?.data || error.message);
    throw error;
  }
}

// Run the test if called directly
if (require.main === module) {
  testStripePaymentIntent()
    .then(() => {
      console.log('🎉 All tests passed!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('💥 Test failed:', error.message);
      process.exit(1);
    });
}

module.exports = { testStripePaymentIntent };
