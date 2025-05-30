const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const session = require('express-session');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

// Configuración mejorada de CORS
app.use(cors({
  origin: ['http://localhost:4321', 'https://hangman-astro.vercel.app'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  exposedHeaders: ['set-cookie']
}));

// Configuración mejorada de sesión
const sessionConfig = {
  secret: process.env.SESSION_SECRET || 'fallback-secret',
  resave: false,
  saveUninitialized: false,
  name: 'hangman.sid',
  cookie: {
    secure: process.env.NODE_ENV === 'production',
    httpOnly: true,
    maxAge: 24 * 60 * 60 * 1000, // 1 día
    sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
    domain: process.env.NODE_ENV === 'production' 
      ? '.up.railway.app' 
      : 'localhost' // Dominio explícito para desarrollo
  }
};

app.use(session(sessionConfig));

app.get('/api/check-session', (req, res) => {
  console.log('Sesión actual:', req.session);
  
  if (!req.session.userId) {
    return res.json({ 
      isLoggedIn: false,
      sessionId: req.sessionID
    });
  }

  // Actualizar tiempo de expiración
  req.session.touch();
  
  res.json({
    isLoggedIn: true,
    userId: req.session.userId,
    userRole: req.session.userRole,
    email: req.session.email,
    sessionId: req.sessionID
  });
});


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