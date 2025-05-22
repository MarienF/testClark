const express = require('express');
const axios = require('axios');
const jwt = require('jsonwebtoken');
require('dotenv').config();

const app = express();
const PORT = 3002;
const JWT = process.env.JWT_SECRET;

// URLs des microservices
const CRM_SERVICE_URL = 'http://localhost:3000';

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
    const decoded = jwt.verify(token, JWT);
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({ 
      statusCode: 401,
      message: 'Invalid token' 
    });
  }
};

// POST /auth/token - Proxy vers le service NestJS
app.post('/auth/token', async (req, res) => {
  try {
    const response = await axios.post(`${CRM_SERVICE_URL}/auth/token`, req.body, {
      headers: {
        'Content-Type': 'application/json'
      },
      timeout: 5000
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


// GET / - Hello World
app.get('/', authMiddleware, (req, res) => {
  res.send('Hello World!');
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
	console.log(`API Gateway running on port ${PORT}`);
});