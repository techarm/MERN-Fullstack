const jwt = require('jsonwebtoken');
const HttpError = require('../models/http-error');

module.exports = (req, res, next) => {
  if (req.method === 'OPTIONS') {
    return next();
  }

  try {
    const token = req.headers.authorization.split(' ')[1]; // Authorization: "Bearer TOKEN"
    if (!token) {
      throw new Error('Authentication failed!');
    }
    const decodedToken = jwt.verify(token, process.env.JWT_TOKEN_SECRET_KEY);
    req.userData = { userId: decodedToken.userId };

    return next();
  } catch (err) {
    console.error(`check-auth - error: ${err}`);
    const error = new HttpError('Authentication failed!', 403);
    return next(error);
  }
};
