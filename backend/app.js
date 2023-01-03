const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');

const placeRoutes = require('./routes/places-routes');
const userRoutes = require('./routes/users-routes');
const HttpError = require('./models/http-error');

const app = express();

app.use(bodyParser.json());

// URI => /api/place/...
app.use('/api/places', placeRoutes);
app.use('/api/users', userRoutes);

app.use((req, res, next) => {
  const error = new HttpError(`Counld not find ${req.url}`, 404);
  throw error;
});

app.use((error, req, res, next) => {
  if (res.headerSent) {
    return next(error);
  }
  res.status(error.code || 500);
  res.json({ message: error.message || 'An unknown error occurred!' });
});

mongoose
  .connect(
    'mongodb://dev:dev123@localhost:27017/mern?authMechanism=DEFAULT&authSource=mern'
  )
  .then(() => {
    app.listen(3001);
  })
  .catch((err) => {
    console.log(err);
  });
