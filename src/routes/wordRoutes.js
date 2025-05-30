const express = require('express');
const wordController = require('../controllers/wordController.js');
const router = express.Router();

router.get('/', wordController.getAllWords);
router.get('/ids', wordController.getAllWordsIds);
router.get('/word', wordController.getWordById);
router.get('/failsType/:roomId', wordController.failsType);
router.get('/failsPast/:roomId', wordController.failsPast);
router.get('/inactive/:roomId', wordController.getInactiveWords);
router.post('/room', wordController.getWordsByRoom);
router.post('/', wordController.createWord);
router.put('/', wordController.updateWord);
router.delete('/:id', wordController.deleteWord);

module.exports = router;