import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from './api';
import './styles/Login.css'

const Login = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    username: '',
    password: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Gestion des changements dans les champs du formulaire
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  // Soumission du formulaire
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // Appel à l'API pour la connexion
      const response = await api.post('/auth/login', formData);
      
      // Stocker le token et les informations utilisateur dans localStorage
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.user));
      
      // Redirection basée sur le rôle de l'utilisateur
      redirectBasedOnRole(response.data.user.role);
      
    } catch (err) {
      setError(err.response?.data?.message || 'Identifiants incorrects');
    } finally {
      setLoading(false);
    }
  };

  // Fonction de redirection basée sur le rôle
  const redirectBasedOnRole = (role) => {
    switch (role) {
      case 'admin':
        navigate('/dashboard/admin');
        break;
      case 'enseignant':
        navigate('/dashboard/enseignant');
        break;
      /*case 'etudiant':
        navigate('/dashboard/etudiant');
        break;
      case 'parent':
        navigate('/dashboard/parent');
        break;*/
      default:
        navigate('/');
        break;
    }
  };

  return (
    <div className="login-container">
      <div className="login-form-container">
        <h2>Connexion</h2>
        
        {error && <div className="error-message">{error}</div>}
        
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="username">Nom d'utilisateur</label>
            <input
              type="text"
              id="username"
              name="username"
              value={formData.username}
              onChange={handleChange}
              required
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="password">Mot de passe</label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              required
            />
          </div>
          
          <button type="submit" className="submit-btn" disabled={loading}>
            {loading ? 'Connexion en cours...' : 'Se connecter'}
          </button>
        </form>
        
        <div className="register-link">
          Pas encore de compte ? <a href="/register">S'inscrire</a>
        </div>
        
        <div className="forgot-password">
          <a href="/forgot-password">Mot de passe oublié ?</a>
        </div>
      </div>
    </div>
  );
};

export default Login;
