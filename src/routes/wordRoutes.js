// routes/wordRoutes.js
const express = require('express');
const wordController = require('../controllers/wordController.js');
const router = express.Router();

// Rutas para la API de palabras
router.get('/', wordController.getAllWords);
router.get('/ids', wordController.getAllWordsIds);
router.get('/word', wordController.getWordById);
router.post('/room', wordController.getWordsByRoom);
router.post('/', wordController.createWord);
router.put('/', wordController.updateWord);
router.delete('/:id', wordController.deleteWord);
router.get('/failsType/:roomId', wordController.failsType);
router.get('/failsPast/:roomId', wordController.failsPast);
router.get('/inactive/:roomId', wordController.getInactiveWords);

module.exports = router;