// backend/server.js - Archivo principal del servidor

const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');

// Cargar variables de entorno
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors({
  origin: ['https://hangman-astro.vercel.app', 'http://localhost:4321']
}));
app.use(express.json()); // Para parsear JSON en el body

// Importar rutas
const userRoutes = require('./src/routes/userRoutes');
const wordRoutes = require('./src/routes/wordRoutes');
const arenagameRoutes = require('./src/routes/arenagameRoutes');
const timestampsRoutes = require('./src/routes/timestampsRoutes');

// Usar rutas
app.use('/api/users', userRoutes);
app.use('/api/words', wordRoutes);
app.use('/api/arenagame', arenagameRoutes);
app.use('/api/timestamps', timestampsRoutes);

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