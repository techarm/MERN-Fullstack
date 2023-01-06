require('dotenv').config();
const fs = require('fs');
const path = require('path');

const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');

const placeRoutes = require('./routes/places-routes');
const userRoutes = require('./routes/users-routes');
const HttpError = require('./models/http-error');

const app = express();

app.use(bodyParser.json());

app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'Origin, X-Requested-With, Content-Type, Accept, Authorization'
  );
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PATCH, DELETE');
  next();
});

app.use('/uploads/images', express.static(path.join('uploads', 'images')));

// URI => /api/place/...
app.use('/api/places', placeRoutes);
app.use('/api/users', userRoutes);

app.use((req, res, next) => {
  const error = new HttpError(`Counld not find ${req.url}`, 404);
  throw error;
});

app.use((error, req, res, next) => {
  if (req.file) {
    fs.unlink(req.file.path, (err) => {
      if (err) {
        console.log(err);
      }
    });
  }
  if (res.headerSent) {
    return next(error);
  }
  res.status(error.code || 500);
  res.json({ message: error.message || 'An unknown error occurred!' });
});

mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => {
    app.listen(3001);
  })
  .catch((err) => {
    console.log(err);
  });
