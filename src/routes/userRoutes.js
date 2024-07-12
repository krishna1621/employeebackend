const express = require('express');
const { register,  forgotPassword ,resetPassword,login} = require('../controller/userController'); // Adjust the path as necessary

const router = express.Router();

router.post('/register', register);
router.post('/login', login);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);
module.exports = router;