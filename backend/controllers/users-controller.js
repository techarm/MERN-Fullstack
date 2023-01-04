const { validationResult } = require('express-validator');
const HttpError = require('../models/http-error');
const User = require('../models/user');

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
    console.err(`signup - findOne error: ${err}`);
    return next(
      new HttpError('Signing up failed, please try again later', 500)
    );
  }

  const createdUser = new User({
    name,
    email,
    image: 'https://picsum.photos/200/300',
    password,
    places: [],
  });

  try {
    await createdUser.save();
  } catch (err) {
    console.error(err);
    return next(new HttpError('Signing up failed, please try again.', 500));
  }

  res.status(201).json({ user: createdUser.toObject({ getters: true }) });
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
    if (!identifiedUser || identifiedUser.password !== password) {
      return next(
        new HttpError(
          'Could not identify user, credentials seem to be wrong.',
          401
        )
      );
    }
    res.status(200).json({ user: identifiedUser.toObject({ getters: true }) });
  } catch (err) {
    console.err(`signup - findOne error: ${err}`);
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
