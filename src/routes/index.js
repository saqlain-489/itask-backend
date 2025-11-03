const express = require('express');
const router = express.Router();

const userRoutes = require('./user.route');
const todoRoutes = require('./todo.route');
const authuserRoutes = require('./user.auth.route')


router.use('/api/users', userRoutes);
router.use('/api', authuserRoutes);
router.use('/api/todos', todoRoutes);

module.exports = router;
