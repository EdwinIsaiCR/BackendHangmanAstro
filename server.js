// backend/server.js - Archivo principal del servidor

const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const session = require('express-session');

// Cargar variables de entorno
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());
// En server.js - CORS configurado correctamente
app.use(cors({
  origin: ['https://hangman-astro.vercel.app', 'http://localhost:4321'],
  credentials: true, // ESTO ES CRUCIAL
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Cookie'],
  exposedHeaders: ['Set-Cookie']
}));

// Middleware adicional para debugging de cookies
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
  console.log('Headers recibidos:', {
    cookie: req.headers.cookie,
    'user-agent': req.headers['user-agent']?.substring(0, 50) + '...',
    origin: req.headers.origin
  });
  
  if (req.session) {
    console.log('Session ID:', req.sessionID);
    console.log('User ID en sesión:', req.session.userId);
  }
  next();
});

// Configuración de sesión (sin cambios pero con más debug)
const sessionConfig = {
  secret: process.env.SESSION_SECRET || 'brains908',
  resave: false,
  saveUninitialized: false,
  name: 'connect.sid',
  cookie: { 
    secure: process.env.NODE_ENV === 'production',
    httpOnly: true,
    maxAge: 24 * 60 * 60 * 1000,
    sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
    domain: process.env.NODE_ENV === 'production' ? undefined : 'localhost' // Solo en desarrollo
  },
  rolling: false,
  unset: 'destroy'
};

app.use(session(sessionConfig));

// Check session CON MÁS LOGS
app.get('/api/check-session', (req, res) => {
  console.log('=== CHECK SESSION ===');
  console.log('Session ID:', req.sessionID);
  console.log('User ID:', req.session.userId);
  console.log('Role:', req.session.userRole);
  console.log('Toda la sesión:', JSON.stringify(req.session, null, 2));
  console.log('Cookies:', req.headers.cookie);
  console.log('===================');
  
  if (req.session.userId) {
    res.json({ 
      isLoggedIn: true,
      userId: req.session.userId,
      userRole: req.session.userRole,
      sessionId: req.sessionID // Para debugging
    });
  } else {
    res.json({ 
      isLoggedIn: false,
      sessionId: req.sessionID // Para debugging
    });
  }
});

// Importar rutas
const userRoutes = require('./src/routes/userRoutes');
const wordRoutes = require('./src/routes/wordRoutes');
const arenagameRoutes = require('./src/routes/arenagameRoutes');
const timestampsRoutes = require('./src/routes/timestampsRoutes');
const authRoutes = require('./src/routes/authRoutes');
const listRoutes = require('./src/routes/listRoutes');
const roomRoutes = require('./src/routes/roomRoutes');
const roomgameRoutes = require('./src/routes/roomgameRoutes');

// Usar rutas
app.use('/api/users', userRoutes);
app.use('/api/words', wordRoutes);
app.use('/api/arenagame', arenagameRoutes);
app.use('/api/timestamps', timestampsRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/lists', listRoutes);
app.use('/api/rooms', roomRoutes);
app.use('/api/roomgame', roomgameRoutes);

// Ruta de prueba
app.get('/api/test', (req, res) => {
  res.json({ message: 'API funcionando correctamente' });
});

// Manejador de errores
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    success: false,
    message: 'Error en el servidor',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

// Iniciar servidor
app.listen(PORT, () => {
  console.log(`Servidor ejecutándose en http://localhost:${PORT}`);
});