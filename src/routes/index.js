const express = require('express');
const router = express.Router();

const userRoutes = require('./user.route');
const todoRoutes = require('./todo.route');
const authuserRoutes = require('./user.auth.route')
// const chatRoutes = require('./chat.route');

// router.use('/api/chat', chatRoutes);


router.use('/api/users', userRoutes);
// router.use('/api', authuserRoutes);
router.use('/api/todos', todoRoutes);
router.use('/api/auth', authuserRoutes);

module.exports = router;
