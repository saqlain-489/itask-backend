const express = require('express');
const router = express.Router();
const { userController } = require('../controllers');
const { authMiddleware } = require('../middleware/authmiddleware');
const { authorizeRoles } = require('../middleware/roleMiddleware');

// Admin-only routes
router.route('/all')
  .get(authMiddleware, authorizeRoles("admin"), userController.getUsers);

// User can access their own data
router.route('/me')
  .get(authMiddleware, userController.getCurrentUser)
  .patch(authMiddleware, userController.updateCurrentUser);

// Admin routes with user ID
router.route('/:id')
  .delete(authMiddleware, authorizeRoles("admin"), userController.deleteUser)
  .patch(authMiddleware, authorizeRoles("admin"), userController.patchUser);

module.exports = router;