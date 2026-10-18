import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './styles.css'
import { GoogleOAuthProvider } from '@react-oauth/google';

// Yahan apna Google Client ID paste karein jo aapne copy kiya tha
const CLIENT_ID = "721271308120-ukjpt2eds5amh5d5mkd05ok42fbcg77.apps.googleusercontent.com";

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <GoogleOAuthProvider clientId={CLIENT_ID}>
      <App />
    </GoogleOAuthProvider>
  </React.StrictMode>,
)