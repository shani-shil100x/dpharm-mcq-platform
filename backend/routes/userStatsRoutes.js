const express = require('express');
const router = express.Router();
const { getUserStats, resetUserStats } = require('../controllers/userStatsController');
const { protect } = require('../middleware/authMiddleware');

router.get('/', protect, getUserStats);
router.delete('/reset', protect, resetUserStats);

module.exports = router;
