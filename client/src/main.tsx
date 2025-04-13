import React from 'react';
import ReactDOM from 'react-dom/client';
import { QueryClientProvider } from '@tanstack/react-query';
import { queryClient } from './lib/react-query-client';
import App from './App';
import './index.css'
import { UserProvider } from './context/user-context';
import { SearchProvider } from './context/search-context';
import { GoogleOAuthProvider } from "@react-oauth/google"


const googleClientId = import.meta.env.VITE_APP_GOOGLE_CLIENT_ID;


ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <GoogleOAuthProvider clientId={googleClientId}>
    <QueryClientProvider client={queryClient}>
    <SearchProvider>
    <UserProvider>
      <App />
    </UserProvider>
    </SearchProvider>
    </QueryClientProvider>
    </GoogleOAuthProvider>
  </React.StrictMode>
);
