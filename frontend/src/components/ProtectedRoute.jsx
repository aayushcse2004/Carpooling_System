import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { isAuthenticated, isDriver, isPassenger } from '../utils/auth';
import { toast } from 'sonner';

/**
 * ProtectedRoute component for CommuteX
 * Restricts access based on authentication status and user role.
 */
export default function ProtectedRoute({ children, requiredRole }) {
  const location = useLocation();

  if (!isAuthenticated()) {
    return <Navigate to="/role-selection" state={{ from: location }} replace />;
  }

  if (requiredRole === 'driver' && !isDriver()) {
    toast.error('Driver access required for this page. Please log in as a driver.');
    return <Navigate to="/driver-login" replace />;
  }

  if (requiredRole === 'passenger' && isDriver()) {
    toast.info('You are logged in as a driver. Navigating to Driver Dashboard.');
    return <Navigate to="/rider-dashboard" replace />;
  }

  return children;
}
