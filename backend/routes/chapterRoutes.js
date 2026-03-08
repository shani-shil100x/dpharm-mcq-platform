const express = require('express');
const router = express.Router();
const { getChapters, createChapter, updateChapter, deleteChapter } = require('../controllers/chapterController');
const { protect, admin } = require('../middleware/authMiddleware');

router.route('/')
  .get(getChapters)
  .post(protect, admin, createChapter);

router.route('/:id')
  .put(protect, admin, updateChapter)
  .delete(protect, admin, deleteChapter);

module.exports = router;
