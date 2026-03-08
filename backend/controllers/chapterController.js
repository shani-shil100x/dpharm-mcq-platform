const Chapter = require('../models/Chapter');
const Question = require('../models/Question');

// @desc    Get chapters by subjectId
// @route   GET /api/chapters?subjectId=x
// @access  Public
const getChapters = async (req, res, next) => {
  try {
    const { subjectId } = req.query;

    if (!subjectId) {
      res.status(400);
      throw new Error('subjectId is required');
    }

    // Use aggregation to count questions per chapter
    const chaptersWithCounts = await Chapter.aggregate([
      {
        $match: { subjectId: new (require('mongoose').Types.ObjectId)(subjectId) }
      },
      {
        $lookup: {
          from: 'questions',
          localField: '_id',
          foreignField: 'chapterId',
          as: 'questionsList',
        },
      },
      {
        $project: {
          _id: 1,
          subjectId: 1,
          chapterName: 1,
          createdAt: 1,
          updatedAt: 1,
          totalQuestions: { $size: '$questionsList' },
        },
      },
      {
        $sort: { createdAt: 1 } // Sort by creation order
      }
    ]);

    res.json(chaptersWithCounts);
  } catch (error) {
    next(error);
  }
};

// @desc    Create a chapter
// @route   POST /api/admin/chapters
// @access  Private/Admin
const createChapter = async (req, res, next) => {
  try {
    const { subjectId, chapterName } = req.body;

    if (!subjectId || !chapterName) {
      res.status(400);
      throw new Error('Please provide subjectId and chapterName');
    }

    const chapterExists = await Chapter.findOne({ subjectId, chapterName });
    if (chapterExists) {
      res.status(400);
      throw new Error('Chapter already exists in this subject');
    }

    const chapter = new Chapter({
      subjectId,
      chapterName,
    });

    const createdChapter = await chapter.save();
    
    // Convert to object and add totalQuestions for frontend consistency
    const responseChapter = createdChapter.toObject();
    responseChapter.totalQuestions = 0;
    
    res.status(201).json(responseChapter);
  } catch (error) {
    next(error);
  }
};

// @desc    Update a chapter
// @route   PUT /api/admin/chapters/:id
// @access  Private/Admin
const updateChapter = async (req, res, next) => {
  try {
    const { chapterName } = req.body;

    const chapter = await Chapter.findById(req.params.id);

    if (chapter) {
      if (chapterName) chapter.chapterName = chapterName;

      const updatedChapter = await chapter.save();
      
      // Need to recount questions to send back a complete object
      const totalQuestions = await Question.countDocuments({ chapterId: chapter._id });
      const responseChapter = updatedChapter.toObject();
      responseChapter.totalQuestions = totalQuestions;

      res.json(responseChapter);
    } else {
      res.status(404);
      throw new Error('Chapter not found');
    }
  } catch (error) {
    next(error);
  }
};

// @desc    Delete a chapter
// @route   DELETE /api/admin/chapters/:id
// @access  Private/Admin
const deleteChapter = async (req, res, next) => {
  try {
    const chapter = await Chapter.findById(req.params.id);

    if (chapter) {
      // Cascade delete all dependent questions
      await Question.deleteMany({ chapterId: chapter._id });
      
      await chapter.deleteOne();
      res.json({ message: 'Chapter removed' });
    } else {
      res.status(404);
      throw new Error('Chapter not found');
    }
  } catch (error) {
    next(error);
  }
};

module.exports = { getChapters, createChapter, updateChapter, deleteChapter };
