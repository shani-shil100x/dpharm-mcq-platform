const Subject = require('../models/Subject');
const Question = require('../models/Question');
const UserStats = require('../models/UserStats');
const ExamResult = require('../models/ExamResult');

// @desc    Get all subjects
// @route   GET /api/subjects
// @access  Public
const getSubjects = async (req, res, next) => {
  try {
    // 1. High-Performance MongoDB Aggregation
    // This replaces an N+1 query bottleneck by having the database do the counting
    // rather than dragging all documents into Node.js and looping them.
    const subjectsWithCounts = await Subject.aggregate([
      {
        $lookup: {
          from: 'questions',         // The collection name in MongoDB for Question model
          localField: '_id',         // Subject's _id
          foreignField: 'subjectId', // Question's subjectId reference
          as: 'questionsList',
        },
      },
      {
        $project: {
          _id: 1,
          subjectName: 1,
          subjectIcon: 1,
          createdAt: 1,
          updatedAt: 1,
          totalQuestions: { $size: '$questionsList' }, // Instantly get the count
        },
      },
      {
        $sort: { subjectName: 1 } // Ensure consistent alphabetical ordering
      }
    ]);

    res.json(subjectsWithCounts);
  } catch (error) {
    next(error);
  }
};

// @desc    Create a subject
// @route   POST /api/admin/subjects
// @access  Private/Admin
const createSubject = async (req, res, next) => {
  try {
    const { subjectName, subjectIcon } = req.body;

    const subjectExists = await Subject.findOne({ subjectName });
    if (subjectExists) {
      res.status(400);
      throw new Error('Subject already exists');
    }

    const subject = new Subject({
      subjectName,
      subjectIcon,
    });

    const createdSubject = await subject.save();
    res.status(201).json(createdSubject);
  } catch (error) {
    next(error);
  }
};

// @desc    Update a subject
// @route   PUT /api/admin/subjects/:id
// @access  Private/Admin
const updateSubject = async (req, res, next) => {
  try {
    const { subjectName, subjectIcon } = req.body;

    const subject = await Subject.findById(req.params.id);

    if (subject) {
      if (subjectName) subject.subjectName = subjectName;
      if (subjectIcon) subject.subjectIcon = subjectIcon;

      const updatedSubject = await subject.save();
      res.json(updatedSubject);
    } else {
      res.status(404);
      throw new Error('Subject not found');
    }
  } catch (error) {
    next(error);
  }
};

// @desc    Delete a subject
// @route   DELETE /api/admin/subjects/:id
// @access  Private/Admin
const deleteSubject = async (req, res, next) => {
  try {
    const subject = await Subject.findById(req.params.id);

    if (subject) {
      // Cascade delete all dependent data
      await Question.deleteMany({ subjectId: subject._id });
      await UserStats.deleteMany({ subjectId: subject._id });
      await ExamResult.deleteMany({ subjectId: subject._id });
      
      await subject.deleteOne();
      res.json({ message: 'Subject removed' });
    } else {
      res.status(404);
      throw new Error('Subject not found');
    }
  } catch (error) {
    next(error);
  }
};

module.exports = { getSubjects, createSubject, updateSubject, deleteSubject };
