const express = require('express');
const {
  getQuizzes,
  getQuiz,
  createQuiz,
  submitQuiz,
  updateQuiz,
  deleteQuiz
} = require('../controllers/quizController');

const router = express.Router({ mergeParams: true }); // Merge params to get courseId from other routers

const { protect, authorize } = require('../middleware/auth');

/**
 * @swagger
 * tags:
 *   name: Quizzes
 *   description: Quiz management
 */

/**
 * @swagger
 * /api/quizzes:
 *   get:
 *     summary: Get all quizzes
 *     tags: [Quizzes]
 *     responses:
 *       200:
 *         description: List of quizzes
 *   post:
 *     summary: Create a new quiz
 *     tags: [Quizzes]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *               courseId:
 *                 type: string
 *     responses:
 *       201:
 *         description: Quiz created
 */
router
  .route('/')
  .get(getQuizzes)
  .post(protect, authorize('Instructor', 'Admin'), createQuiz);

/**
 * @swagger
 * /api/quizzes/{id}:
 *   get:
 *     summary: Get a single quiz
 *     tags: [Quizzes]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Quiz details
 *   put:
 *     summary: Update a quiz
 *     tags: [Quizzes]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *     responses:
 *       200:
 *         description: Quiz updated
 *   delete:
 *     summary: Delete a quiz
 *     tags: [Quizzes]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Quiz deleted
 */
router
  .route('/:id')
  .get(getQuiz)
  .put(protect, authorize('Instructor', 'Admin'), updateQuiz)
  .delete(protect, authorize('Instructor', 'Admin'), deleteQuiz);

/**
 * @swagger
 * /api/quizzes/{id}/submit:
 *   post:
 *     summary: Submit a quiz
 *     tags: [Quizzes]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               answers:
 *                 type: array
 *                 items:
 *                   type: object
 *     responses:
 *       200:
 *         description: Quiz submitted successfully
 */
router
  .route('/:id/submit')
  .post(protect, submitQuiz);

module.exports = router;
