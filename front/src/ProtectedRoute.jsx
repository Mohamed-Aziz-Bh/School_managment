import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';

const ProtectedRoute = ({ allowedRoles }) => {
  // Récupérer les informations de l'utilisateur depuis localStorage
  const user = JSON.parse(localStorage.getItem('user'));
  const token = localStorage.getItem('token');
  
  // Vérifier si l'utilisateur est connecté et a le rôle autorisé
  const isAuthorized = token && user && allowedRoles.includes(user.role);
  
  // Si l'utilisateur n'est pas autorisé, rediriger vers la page de connexion
  if (!isAuthorized) {
    return <Navigate to="/login" replace />;
  }
  
  // Si l'utilisateur est autorisé, afficher les composants enfants
  return <Outlet />;
};

export default ProtectedRoute;
