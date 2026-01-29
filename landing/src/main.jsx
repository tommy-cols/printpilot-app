import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from './lib/AuthContext';
import { TrialProvider } from './lib/TrialContext';
import App from './App';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <TrialProvider>
          <App />
        </TrialProvider>
      </AuthProvider>
    </BrowserRouter>
  </React.StrictMode>
);
