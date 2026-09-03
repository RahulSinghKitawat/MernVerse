const express = require('express');
const {
  getCourses,
  getCourse,
  createCourse,
  updateCourse,
  deleteCourse,
  getCourseStudents,
  getInstructorStats
} = require('../controllers/courseController');

const router = express.Router();

const { protect, authorize } = require('../middleware/auth');
const { enrollCourse } = require('../controllers/progressController');

// Include other resource routers
const quizRouter = require('./quizRoutes');

// Re-route into other resource routers
router.use('/:courseId/quizzes', quizRouter);

/**
 * @swagger
 * tags:
 *   name: Courses
 *   description: Course management
 */

/**
 * @swagger
 * /api/courses/{courseId}/enroll:
 *   post:
 *     summary: Enroll in a course
 *     tags: [Courses]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: courseId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Successfully enrolled
 */
router
  .route('/:courseId/enroll')
  .post(protect, authorize('Student'), enrollCourse);

/**
 * @swagger
 * /api/courses/instructor/stats:
 *   get:
 *     summary: Get instructor statistics
 *     tags: [Courses]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Successfully retrieved stats
 */
router
  .route('/instructor/stats')
  .get(protect, authorize('Instructor', 'Admin'), getInstructorStats);

/**
 * @swagger
 * /api/courses/{courseId}/students:
 *   get:
 *     summary: Get students enrolled in a course
 *     tags: [Courses]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: courseId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Successfully retrieved students
 */
router
  .route('/:courseId/students')
  .get(protect, authorize('Instructor', 'Admin'), getCourseStudents);

/**
 * @swagger
 * /api/courses:
 *   get:
 *     summary: Get all courses
 *     tags: [Courses]
 *     responses:
 *       200:
 *         description: List of courses
 *   post:
 *     summary: Create a new course
 *     tags: [Courses]
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
 *               description:
 *                 type: string
 *               price:
 *                 type: number
 *     responses:
 *       201:
 *         description: Course created
 */
router
  .route('/')
  .get(getCourses)
  .post(protect, authorize('Instructor', 'Admin'), createCourse);

/**
 * @swagger
 * /api/courses/{id}:
 *   get:
 *     summary: Get a single course
 *     tags: [Courses]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Course details
 *   put:
 *     summary: Update a course
 *     tags: [Courses]
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
 *               description:
 *                 type: string
 *     responses:
 *       200:
 *         description: Course updated
 *   delete:
 *     summary: Delete a course
 *     tags: [Courses]
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
 *         description: Course deleted
 */
router
  .route('/:id')
  .get(getCourse)
  .put(protect, authorize('Instructor', 'Admin'), updateCourse)
  .delete(protect, authorize('Instructor', 'Admin'), deleteCourse);

module.exports = router;
