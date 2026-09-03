const express = require('express');
const multer = require('multer');
const path = require('path');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

// Configure storage
const storage = multer.diskStorage({
  destination(req, file, cb) {
    cb(null, 'uploads/');
  },
  filename(req, file, cb) {
    cb(
      null,
      `${file.fieldname}-${Date.now()}${path.extname(file.originalname)}`
    );
  }
});

// Check file type
function checkFileType(file, cb) {
  // Allowed ext
  const filetypes = /mp4|pdf|doc|docx/;
  // Check ext
  const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
  // Check mime
  const mimetype = filetypes.test(file.mimetype) || file.mimetype.includes('video') || file.mimetype.includes('pdf') || file.mimetype.includes('word');

  if (extname && mimetype) {
    return cb(null, true);
  } else {
    cb('Error: Videos, PDFs, and Docs Only!');
  }
}

const upload = multer({
  storage,
  fileFilter: function (req, file, cb) {
    checkFileType(file, cb);
  }
});

/**
 * @swagger
 * tags:
 *   name: Uploads
 *   description: File upload management
 */

/**
 * @swagger
 * /api/upload:
 *   post:
 *     summary: Upload a file
 *     tags: [Uploads]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               file:
 *                 type: string
 *                 format: binary
 *     responses:
 *       200:
 *         description: File uploaded successfully
 *       400:
 *         description: No file uploaded
 */
// @desc    Upload file
// @route   POST /api/upload
// @access  Private
router.post('/', protect, authorize('Instructor', 'Admin'), upload.single('file'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ success: false, error: 'No file uploaded' });
  }
  res.send(`/${req.file.path.replace(/\\/g, '/')}`);
});

module.exports = router;
