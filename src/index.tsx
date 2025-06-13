import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import { App } from './app';
import { Auth0ProviderWithHistory } from './auth0-provider-with-history';
import { BrowserRouter } from 'react-router-dom';

ReactDOM.render(
  <React.StrictMode>
    <BrowserRouter>
      <Auth0ProviderWithHistory>
        <App />
      </Auth0ProviderWithHistory>
    </BrowserRouter>
  </React.StrictMode>,
  document.getElementById('root')
);
