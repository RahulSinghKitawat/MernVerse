const express = require('express');
const { getMyEnrollments, updateProgress, markResourceComplete } = require('../controllers/progressController');

const router = express.Router();

const { protect, authorize } = require('../middleware/auth');

/**
 * @swagger
 * tags:
 *   name: Progress
 *   description: Progress and enrollment management
 */

/**
 * @swagger
 * /api/progress/my-enrollments:
 *   get:
 *     summary: Get user enrollments
 *     tags: [Progress]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of enrollments
 */
router.get('/my-enrollments', protect, authorize('Student'), getMyEnrollments);

/**
 * @swagger
 * /api/progress/{enrollmentId}:
 *   put:
 *     summary: Update progress
 *     tags: [Progress]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: enrollmentId
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
 *               progress:
 *                 type: number
 *     responses:
 *       200:
 *         description: Progress updated
 */
router.put('/:enrollmentId', protect, authorize('Student'), updateProgress);

/**
 * @swagger
 * /api/progress/{courseId}/resource/{resourceId}/complete:
 *   post:
 *     summary: Mark a resource as complete
 *     tags: [Progress]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: courseId
 *         required: true
 *         schema:
 *           type: string
 *       - in: path
 *         name: resourceId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Resource marked complete
 */
router.post('/:courseId/resource/:resourceId/complete', protect, authorize('Student'), markResourceComplete);

module.exports = router;
