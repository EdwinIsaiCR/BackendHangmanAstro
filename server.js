const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const session = require('express-session');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

app.use(cors({
  origin: ['https://hangman-astro.vercel.app', 'http://localhost:4321'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Cookie'],
  exposedHeaders: ['Set-Cookie']
}));

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
    domain: process.env.NODE_ENV === 'production' 
    ? process.env.COOKIE_DOMAIN // ej: '.tu-dominio.com'
    : undefined // localhost en desarrollo
  }
};

app.use(session(sessionConfig));

app.use((req, res, next) => {
  console.log('=== REQUEST DEBUG ===');
  console.log('Method:', req.method);
  console.log('Path:', req.path);
  console.log('Origin:', req.get('origin'));
  console.log('Cookie header:', req.get('cookie'));
  console.log('Session ID:', req.sessionID);
  console.log('User ID en sesión:', req.session?.userId);
  console.log('Headers importantes:', {
    'content-type': req.get('content-type'),
    'user-agent': req.get('user-agent'),
    'referer': req.get('referer')
  });
  console.log('==================');
  next();
});

app.get('/api/check-session', (req, res) => {
  console.log('=== CHECK SESSION DETALLADO ===');
  console.log('Session ID:', req.sessionID);
  console.log('Cookie recibida:', req.get('cookie'));
  console.log('Session object:', JSON.stringify(req.session, null, 2));
  console.log('User ID:', req.session?.userId);
  console.log('User Role:', req.session?.userRole);
  console.log('Session regenerated:', !!req.session.regenerate);
  console.log('==============================');
  
  if (req.session?.userId) {
    res.json({ 
      isLoggedIn: true,
      userId: req.session.userId,
      userRole: req.session.userRole,
      email: req.session.email,
      sessionId: req.sessionID,
      timestamp: new Date().toISOString()
    });
  } else {
    res.json({ 
      isLoggedIn: false,
      sessionId: req.sessionID,
      hasSession: !!req.session,
      timestamp: new Date().toISOString()
    });
  }
});

// Endpoint para limpiar todas las sesiones (útil para desarrollo)
app.post('/api/auth/clear-all-sessions', (req, res) => {
  if (process.env.NODE_ENV !== 'development') {
    return res.status(403).json({ 
      success: false, 
      message: 'Solo disponible en desarrollo' 
    });
  }
  
  // Si usas express-session con store, puedes limpiar todas las sesiones
  // req.sessionStore.clear((err) => {
  //   if (err) {
  //     return res.status(500).json({ success: false, message: 'Error al limpiar sesiones' });
  //   }
  //   res.json({ success: true, message: 'Todas las sesiones limpiadas' });
  // });
  
  res.json({ success: true, message: 'Funcionalidad no implementada' });
});

app.get('/api/test-cookies', (req, res) => {
  console.log('=== TEST COOKIES ===');
  console.log('Headers:', req.headers);
  console.log('Cookies parseadas:', req.cookies);
  console.log('Session:', req.session);
  console.log('==================');
  
  res.json({
    receivedCookies: req.get('cookie'),
    parsedCookies: req.cookies,
    sessionId: req.sessionID,
    hasSession: !!req.session,
    sessionData: req.session
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