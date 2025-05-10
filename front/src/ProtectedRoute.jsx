import React, { useEffect, useState } from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import api from './api';

const ProtectedRoute = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(null);
  
  useEffect(() => {
    const verifyAuth = async () => {
      const token = localStorage.getItem('token');
      
      if (!token) {
        setIsAuthenticated(false);
        return;
      }
      
      try {
        // Vérifier la validité du token avec le backend
        await api.get('/auth/verify', {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        setIsAuthenticated(true);
      } catch (error) {
        console.error('Token invalide:', error);
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setIsAuthenticated(false);
      }
    };
    
    verifyAuth();
  }, []);
  
  if (isAuthenticated === null) {
    // Afficher un écran de chargement pendant la vérification
    return <div>Chargement...</div>;
  }
  
  return isAuthenticated ? <Outlet /> : <Navigate to="/login" />;
};

export default ProtectedRoute;
