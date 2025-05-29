const express = require('express');
const router = express.Router();
const roomgameController = require('../controllers/roomgameController');

router.get('/', roomgameController.getRoomByCode);
router.post('/new', roomgameController.newGame);
router.post('/detail', roomgameController.addGameDetail);
router.post('/finish', roomgameController.finishGame);
router.post('/tablaroom', roomgameController.getRoomLeaderboard);

module.exports = router;
