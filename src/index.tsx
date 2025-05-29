import React from "react";
import ReactDOM from "react-dom";
import { App } from "./app";
import { Auth0ProviderWithConfig } from "./auth0-provider-with-config";
import "./styles/styles.css";
import ErrorBoundary from './components/ErrorBoundary';

ReactDOM.render(
  <React.StrictMode>
    <ErrorBoundary>
      <Auth0ProviderWithConfig>
        <App />
      </Auth0ProviderWithConfig>
    </ErrorBoundary>
  </React.StrictMode>,
  document.getElementById("root")
);
