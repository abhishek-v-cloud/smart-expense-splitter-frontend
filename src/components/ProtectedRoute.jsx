import React, { useState, useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import Cookies from 'js-cookie';
import LoadingSpinner from './LoadingSpinner';

const ProtectedRoute = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(null);

  useEffect(() => {
    let mounted = true;

    const verifyToken = async () => {
      const token = Cookies.get('token');
      if (!token) {
        if (mounted) setIsAuthenticated(false);
        return;
      }

      try {
        const res = await fetch('https://smart-expense-splitter-backend.vercel.app/api/auth/me', {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (res.status === 401 || res.status === 403) {
            Cookies.remove('token');
            try { window.dispatchEvent(new Event('authChange')); } catch (e) { /* ignore */ }
          if (mounted) setIsAuthenticated(false);
          return;
        }

        if (!res.ok) {
          if (mounted) setIsAuthenticated(null);
          return;
        }

        if (mounted) setIsAuthenticated(true);
      } catch (_) {
        if (mounted) setIsAuthenticated(null);
      }
    };

    verifyToken();
    return () => {
      mounted = false;
    };
  }, []);

  if (isAuthenticated === null) return <LoadingSpinner message="Loading..." />;
  if (isAuthenticated === false) return <Navigate to="/login" replace />;

  return children;
};

export default ProtectedRoute;
