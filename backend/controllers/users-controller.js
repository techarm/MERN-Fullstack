const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { validationResult } = require('express-validator');

const HttpError = require('../models/http-error');
const User = require('../models/user');
const JWT_TOKEN_SECRET_KEY = process.env.JWT_TOKEN_SECRET_KEY;

const getAllUsers = async (req, res, next) => {
  let users;
  try {
    users = await User.find({}, '-password');
  } catch (err) {
    return next(
      new HttpError('Fetching users failed, please try again later.', 500)
    );
  }

  res
    .status(200)
    .json({ users: users.map((u) => u.toObject({ getters: true })) });
};

const signup = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return next(
      new HttpError('Invalid inputs passed, please check your data.')
    );
  }

  const { name, email, password } = req.body;

  try {
    const existingUser = await User.findOne({ email: email });
    if (existingUser) {
      return next(
        new HttpError('User exists already, please login instead.', 422)
      );
    }
  } catch (err) {
    console.error(`signup - findOne error: ${err}`);
    return next(
      new HttpError('Signing up failed, please try again later', 500)
    );
  }

  let hashedPassword;
  try {
    hashedPassword = await bcrypt.hash(password, 12);
  } catch (err) {
    return next(
      new HttpError('Could not create user, please try again later', 500)
    );
  }

  const createdUser = new User({
    name,
    email,
    image: req.file.path,
    password: hashedPassword,
    places: [],
  });

  try {
    await createdUser.save();
  } catch (err) {
    console.error(err);
    return next(new HttpError('Signing up failed, please try again.', 500));
  }

  let token;
  try {
    token = jwt.sign(
      { userId: createdUser.id, email: createdUser.email },
      JWT_TOKEN_SECRET_KEY,
      { expiresIn: '1h' }
    );
  } catch (err) {
    console.error(err);
    return next(new HttpError('Signing up failed, please try again.', 500));
  }

  res
    .status(201)
    .json({ userId: createdUser.id, email: createdUser.email, token: token });
};

const login = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return next(
      new HttpError('Invalid inputs passed, please check your data.')
    );
  }

  const { email, password } = req.body;

  try {
    const identifiedUser = await User.findOne({ email: email });
    if (!identifiedUser) {
      return next(
        new HttpError(
          'Could not identify user, credentials seem to be wrong.',
          401
        )
      );
    }

    let isValidPassword = await bcrypt.compare(
      password,
      identifiedUser.password
    );
    if (!isValidPassword) {
      return next(
        new HttpError(
          'Could not identify user, credentials seem to be wrong.',
          401
        )
      );
    }

    let token = jwt.sign(
      { userId: identifiedUser.id, email: identifiedUser.email },
      JWT_TOKEN_SECRET_KEY,
      { expiresIn: '1h' }
    );

    res.status(200).json({
      userId: identifiedUser.id,
      email: identifiedUser.email,
      token: token,
    });
  } catch (err) {
    console.error(`signup - error: ${err}`);
    return next(
      new HttpError('Signing up failed, please try again later', 500)
    );
  }
};

module.exports = {
  getAllUsers,
  signup,
  login,
};
