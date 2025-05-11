// Configuración de rutas para los controladores timestamps y arenagame
const express = require('express');
const timestampsController = require('../controllers/timestampsController.js');

const router = express.Router();

// Rutas para timestamps
router.get('/timestamp', timestampsController.getTimestamp);


    
module.exports = router;