const mongoose = require('mongoose');
const dotenv = require('dotenv');
const bcrypt = require('bcryptjs');
const User = require('./models/User');
const Subject = require('./models/Subject');
const Question = require('./models/Question');

dotenv.config();

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/dpharm-mcq');
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`Error: ${error.message}`);
    process.exit(1);
  }
};

const seedData = async () => {
  try {
    await connectDB();

    // Clear existing data (Be careful with this in production!)
    await User.deleteMany();
    await Subject.deleteMany();
    await Question.deleteMany();

    console.log('Data Cleared!');

    // Create Admin User
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash('admin123', salt);

    const adminUser = await User.create({
      name: 'Admin User',
      email: 'admin@dpharm.com',
      password: hashedPassword,
      role: 'admin',
    });

    console.log('Admin user created (admin@dpharm.com / admin123)');

    // Create Sample Subjects
    const subjects = await Subject.insertMany([
      { subjectName: 'Pharmaceutics', subjectIcon: 'Pill', totalQuestions: 5 },
      { subjectName: 'Pharmaceutical Chemistry', subjectIcon: 'TestTubes', totalQuestions: 5 },
      { subjectName: 'Pharmacognosy', subjectIcon: 'Leaf', totalQuestions: 0 },
      { subjectName: 'Human Anatomy and Physiology', subjectIcon: 'HeartPulse', totalQuestions: 0 },
      { subjectName: 'Social Pharmacy', subjectIcon: 'Users', totalQuestions: 0 },
    ]);

    console.log('Subjects created');

    const pharmaceuticsId = subjects[0]._id;
    const chemistryId = subjects[1]._id;

    // Create Sample Questions
    await Question.insertMany([
      {
        subjectId: pharmaceuticsId,
        questionText: 'Which dosage form is designed to dissolve in the mouth?',
        options: ['Capsule', 'Tablet', 'Lozenge', 'Suppository'],
        correctAnswer: 'Lozenge',
      },
      {
        subjectId: pharmaceuticsId,
        questionText: 'Syrups are concentrated, aqueous preparations of a sugar or sugar substitute with or without added flavoring agents and medicinal substances.',
        options: ['True', 'False', 'Only sometimes', 'Depends on temperature'],
        correctAnswer: 'True',
      },
      {
        subjectId: pharmaceuticsId,
        questionText: 'What is the most common solvent used in liquid dosage forms?',
        options: ['Alcohol', 'Water', 'Glycerin', 'Propylene glycol'],
        correctAnswer: 'Water',
      },
      {
        subjectId: pharmaceuticsId,
        questionText: 'Which route of administration bypasses the first-pass metabolism completely?',
        options: ['Oral', 'Intravenous', 'Rectal', 'Sublingual'],
        correctAnswer: 'Intravenous',
      },
      {
        subjectId: pharmaceuticsId,
        questionText: 'Ointments are typically what type of emulsion?',
        options: ['Oil-in-water', 'Water-in-oil', 'Solid-in-liquid', 'Gas-in-liquid'],
        correctAnswer: 'Water-in-oil',
      },
      // Chemistry Questions
      {
        subjectId: chemistryId,
        questionText: 'What is the chemical formula for common table salt?',
        options: ['NaCl', 'KCl', 'CaCl2', 'MgCl2'],
        correctAnswer: 'NaCl',
      },
      {
        subjectId: chemistryId,
        questionText: 'Which functional group characterizes alcohols?',
        options: ['-COOH', '-OH', '-NH2', '-CHO'],
        correctAnswer: '-OH',
      },
      {
        subjectId: chemistryId,
        questionText: 'Aspirin is chemically known as:',
        options: ['Acetaminophen', 'Ibuprofen', 'Acetylsalicylic acid', 'Salicylic acid'],
        correctAnswer: 'Acetylsalicylic acid',
      },
      {
        subjectId: chemistryId,
        questionText: 'Which of the following describes an acid according to the Bronsted-Lowry theory?',
        options: ['Electron pair acceptor', 'Proton donor', 'Proton acceptor', 'Hydroxide donor'],
        correctAnswer: 'Proton donor',
      },
      {
        subjectId: chemistryId,
        questionText: 'What is the pH of a neutral solution at 25°C?',
        options: ['0', '7', '14', '1'],
        correctAnswer: '7',
      }
    ]);

    console.log('Questions seeded!');
    console.log('Seeding process complete!');
    process.exit();
  } catch (error) {
    console.error(`${error}`);
    process.exit(1);
  }
};

seedData();
