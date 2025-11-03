const express = require('express');
const router = express.Router();

const {authUserController} = require('../controllers')


router.route('/register').post( authUserController.registerUser);
router.route('/login').post( authUserController.loginUser);
 

module.exports = router;

  
 