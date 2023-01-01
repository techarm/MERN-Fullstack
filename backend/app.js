const express = require('express');
const bodyParser = require('body-parser');

const placeRoutes = require('./routes/places-routes');

const app = express();

// URI => /api/place/...
app.use('/api/places', placeRoutes);

app.use((error, req, res, next) => {
  if (res.headerSent) {
    return next(error);
  }
  res.status(error.code || 500);
  res.json({ message: error.message || 'An unknown error occurred!' });
});

app.listen(3001);
