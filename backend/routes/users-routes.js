const express = require('express');
const { check } = require('express-validator');
const userControllers = require('../controllers/users-controller');
const fileUpload = require('../middleware/file-upload');

const router = express.Router();

router.get('/', userControllers.getAllUsers);
router.post(
  '/signup',
  fileUpload.single('image'),
  [
    check('name').not().isEmpty(),
    check('email').normalizeEmail().isEmail(),
    check('password').isLength({ min: 6 }),
  ],
  userControllers.signup
);
router.post(
  '/login',
  [check('email').isEmail(), check('password').isLength({ min: 6 })],
  userControllers.login
);

module.exports = router;
