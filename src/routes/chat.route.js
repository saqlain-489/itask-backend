const express = require('express');
const router = express.Router();
const {chatController} = require('../controllers');
const { authMiddleware } = require('../middleware/authmiddleware')

router.route('/').post( chatController.sendMessage);
module.exports = router;
