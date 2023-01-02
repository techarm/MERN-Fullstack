const express = require('express');
const userControllers = require('../controllers/users-controller');

const router = express.Router();

router.get('/', userControllers.getAllUsers);
router.post('/signup', userControllers.signup);
router.post('/login', userControllers.login);

module.exports = router;
