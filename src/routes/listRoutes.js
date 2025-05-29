// routes/wordRoutes.js
const express = require('express');
const listController = require('../controllers/listController.js');
const router = express.Router();

// Rutas para la API de palabras
router.get('/', listController.getAllLists);
router.get('/list', listController.getListById);
router.get('/words', listController.getWordsByList);
router.get('/words/ids', listController.getAllListsIds);
router.post('/words', listController.addWords);
router.post('/', listController.createList);
router.put('/', listController.updateList);
router.delete('/:id', listController.deleteList);

module.exports = router;