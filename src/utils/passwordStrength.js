// Simple password strength estimator (fallback if zxcvbn is not installed)
export function getPasswordStrength(password) {
  let score = 0;
  if (!password) return { score, label: 'Very Weak', color: 'error' };

  // Criteria
  if (password.length >= 8) score++;
  if (/[A-Z]/.test(password)) score++;
  if (/[0-9]/.test(password)) score++;
  if (/[^A-Za-z0-9]/.test(password)) score++;

  if (score === 0) return { score, label: 'Very Weak', color: 'error' };
  if (score === 1) return { score, label: 'Weak', color: 'warning' };
  if (score === 2) return { score, label: 'Medium', color: 'warning' };
  if (score === 3) return { score, label: 'Strong', color: 'success' };
  if (score === 4) return { score, label: 'Very Strong', color: 'success' };

  return { score, label: 'Unknown', color: 'info' };
}
