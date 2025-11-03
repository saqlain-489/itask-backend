const express = require('express');
const router = express.Router();
const {todoController} = require('../controllers');
const { authMiddleware } = require('../middleware/authmiddleware')

router.route('/all')
.get(authMiddleware, todoController.getAlltodos);

router.route('/')
.get(authMiddleware, todoController.gettodos)
.post(authMiddleware, todoController.createTodo);

router.route('/:id')
.delete(authMiddleware, todoController.deletetodo)
.patch(authMiddleware, todoController.patchTodo);

module.exports = router;
