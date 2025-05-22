const express = require('express');
const axios = require('axios');
const jwt = require('jsonwebtoken');

const app = express();
const PORT = 3002;
const JWT_SECRET = '123456';

// URLs des microservices
const CRM_SERVICE_URL = 'http://localhost:3000'; // Projet NestJS original

// Middleware
app.use(express.json());

// Middleware d'authentification
const authMiddleware = (req, res, next) => {
  const token = req.headers.authorization?.replace('Bearer ', '');
  
  if (!token) {
    return res.status(401).json({ 
      statusCode: 401,
      message: 'Unauthorized' 
    });
  }
  
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({ 
      statusCode: 401,
      message: 'Invalid token' 
    });
  }
};

// PROXY ROUTES

// POST /auth/token - Proxy vers le service NestJS
app.post('/auth/token', async (req, res) => {
  try {
    console.log(`🔄 Proxying login to ${CRM_SERVICE_URL}/auth/token`);
    
    const response = await axios.post(`${CRM_SERVICE_URL}/auth/token`, req.body, {
      headers: {
        'Content-Type': 'application/json'
      },
      timeout: 5000 // 5 secondes de timeout
    });
    
    console.log('Login successful, forwarding token');
    res.json(response.data);
    
  } catch (error) {
    console.error('Login failed:', error.message);
    
    if (error.code === 'ECONNREFUSED') {
      return res.status(503).json({
        statusCode: 503,
        message: 'Auth service unavailable'
      });
    }
    
    if (error.response) {
      // Le service a répondu avec une erreur
      return res.status(error.response.status).json(error.response.data);
    }
    
    // Erreur générique
    res.status(500).json({
      statusCode: 500,
      message: 'Internal server error'
    });
  }
});

// ROUTES LOCALES (gérées par l'API Gateway)

// GET / - Hello World (protégé par l'API Gateway)
app.get('/', authMiddleware, (req, res) => {
  res.send('Hello World!');
});

// GET /users/profile - Exemple de route qui pourrait proxy vers un Users Service
app.get('/users/profile', authMiddleware, async (req, res) => {
  try {
    // Pour l'instant, pas de Users Service séparé, donc on retourne une réponse locale
    res.json({
      message: 'This would be proxied to Users Service',
      user: {
        id: req.user.sub,
        service: 'API Gateway'
      }
    });
    
    // Version proxy (si tu as un Users Service sur port 3002) :
    /*
    const response = await axios.get(`http://localhost:3002/profile`, {
      headers: {
        'Authorization': req.headers.authorization
      }
    });
    res.json(response.data);
    */
    
  } catch (error) {
    console.error('❌ Users service error:', error.message);
    res.status(500).json({ message: 'Users service unavailable' });
  }
});

// Health check (avec vérification des services)
app.get('/health', async (req, res) => {
  const services = {
    'API Gateway': 'OK',
    'Auth Service': 'Unknown'
  };
  
  // Vérifier si le service NestJS est up
  try {
    await axios.get(`${CRM_SERVICE_URL}/health`, { timeout: 2000 });
    services['Auth Service'] = 'OK';
  } catch (error) {
    services['Auth Service'] = 'DOWN';
  }
  
  res.json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    services
  });
});

// Gestion 404
app.use('*', (req, res) => {
  res.status(404).json({ 
    statusCode: 404,
    message: 'Route not found' 
  });
});

// Démarrage du serveur
app.listen(PORT, () => {
  console.log(`🚀 API Gateway running on port ${PORT}`);
  console.log(`🔗 Proxying to CRM Service: ${CRM_SERVICE_URL}`);
  console.log(`📋 Health check: http://localhost:${PORT}/health`);
  console.log(`🔐 Login (proxied): POST http://localhost:${PORT}/auth/token`);
  console.log(`👋 Hello (local): GET http://localhost:${PORT}/`);
  console.log('');
  console.log('⚠️  Make sure the NestJS CRM service is running on port 3001!');
});