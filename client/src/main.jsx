import React from 'react';
import ReactDOM from 'react-dom/client';
import { ClerkProvider } from '@clerk/clerk-react';
import { Provider } from 'react-redux';
import { BrowserRouter } from 'react-router-dom';
import App from './App.jsx';
import { store } from './store/store.js';
import './index.css';

const PUBLISHABLE_KEY = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;

// Check if key is placeholder or invalid
const isPlaceholderKey = !PUBLISHABLE_KEY || 
  PUBLISHABLE_KEY.includes('placeholder') || 
  PUBLISHABLE_KEY === 'pk_test_placeholder_key_replace_with_your_clerk_key';

if (isPlaceholderKey) {
  // Show helpful error message instead of crashing
  const errorDiv = document.createElement('div');
  errorDiv.style.cssText = `
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 9999;
    color: white;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  `;
  errorDiv.innerHTML = `
    <div style="text-align: center; max-width: 600px; padding: 40px; background: rgba(0,0,0,0.3); border-radius: 20px; backdrop-filter: blur(10px);">
      <h1 style="font-size: 32px; margin-bottom: 20px;">🔐 Clerk API Key Required</h1>
      <p style="font-size: 18px; margin-bottom: 30px; line-height: 1.6;">
        To run this application, you need to configure Clerk authentication.
      </p>
      <div style="background: rgba(255,255,255,0.1); padding: 20px; border-radius: 10px; margin-bottom: 30px; text-align: left;">
        <h3 style="margin-top: 0;">Quick Setup:</h3>
        <ol style="line-height: 2;">
          <li>Sign up at <a href="https://clerk.com" target="_blank" style="color: #60a5fa; text-decoration: underline;">clerk.com</a></li>
          <li>Create a new application</li>
          <li>Copy your <strong>Publishable Key</strong> (starts with pk_test_...)</li>
          <li>Update <code style="background: rgba(0,0,0,0.3); padding: 2px 6px; border-radius: 4px;">client/.env</code> file</li>
          <li>Restart the development server</li>
        </ol>
      </div>
      <div style="background: rgba(255,255,255,0.1); padding: 15px; border-radius: 10px; font-family: monospace; font-size: 14px; text-align: left;">
        <strong>File to edit:</strong> <code>client/.env</code><br/>
        <strong>Variable:</strong> <code>VITE_CLERK_PUBLISHABLE_KEY</code>
      </div>
      <p style="margin-top: 30px; font-size: 14px; opacity: 0.8;">
        Or you can continue without authentication (features will be limited)
      </p>
      <button onclick="location.reload()" style="
        margin-top: 20px;
        padding: 12px 30px;
        background: white;
        color: #667eea;
        border: none;
        border-radius: 8px;
        font-size: 16px;
        font-weight: bold;
        cursor: pointer;
      ">Reload After Setup</button>
    </div>
  `;
  document.body.appendChild(errorDiv);
} else {
  ReactDOM.createRoot(document.getElementById('root')).render(
    <React.StrictMode>
      <ClerkProvider publishableKey={PUBLISHABLE_KEY}>
        <Provider store={store}>
          <BrowserRouter>
            <App />
          </BrowserRouter>
        </Provider>
      </ClerkProvider>
    </React.StrictMode>,
  );
}

