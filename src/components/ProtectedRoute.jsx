import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ProtectedRoute = ({ children, role }) => {
  const { currentUser, userProfile, loading } = useAuth();

  if (loading) {
    return (
      <div className="spinner-wrapper" style={{ minHeight: '80vh' }}>
        <div className="spinner" />
      </div>
    );
  }

  if (!currentUser) {
    return <Navigate to="/login" replace />;
  }

  // If a specific role is required, check it
  if (role && userProfile?.role !== role) {
    // Redirect to appropriate dashboard if wrong role
    if (userProfile?.role === 'admin') return <Navigate to="/admin/dashboard" replace />;
    if (userProfile?.role === 'owner') return <Navigate to="/owner/dashboard" replace />;
    return <Navigate to="/user/dashboard" replace />;
  }

  return children;
};

export default ProtectedRoute;
