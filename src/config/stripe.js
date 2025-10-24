import { loadStripe } from '@stripe/stripe-js';

// Make sure to add your Stripe publishable key to your .env file
// For development, you can also add it directly here (not recommended for production)
const stripePublishableKey = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY || 'pk_test_51SK2bxFvEmkTTfBbb0BSs2mqtxnN7Vftc1ZBUcU5UYHUJFVXS2ZelGZouZEYDWXXMKwZq0NeZjjin6lNRSY4A2wf00o3lSCPcG';

// Initialize Stripe
export const stripePromise = loadStripe(stripePublishableKey);

export default stripePromise;
