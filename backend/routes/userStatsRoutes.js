const express = require('express');
const router = express.Router();
const { getUserStats } = require('../controllers/userStatsController');
const { protect } = require('../middleware/authMiddleware');

router.get('/', protect, getUserStats);

module.exports = router;
