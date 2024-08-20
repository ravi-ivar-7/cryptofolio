const express = require('express');
const router = express.Router();
const { verifyToken } = require('../middlewares/verifyToken')
const { loginUser } = require('../controllers/user/login');
const { registerUser } = require('../controllers/user/register');


router.post('/login', loginUser);
router.post('/register', registerUser);



module.exports = router;
