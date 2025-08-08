const express = require('express');
const { body, validationResult, query } = require('express-validator');
const { auth, adminAuth } = require('../middleware/auth');
const Task = require('../models/Task');
const Itinerary = require('../models/Itinerary');
const User = require('../models/User');
const Cycle = require('../models/Cycle');
const schedulerService = require('../services/schedulerService');

const router = express.Router();

// Apply auth middleware to all admin routes
router.use(auth);
router.use(adminAuth);

// ============ TASKS CRUD ============

// @desc    Get all tasks
// @route   GET /api/admin/tasks
// @access  Admin
router.get('/tasks', async (req, res) => {
  try {
    const { page = 1, limit = 10, search, type, category, status } = req.query;
    
    let query = {};
    
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }
    
    if (type) query.type = type;
    if (category) query.category = category;
    if (status !== undefined) query.isActive = status === 'active';

    const tasks = await Task.find(query)
      .populate('createdBy', 'name email')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .exec();

    const total = await Task.countDocuments(query);

    res.json({
      success: true,
      data: tasks,
      pagination: {
        current: page,
        pages: Math.ceil(total / limit),
        total
      }
    });
  } catch (error) {
    console.error('Get tasks error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// @desc    Get single task
// @route   GET /api/admin/tasks/:id
// @access  Admin
router.get('/tasks/:id', async (req, res) => {
  try {
    const task = await Task.findById(req.params.id).populate('createdBy', 'name email');
    
    if (!task) {
      return res.status(404).json({ success: false, message: 'Task not found' });
    }

    res.json({ success: true, data: task });
  } catch (error) {
    console.error('Get task error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// @desc    Create task
// @route   POST /api/admin/tasks
// @access  Admin
router.post('/tasks', [
  body('title').trim().isLength({ min: 1, max: 100 }).withMessage('Title is required and max 100 chars'),
  body('description').trim().isLength({ min: 1, max: 500 }).withMessage('Description is required and max 500 chars'),
  body('type').isIn(['survey', 'quiz', 'challenge', 'event', 'submission']).withMessage('Invalid task type'),
  body('category').trim().isLength({ min: 1 }).withMessage('Category is required'),
  body('points').isNumeric().isInt({ min: 0 }).withMessage('Points must be a non-negative integer'),
  body('duration').isNumeric().isInt({ min: 1 }).withMessage('Duration must be a positive integer')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation errors',
        errors: errors.array()
      });
    }

    const task = await Task.create({
      ...req.body,
      createdBy: req.user.id
    });

    await task.populate('createdBy', 'name email');

    res.status(201).json({ success: true, data: task });
  } catch (error) {
    console.error('Create task error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// @desc    Update task
// @route   PUT /api/admin/tasks/:id
// @access  Admin
router.put('/tasks/:id', [
  body('title').optional().trim().isLength({ min: 1, max: 100 }).withMessage('Title must be between 1 and 100 characters'),
  body('description').optional().trim().isLength({ min: 1, max: 500 }).withMessage('Description must be between 1 and 500 characters'),
  body('type').optional().isIn(['survey', 'quiz', 'challenge', 'event', 'submission']).withMessage('Invalid task type'),
  body('category').optional().trim().isLength({ min: 1 }).withMessage('Category is required'),
  body('points').optional().isNumeric().isInt({ min: 0 }).withMessage('Points must be a non-negative integer'),
  body('duration').optional().isNumeric().isInt({ min: 1 }).withMessage('Duration must be a positive integer')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation errors',
        errors: errors.array()
      });
    }

    const task = await Task.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    ).populate('createdBy', 'name email');

    if (!task) {
      return res.status(404).json({ success: false, message: 'Task not found' });
    }

    res.json({ success: true, data: task });
  } catch (error) {
    console.error('Update task error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// @desc    Delete task
// @route   DELETE /api/admin/tasks/:id
// @access  Admin
router.delete('/tasks/:id', async (req, res) => {
  try {
    const task = await Task.findByIdAndDelete(req.params.id);

    if (!task) {
      return res.status(404).json({ success: false, message: 'Task not found' });
    }

    res.json({ success: true, message: 'Task deleted successfully' });
  } catch (error) {
    console.error('Delete task error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// ============ ITINERARIES CRUD ============ 

// @desc    Get all itineraries
// @route   GET /api/admin/itineraries
// @access  Admin
router.get('/itineraries', async (req, res) => {
  try {
    const { page = 1, limit = 10, search, type, status } = req.query;
    
    let query = {};
    
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }
    
    if (type) query.type = type;
    if (status) query.status = status;

    const itineraries = await Itinerary.find(query)
      .populate('createdBy', 'name email')
      .populate('tasks.task', 'title type points')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .exec();

    const total = await Itinerary.countDocuments(query);

    res.json({
      success: true,
      data: itineraries,
      pagination: {
        current: page,
        pages: Math.ceil(total / limit),
        total
      }
    });
  } catch (error) {
    console.error('Get itineraries error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// @desc    Create itinerary
// @route   POST /api/admin/itineraries
// @access  Admin
router.post('/itineraries', [
  body('name').trim().isLength({ min: 1, max: 100 }).withMessage('Name is required and max 100 chars'),
  body('description').trim().isLength({ min: 1, max: 500 }).withMessage('Description is required and max 500 chars'),
  body('type').isIn(['daily', 'weekly', 'monthly', 'campaign', 'event']).withMessage('Invalid itinerary type'),
  body('schedule.startDate').isISO8601().withMessage('Valid start date is required'),
  body('tasks').isArray().withMessage('Tasks must be an array'),
  body('tasks.*.task').isMongoId().withMessage('Invalid task ID in tasks array'),
  body('tasks.*.order').isInt({ min: 1 }).withMessage('Task order must be a positive integer')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation errors',
        errors: errors.array()
      });
    }

    const itinerary = await Itinerary.create({
      ...req.body,
      createdBy: req.user.id
    });

    await itinerary.populate([
      { path: 'createdBy', select: 'name email' },
      { path: 'tasks.task', select: 'title type points' }
    ]);

    res.status(201).json({ success: true, data: itinerary });
  } catch (error) {
    console.error('Create itinerary error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// @desc    Update itinerary
// @route   PUT /api/admin/itineraries/:id
// @access  Admin
router.put('/itineraries/:id', [
  body('name').optional().trim().isLength({ min: 1, max: 100 }).withMessage('Name must be between 1 and 100 characters'),
  body('description').optional().trim().isLength({ min: 1, max: 500 }).withMessage('Description must be between 1 and 500 characters'),
  body('type').optional().isIn(['daily', 'weekly', 'monthly', 'campaign', 'event']).withMessage('Invalid itinerary type'),
  body('schedule.startDate').optional().isISO8601().withMessage('Valid start date is required'),
  body('tasks').optional().isArray().withMessage('Tasks must be an array'),
  body('tasks.*.task').optional().isMongoId().withMessage('Invalid task ID in tasks array'),
  body('tasks.*.order').optional().isInt({ min: 1 }).withMessage('Task order must be a positive integer')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation errors',
        errors: errors.array()
      });
    }

    const itinerary = await Itinerary.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    ).populate([
      { path: 'createdBy', select: 'name email' },
      { path: 'tasks.task', select: 'title type points' }
    ]);

    if (!itinerary) {
      return res.status(404).json({ success: false, message: 'Itinerary not found' });
    }

    res.json({ success: true, data: itinerary });
  } catch (error) {
    console.error('Update itinerary error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// @desc    Delete itinerary
// @route   DELETE /api/admin/itineraries/:id
// @access  Admin
router.delete('/itineraries/:id', async (req, res) => {
  try {
    const itinerary = await Itinerary.findByIdAndDelete(req.params.id);

    if (!itinerary) {
      return res.status(404).json({ success: false, message: 'Itinerary not found' });
    }

    res.json({ success: true, message: 'Itinerary deleted successfully' });
  } catch (error) {
    console.error('Delete itinerary error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});


// ============ USERS CRUD ============ 

// @desc    Get all users
// @route   GET /api/admin/users
// @access  Admin
router.get('/users', async (req, res) => {
  try {
    const { page = 1, limit = 10, search, role, status } = req.query;
    
    let query = {};
    
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ];
    }
    
    if (role) query.role = role;
    if (status !== undefined) query.isActive = status === 'active';

    const users = await User.find(query)
      .select('-password')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .exec();

    const total = await User.countDocuments(query);

    res.json({
      success: true,
      data: users,
      pagination: {
        current: page,
        pages: Math.ceil(total / limit),
        total
      }
    });
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// @desc    Create a new user
// @route   POST /api/admin/users
// @access  Admin
router.post('/users', [
  body('name').trim().isLength({ min: 1 }).withMessage('Name is required'),
  body('email').isEmail().normalizeEmail().withMessage('Valid email is required'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  body('role').isIn(['admin', 'staff', 'user']).withMessage('Invalid role'),
  body('isActive').isBoolean().optional()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation errors',
        errors: errors.array()
      });
    }

    const { name, email, password, role, isActive } = req.body;

    // Check if user with this email already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ success: false, message: 'User with this email already exists' });
    }

    const user = await User.create({
      name,
      email,
      password, // Password will be hashed by the pre-save hook in User model
      role,
      isActive: isActive !== undefined ? isActive : true // Default to true if not provided
    });

    // Do not return password in response
    const userResponse = user.toObject();
    delete userResponse.password;

    res.status(201).json({ success: true, data: userResponse });
  } catch (error) {
    console.error('Create user error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// @desc    Update user role
// @route   PUT /api/admin/users/:id/role
// @access  Admin
router.put('/users/:id/role', [
  body('role').isIn(['admin', 'staff', 'user']).withMessage('Invalid role')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation errors',
        errors: errors.array()
      });
    }

    const user = await User.findByIdAndUpdate(
      req.params.id,
      { role: req.body.role },
      { new: true, runValidators: true }
    ).select('-password');

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    res.json({ success: true, data: user });
  } catch (error) {
    console.error('Update user role error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// @desc    Delete user
// @route   DELETE /api/admin/users/:id
// @access  Admin
router.delete('/users/:id', async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    res.json({ success: true, message: 'User deleted successfully' });
  } catch (error) {
    console.error('Delete user error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});


// ============ ANALYTICS & REPORTING ============ 

// @desc    Get analytics report
// @route   GET /api/admin/report
// @access  Admin
router.get('/report', [
  query('cycleId').optional().isMongoId().withMessage('Invalid Cycle ID'),
  query('startDate').optional().isISO8601().withMessage('Invalid start date format'),
  query('endDate').optional().isISO8601().withMessage('Invalid end date format')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation errors',
        errors: errors.array()
      });
    }

    const { cycleId, startDate, endDate } = req.query;
    
    let dateFilter = {};
    if (startDate || endDate) {
      dateFilter.createdAt = {};
      if (startDate) dateFilter.createdAt.$gte = new Date(startDate);
      if (endDate) dateFilter.createdAt.$lte = new Date(endDate);
    }

    // Get cycle-specific data if cycleId provided
    if (cycleId) {
      const cycle = await Cycle.findById(cycleId);
      if (!cycle) {
        return res.status(404).json({ success: false, message: 'Cycle not found' });
      }

      res.json({
        success: true,
        data: {
          cycle: {
            id: cycle._id,
            name: cycle.name,
            entries: cycle.metrics.totalEntries,
            revenue: cycle.metrics.totalRevenue,
            winners: cycle.winners.length,
            conversionRate: cycle.metrics.conversionRate
          }
        }
      });
      return;
    }

    // General analytics
    const [
      totalUsers,
      totalTasks,
      totalItineraries,
      activeCycles,
      recentActivity
    ] = await Promise.all([
      User.countDocuments({ ...dateFilter, isActive: true }),
      Task.countDocuments({ ...dateFilter, isActive: true }),
      Itinerary.countDocuments({ ...dateFilter, isActive: true }),
      Cycle.countDocuments({ ...dateFilter, status: 'active' }),
      Task.find(dateFilter).sort({ createdAt: -1 }).limit(10).populate('createdBy', 'name')
    ]);

    const analytics = {
      overview: {
        totalUsers,
        totalTasks,
        totalItineraries,
        activeCycles
      },
      recentActivity: recentActivity.map(task => ({
        id: task._id,
        title: task.title,
        type: task.type,
        createdBy: task.createdBy?.name,
        createdAt: task.createdAt
      }))
    };

    res.json({ success: true, data: analytics });
  } catch (error) {
    console.error('Get report error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// ============ SCHEDULER MANAGEMENT ============ 

// @desc    Get scheduler status
// @route   GET /api/admin/scheduler
// @access  Admin
router.get('/scheduler', async (req, res) => {
  try {
    const status = schedulerService.getStatus();
    res.json({ success: true, data: status });
  } catch (error) {
    console.error('Get scheduler status error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// @desc    Toggle scheduler job
// @route   PUT /api/admin/scheduler/:jobName
// @access  Admin
router.put('/scheduler/:jobName', [
  body('enabled').isBoolean().withMessage('Enabled status must be a boolean')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation errors',
        errors: errors.array()
      });
    }

    const { jobName } = req.params;
    const { enabled } = req.body;

    const result = schedulerService.toggleJob(jobName, enabled);
    
    if (!result.success) {
      return res.status(404).json(result);
    }

    res.json(result);
  } catch (error) {
    console.error('Toggle scheduler job error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

module.exports = router;
