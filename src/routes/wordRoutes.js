// routes/wordRoutes.js
const express = require('express');
const wordController = require('../controllers/wordController.js');
const router = express.Router();

// Rutas para la API de palabras
router.get('/', wordController.getAllWords);
router.post('/room', wordController.getWordsByRoom);
router.post('/', wordController.createWord);
router.put('/', wordController.updateWord);
router.delete('/:id', wordController.deleteWord);

module.exports = router;