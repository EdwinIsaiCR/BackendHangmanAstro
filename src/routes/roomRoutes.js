const express = require('express');
const roomController = require('../controllers/roomController.js');
const router = express.Router();

router.get('/', roomController.getAllRooms);
router.get('/room', roomController.getRoomById);
router.get('/:roomId/players', roomController.getPlayers);
router.get('/:roomId/words', roomController.getWords);
router.get('/infoUser/:gameroomid', roomController.infoUser);
router.get('/checkList', roomController.checkList);
router.get('/checkCode', roomController.checkCode);
router.post('/check', roomController.checkRoom);
router.post('/', roomController.createRoom);
router.post('/words', roomController.addWords);
router.put('/', roomController.updateRoom);
router.delete('/:id', roomController.deleteRoom);
router.delete('/words/:roomId', roomController.deleteWords);

module.exports = router;