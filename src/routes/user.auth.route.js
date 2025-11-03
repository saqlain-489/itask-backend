const express = require('express');
const router = express.Router();

const {authUserController} = require('../controllers')
// const { forgotPassword, resetPassword } = require('../controllers/authController');


router.route('/register').post( authUserController.registerUser);
router.route('/login').post( authUserController.loginUser);
 // routes/authRoutes.js

router.post('/forgot-password', authUserController.forgotPassword);
router.post('/reset-password/:token', authUserController.resetPassword);




module.exports = router;

  
 