import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import LandingPage from './components/LandingPage';
import Dashboard from './components/Dashboard';
import Workspace from './components/Workspace';
import MainLayout from './components/MainLayout'; // <-- Import the new layout

import { pdfjs } from 'react-pdf';
pdfjs.GlobalWorkerOptions.workerSrc = new URL(
  'pdfjs-dist/build/pdf.worker.min.mjs', // <-- Changed to .js
  import.meta.url,
).toString();

// A component to protect routes that require authentication
const ProtectedRoute = ({ children }) => {
  const token = localStorage.getItem('token');
  // If no token, redirect to the new landing page
  return token ? children : <Navigate to="/" />; 
};

// A component for public routes to prevent logged-in users from seeing the landing page
const PublicRoute = ({ children }) => {
    const token = localStorage.getItem('token');
    // If a token exists, redirect to the dashboard
    return token ? <Navigate to="/dashboard" /> : children; 
};

const App = () => {
  return (
    <Router>
      <Routes>
        {/* Public Landing Page Route */}
        <Route 
            path="/"
            element={
                <PublicRoute>
                    <LandingPage />
                </PublicRoute>
            }
        />
        
        {/* --- NEW: Protected routes now render inside the MainLayout --- */}
        <Route 
          element={
            <ProtectedRoute>
              <MainLayout />
            </ProtectedRoute>
          }
        >
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/workspace/:documentId" element={<Workspace />} />
        </Route>

        {/* Fallback route */}
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </Router>
  );
};

export default App;
