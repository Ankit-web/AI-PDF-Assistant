import React from 'react';
import { Navigate } from 'react-router-dom';

const ProtectedRoute = ({ children }) => {
  // Check if a token exists in localStorage
  const token = localStorage.getItem('token');

  // If there's no token, redirect the user to the login page
  if (!token) {
    return <Navigate to="/login" />;
  }

  // If a token exists, render the component that was passed as a child
  // (In our case, this will be the Dashboard)
  return children;
};

export default ProtectedRoute;