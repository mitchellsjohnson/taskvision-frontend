const AUTH0_AUDIENCE_FROM_ENV = process.env.REACT_APP_AUTH0_AUDIENCE;

if (!AUTH0_AUDIENCE_FROM_ENV && process.env.NODE_ENV === 'development') {
  // In development, throw an error to alert the developer immediately.
  throw new Error(
    `ERROR: REACT_APP_AUTH0_AUDIENCE is not defined in your .env file. \n` +
      `This is required for Auth0 integration. \n` +
      `Please ensure your .env file in the taskvision-frontend directory contains:\n` +
      `REACT_APP_AUTH0_AUDIENCE="https://opsvision3-react.server.com"`
  );
} else if (!AUTH0_AUDIENCE_FROM_ENV && process.env.NODE_ENV !== 'development') {
  // In production or other environments, log an error.
  // You might also have a different fallback or error handling strategy here.
  console.error(
    'CRITICAL ERROR: REACT_APP_AUTH0_AUDIENCE is not defined. Auth0 features related to custom claims will likely fail.'
  );
}

export const AUTH0_NAMESPACE = AUTH0_AUDIENCE_FROM_ENV as string;

// The `as string` assertion is used because we're either throwing an error
// or accepting it might be undefined in production (which should be caught by the error log).
// If you wanted to guarantee it's always a string and halt in prod if not set,
// you could throw an error in the production `else if` block too.
