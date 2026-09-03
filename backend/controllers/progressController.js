const Enrollment = require('../models/Enrollment');
const Course = require('../models/Course');

// @desc    Enroll in a course
// @route   POST /api/courses/:courseId/enroll
// @access  Private (Student)
exports.enrollCourse = async (req, res, next) => {
  try {
    const courseId = req.params.courseId;
    const studentId = req.user.id;

    // Check if course exists
    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({ success: false, error: 'Course not found' });
    }

    // Check if already enrolled
    const existingEnrollment = await Enrollment.findOne({ student: studentId, course: courseId });
    if (existingEnrollment) {
      return res.status(400).json({ success: false, error: 'Already enrolled in this course' });
    }

    const enrollment = await Enrollment.create({
      student: studentId,
      course: courseId
    });

    res.status(201).json({
      success: true,
      data: enrollment
    });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
};

// @desc    Get my enrollments
// @route   GET /api/progress/my-enrollments
// @access  Private (Student)
exports.getMyEnrollments = async (req, res, next) => {
  try {
    const enrollments = await Enrollment.find({ student: req.user.id }).populate('course');

    res.status(200).json({
      success: true,
      count: enrollments.length,
      data: enrollments
    });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
};

// @desc    Update progress
// @route   PUT /api/progress/:enrollmentId
// @access  Private (Student)
exports.updateProgress = async (req, res, next) => {
  try {
    const { progress } = req.body; // e.g., percentage or completed modules array
    
    let enrollment = await Enrollment.findById(req.params.enrollmentId);

    if (!enrollment) {
      return res.status(404).json({ success: false, error: 'Enrollment not found' });
    }

    if (enrollment.student.toString() !== req.user.id) {
      return res.status(401).json({ success: false, error: 'Not authorized to update this enrollment' });
    }

    enrollment = await Enrollment.findByIdAndUpdate(req.params.enrollmentId, { progress }, {
      new: true,
      runValidators: true
    });

    res.status(200).json({
      success: true,
      data: enrollment
    });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
};

// @desc    Mark resource as complete
// @route   POST /api/progress/:courseId/resource/:resourceId/complete
// @access  Private (Student)
exports.markResourceComplete = async (req, res, next) => {
  try {
    const course = await Course.findById(req.params.courseId);
    if (!course) {
      return res.status(404).json({ success: false, error: 'Course not found' });
    }

    let enrollment = await Enrollment.findOne({ student: req.user.id, course: req.params.courseId });
    if (!enrollment) {
      return res.status(404).json({ success: false, error: 'Enrollment not found' });
    }

    // Check if already completed
    if (!enrollment.completedResources.includes(req.params.resourceId)) {
      enrollment.completedResources.push(req.params.resourceId);
      
      // Calculate new progress based on total resources
      let totalResources = 0;
      course.modules.forEach(module => {
        totalResources += module.resources ? module.resources.length : 0;
      });

      if (totalResources > 0) {
        enrollment.progress = Math.min(100, Math.round((enrollment.completedResources.length / totalResources) * 100));
      } else {
        enrollment.progress = 100; // If no resources, course is completed
      }
      
      await enrollment.save();
    }

    res.status(200).json({
      success: true,
      data: enrollment
    });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
};
