const express = require('express');
const arenagameController = require('../controllers/arenagameController.js');

const router = express.Router();

// Rutas para arenagame
router.post('/insertar', arenagameController.insertarJuego);
router.post('/nuevo', arenagameController.nuevoJuego);
router.post('/fin', arenagameController.finalizarJuego);
router.get('/tablaGeneral', arenagameController.obtenerTablaGeneral);

module.exports = router;
