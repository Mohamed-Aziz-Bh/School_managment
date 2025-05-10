const jwt = require('jsonwebtoken');

const auth = (req, res, next) => {
  try {
    // Vérifier si l'en-tête Authorization existe
    const authHeader = req.header('Authorization');
    if (!authHeader) {
      return res.status(401).json({ message: 'Access Denied: No token provided' });
    }

    // Extraire le token
    const token = authHeader.split(' ')[1];
    if (!token) {
      return res.status(401).json({ message: 'Access Denied: Invalid token format' });
    }

    // Vérifier et décoder le token
    const verified = jwt.verify(token, process.env.JWT_SECRET);
    
    // Vérifier que le token décodé contient les informations nécessaires
    if (!verified || !verified.id || !verified.role) {
      return res.status(401).json({ message: 'Access Denied: Token missing required information' });
    }

    // Assigner les informations de l'utilisateur à req.user
    req.user = verified;
    next();
  } catch (err) {
    console.error('Authentication error:', err.message);
    res.status(401).json({ message: 'Invalid Token', error: err.message });
  }
};

module.exports = auth;
