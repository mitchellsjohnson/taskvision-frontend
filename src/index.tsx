import React from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import { App } from './app';
import { Auth0ProviderWithHistory } from './auth0-provider-with-history';
import { BrowserRouter } from 'react-router-dom';
import { ThemeProvider } from './contexts/theme-context';

const container = document.getElementById('root');

if (!container) {
  throw new Error('Failed to find the root element');
}

const root = createRoot(container);

root.render(
  <React.StrictMode>
    <BrowserRouter>
      <Auth0ProviderWithHistory>
        <ThemeProvider>
          <App />
        </ThemeProvider>
      </Auth0ProviderWithHistory>
    </BrowserRouter>
  </React.StrictMode>
);
