import React from 'react';

// Try to import Stripe components, fallback if not available
let Elements, stripePromise;
try {
  // Use require for dynamic loading in case Stripe packages aren't installed
  const stripeModule = require('@stripe/react-stripe-js');
  Elements = stripeModule.Elements;

  const stripeConfig = require('../../config/stripe');
  stripePromise = stripeConfig.stripePromise;
} catch (error) {
  console.warn('Stripe not available:', error.message);
  // Fallback component if Stripe is not available
  Elements = ({ children }) => <div>{children}</div>;
  stripePromise = null;
}

import PatientBilling from './PatientBilling';

export default function PatientBillingWrapper() {
  return (
    <Elements stripe={stripePromise}>
      <PatientBilling />
    </Elements>
  );
}
