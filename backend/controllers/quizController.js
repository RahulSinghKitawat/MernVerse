const Quiz = require('../models/Quiz');
const Course = require('../models/Course');
const Enrollment = require('../models/Enrollment');

// @desc    Get all quizzes for a course
// @route   GET /api/courses/:courseId/quizzes
// @access  Public
exports.getQuizzes = async (req, res, next) => {
  try {
    const quizzes = await Quiz.find({ course: req.params.courseId });

    res.status(200).json({
      success: true,
      count: quizzes.length,
      data: quizzes
    });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
};

// @desc    Get single quiz
// @route   GET /api/quizzes/:id
// @access  Public
exports.getQuiz = async (req, res, next) => {
  try {
    const quiz = await Quiz.findById(req.params.id);

    if (!quiz) {
      return res.status(404).json({ success: false, error: 'Quiz not found' });
    }

    res.status(200).json({
      success: true,
      data: quiz
    });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
};

// @desc    Create new quiz
// @route   POST /api/courses/:courseId/quizzes
// @access  Private (Instructor, Admin)
exports.createQuiz = async (req, res, next) => {
  try {
    req.body.course = req.params.courseId;

    const course = await Course.findById(req.params.courseId);
    if (!course) {
      return res.status(404).json({ success: false, error: 'Course not found' });
    }

    // Make sure user is course instructor or admin
    if (course.instructor.toString() !== req.user.id && req.user.role !== 'Admin') {
      return res.status(401).json({ success: false, error: 'Not authorized to add a quiz to this course' });
    }

    const quiz = await Quiz.create(req.body);

    res.status(201).json({
      success: true,
      data: quiz
    });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
};

// @desc    Update quiz
// @route   PUT /api/quizzes/:id
// @access  Private (Instructor, Admin)
exports.updateQuiz = async (req, res, next) => {
  try {
    let quiz = await Quiz.findById(req.params.id);

    if (!quiz) {
      return res.status(404).json({ success: false, error: 'Quiz not found' });
    }

    quiz = await Quiz.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });

    res.status(200).json({
      success: true,
      data: quiz
    });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
};

// @desc    Delete quiz
// @route   DELETE /api/quizzes/:id
// @access  Private (Instructor, Admin)
exports.deleteQuiz = async (req, res, next) => {
  try {
    const quiz = await Quiz.findById(req.params.id);

    if (!quiz) {
      return res.status(404).json({ success: false, error: 'Quiz not found' });
    }

    await quiz.deleteOne();

    res.status(200).json({
      success: true,
      data: {}
    });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
};


// @desc    Submit quiz answers and get score
// @route   POST /api/quizzes/:id/submit
// @access  Private (Student)
exports.submitQuiz = async (req, res, next) => {
  try {
    const quiz = await Quiz.findById(req.params.id);

    if (!quiz) {
      return res.status(404).json({ success: false, error: 'Quiz not found' });
    }

    const { answers } = req.body; // array of selected option indices

    if (!answers || !Array.isArray(answers)) {
      return res.status(400).json({ success: false, error: 'Please provide an array of answers' });
    }

    let score = 0;
    quiz.questions.forEach((question, index) => {
      if (answers[index] === question.correctOptionIndex) {
        score++;
      }
    });

    // Save to enrollment
    const enrollment = await Enrollment.findOne({ student: req.user.id, course: quiz.course });
    if (enrollment) {
      const existingScoreIndex = enrollment.quizScores.findIndex(qs => qs.quiz.toString() === quiz._id.toString());
      if (existingScoreIndex !== -1) {
        enrollment.quizScores[existingScoreIndex].score = score;
        enrollment.quizScores[existingScoreIndex].total = quiz.questions.length;
      } else {
        enrollment.quizScores.push({
          quiz: quiz._id,
          score,
          total: quiz.questions.length
        });
      }
      await enrollment.save();
    }

    res.status(200).json({
      success: true,
      score,
      total: quiz.questions.length
    });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
};
