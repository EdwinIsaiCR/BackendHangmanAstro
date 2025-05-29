// routes/wordRoutes.js
const express = require('express');
const roomController = require('../controllers/roomController.js');
const router = express.Router();

// Rutas para la API de palabras
router.get('/', roomController.getAllRooms);
router.get('/room', roomController.getRoomById);
router.post('/', roomController.createRoom);
router.put('/', roomController.updateRoom);
router.delete('/:id', roomController.deleteRoom);
router.get('/checkCode', roomController.checkCode);
router.post('/check', roomController.checkRoom);
router.post('/words', roomController.addWords);
router.delete('/words/:roomId', roomController.deleteWords);
router.get('/:roomId/players', roomController.getPlayers);
router.get('/:roomId/words', roomController.getWords);
router.get('/infoUser/:gameroomid', roomController.infoUser);

module.exports = router;