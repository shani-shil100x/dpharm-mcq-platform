const mongoose = require('mongoose');

const chapterSchema = new mongoose.Schema(
  {
    subjectId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Subject',
      required: true,
    },
    chapterName: {
      type: String,
      required: true,
    },
    totalQuestions: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

// Optional: Prevent duplicate chapter names within the same subject
chapterSchema.index({ subjectId: 1, chapterName: 1 }, { unique: true });

const Chapter = mongoose.model('Chapter', chapterSchema);
module.exports = Chapter;
