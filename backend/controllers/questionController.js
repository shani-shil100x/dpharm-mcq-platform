const Question = require('../models/Question');
const Subject = require('../models/Subject');

// @desc    Get questions by subjectId
// @route   GET /api/questions?subjectId=x&page=1&limit=10
// @access  Public
const getQuestions = async (req, res, next) => {
  try {
    const { subjectId, page = 1, limit = 10 } = req.query;

    if (!subjectId) {
      res.status(400);
      throw new Error('subjectId is required');
    }

    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);

    const questions = await Question.find({ subjectId })
      .skip((pageNum - 1) * limitNum)
      .limit(limitNum);

    const total = await Question.countDocuments({ subjectId });

    res.json({
      questions,
      page: pageNum,
      pages: Math.ceil(total / limitNum),
      total,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Bulk upload questions
// @route   POST /api/admin/questions/bulk-upload
// @access  Private/Admin
const bulkUploadQuestions = async (req, res, next) => {
  try {
    const { subjectId, rawText } = req.body;

    if (!subjectId || !rawText) {
      res.status(400);
      throw new Error('Please provide subjectId and rawText');
    }

    const subject = await Subject.findById(subjectId);
    if (!subject) {
      res.status(404);
      throw new Error('Subject not found');
    }

    // Split text by double new lines to get individual question blocks
    const blocks = rawText.trim().split(/\n\s*\n/);
    const questionsToInsert = [];

    blocks.forEach((block) => {
      const lines = block.split('\n').filter((line) => line.trim() !== '');
      if (lines.length >= 6) {
        // Find question line (starts with Q..:)
        const qLineIndex = lines.findIndex(line => /^Q\d*:/.test(line) || /^[0-9]+\./.test(line) || line.toLowerCase().startsWith('q'));
        const aIndex = lines.findIndex(line => /^A\./i.test(line));
        const bIndex = lines.findIndex(line => /^B\./i.test(line));
        const cIndex = lines.findIndex(line => /^C\./i.test(line));
        const dIndex = lines.findIndex(line => /^D\./i.test(line));
        const ansIndex = lines.findIndex(line => /^Answer:/i.test(line));

        if (qLineIndex !== -1 && aIndex !== -1 && bIndex !== -1 && cIndex !== -1 && dIndex !== -1 && ansIndex !== -1) {
          const questionText = lines[qLineIndex].replace(/^Q\d*:\s*/i, '').replace(/^[0-9]+\.\s*/, '').trim();
          const options = [
            lines[aIndex].trim(),
            lines[bIndex].trim(),
            lines[cIndex].trim(),
            lines[dIndex].trim()
          ];
          const correctAnswer = lines[ansIndex].replace(/^Answer:\s*/i, '').trim();

          questionsToInsert.push({
            subjectId,
            questionText,
            options,
            correctAnswer,
          });
        }
      }
    });

    if (questionsToInsert.length === 0) {
      res.status(400);
      throw new Error('No valid questions found in the text. Please check format.');
    }

    await Question.insertMany(questionsToInsert);
    
    res.status(201).json({
      message: `${questionsToInsert.length} questions successfully uploaded!`,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update a question
// @route   PUT /api/admin/questions/:id
// @access  Private/Admin
const updateQuestion = async (req, res, next) => {
  try {
    const { questionText, options, correctAnswer } = req.body;
    const question = await Question.findById(req.params.id);

    if (question) {
      question.questionText = questionText || question.questionText;
      question.options = options || question.options;
      question.correctAnswer = correctAnswer || question.correctAnswer;

      const updatedQuestion = await question.save();
      res.json(updatedQuestion);
    } else {
      res.status(404);
      throw new Error('Question not found');
    }
  } catch (error) {
    next(error);
  }
};

// @desc    Delete a question
// @route   DELETE /api/admin/questions/:id
// @access  Private/Admin
const deleteQuestion = async (req, res, next) => {
  try {
    const question = await Question.findById(req.params.id);

    if (question) {
      await question.deleteOne();
      res.json({ message: 'Question removed' });
    } else {
      res.status(404);
      throw new Error('Question not found');
    }
  } catch (error) {
    next(error);
  }
};

module.exports = { getQuestions, bulkUploadQuestions, updateQuestion, deleteQuestion };
