const express = require('express');
const timestampsController = require('../controllers/timestampsController.js');
const router = express.Router();

router.get('/timestamp', timestampsController.getTimestamp);

module.exports = router;    