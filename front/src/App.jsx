import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Login from './Login';
import Register from './Register';
//import HomePage from './HomePage';
import ProtectedRoute from './ProtectedRoute';
import AdminDashboard from './dashboards/AdminDashboard';
import EnseignantDashboard from './dashboards/EnseignantDashboard';
import EtudiantDashboard from './dashboards/EtudiantDashboard';
import ParentDashboard from './dashboards/ParentDashboard';
import './App.css';

function App() {
  return (
    <Router>
      <Routes>
        {/* Page d'accueil comme route par défaut */}
        <Route path="/" element={<Login />} />
        
        {/* Routes publiques */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route element={<ProtectedRoute />}></Route>
        
        {/* Routes protégées pour les tableaux de bord */}
        <Route element={<ProtectedRoute allowedRoles={['admin']} />}>
          <Route path="/dashboard/admin" element={<AdminDashboard />} />
        </Route>
        <Route element={<ProtectedRoute allowedRoles={['enseignant']} />}>
          <Route path="/dashboard/enseignant" element={<EnseignantDashboard />} />
        </Route>
        <Route element={<ProtectedRoute allowedRoles={['etudiant']} />}>
          <Route path="/dashboard/etudiant" element={<EtudiantDashboard />} />
        </Route>
        <Route element={<ProtectedRoute allowedRoles={['parent']} />}>
          <Route path="/dashboard/parent" element={<ParentDashboard />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
