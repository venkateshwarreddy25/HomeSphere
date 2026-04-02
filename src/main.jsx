import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './context/AuthContext';
import CompareProvider from './context/CompareContext';
import { PayPalScriptProvider } from '@paypal/react-paypal-js';
import App from './App';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <PayPalScriptProvider options={{ "client-id": import.meta.env.VITE_PAYPAL_CLIENT_ID, currency: "USD" }}>
        <AuthProvider>
          <CompareProvider>
            <App />
            <Toaster
              position="top-right"
              toastOptions={{
                duration: 3500,
                style: {
                  fontFamily: 'Inter, sans-serif',
                  fontSize: '0.875rem',
                  borderRadius: '10px',
                  boxShadow: '0 10px 40px rgba(0,0,0,0.15)',
                },
                success: {
                  iconTheme: { primary: '#10b981', secondary: '#fff' },
                  style: { background: '#fff', color: '#065f46', border: '1px solid #6ee7b7' },
                },
                error: {
                  iconTheme: { primary: '#ef4444', secondary: '#fff' },
                  style: { background: '#fff', color: '#991b1b', border: '1px solid #fca5a5' },
                },
              }}
            />
          </CompareProvider>
        </AuthProvider>
      </PayPalScriptProvider>
    </BrowserRouter>
  </React.StrictMode>
);
