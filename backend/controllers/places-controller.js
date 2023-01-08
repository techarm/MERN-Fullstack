const fs = require('fs');
const { validationResult } = require('express-validator');
const mongoose = require('mongoose');

const HttpError = require('../models/http-error');
const getCoordsForAddress = require('../utils/location');
const Place = require('../models/place');
const User = require('../models/user');
const place = require('../models/place');

const getPlaceById = async (req, res, next) => {
  const placeId = req.params.pid; // {pid: "p1"}

  let place;
  try {
    place = await Place.findById(placeId);
  } catch (err) {
    console.error(`getPlaceById error: ${err}`);
    const error = new HttpError(
      'Something went wrong, could not find a place',
      500
    );
    return next(error);
  }

  if (!place) {
    return next(new HttpError('Could not find a place for the place id.', 404));
  }

  res.json({ place: place.toObject({ getters: true }) }); // {place: place}
};

const getPlacesByUserId = async (req, res, next) => {
  const userId = req.params.uid;

  let places;
  try {
    places = await Place.find({ creator: userId });
  } catch (err) {
    console.error(`getPlacesByUserId error: ${err}`);
    return next(
      HttpError('Fetching places failed, please try again later', 500)
    );
  }

  if (!places || places.length === 0) {
    res.json({ places: [] });
    // return next(new HttpError('Could not find a place for the user id.', 404));
  } else {
    res.json({
      places: places.map((place) => place.toObject({ getters: true })),
    });
  }
};

const createPlace = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    console.log(errors);
    return next(
      new HttpError('Invalid inputs passed, please check your data.')
    );
  }

  const { title, description, address } = req.body;

  let coordinates;
  try {
    coordinates = await getCoordsForAddress(address);
  } catch (error) {
    console.error(`GetCoordsForAddress error: ${error}`);
    return next(new HttpError('Could not get coordinates by address.'));
  }

  const createdPlace = new Place({
    title,
    description,
    address,
    location: coordinates,
    image: req.file.path,
    creator: req.userData.userId,
  });

  let user;
  try {
    user = await User.findById(req.userData.userId);
    if (!user) {
      return next(new HttpError('Could not find user for provided id.', 404));
    }
    console.log(user);
  } catch (err) {
    console.error(`createPlace error: ${err}`);
    return next(new HttpError('Creating place failed, please try again.', 500));
  }

  try {
    const session = await mongoose.startSession();
    session.startTransaction();

    await createdPlace.save({ session: session });

    user.places.push(createdPlace);
    await user.save({ session: session });

    await session.commitTransaction();
  } catch (err) {
    const error = new HttpError(
      'Creating place failed, please try again.',
      500
    );
    console.error(err);
    return next(error);
  }

  res.status(201).json({ place: createdPlace });
};

const updatePlace = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return next(
      new HttpError('Invalid inputs passed, please check your data.')
    );
  }

  const { title, description } = req.body;
  const placeId = req.params.pid;

  let updatedPlace;
  try {
    updatedPlace = await Place.findById(placeId);
  } catch (err) {
    console.error(`updatePlace - find error: ${err}`);
    return next(
      new HttpError('Something went wrong, could not update place', 500)
    );
  }

  if (updatedPlace.creator.toString() !== req.userData.userId) {
    const error = new HttpError(
      'Your are not allowed to edit this place.',
      401
    );
    return next(error);
  }

  updatedPlace.title = title;
  updatedPlace.description = description;

  try {
    await updatedPlace.save();
  } catch (err) {
    console.error(`updatePlace - save error: ${err}`);
    return next(
      new HttpError('Something went wrong, could not update place', 500)
    );
  }

  res.status(200).json({ place: updatedPlace.toObject({ getters: true }) });
};

const deletePlace = async (req, res, next) => {
  const placeId = req.params.pid;

  let place;
  try {
    place = await Place.findById(placeId).populate('creator');
  } catch (err) {
    console.error(`deletePlace - find error: ${err}`);
    return next(
      new HttpError('Something went wrong, could not delete place', 500)
    );
  }

  if (!place) {
    return next(new HttpError('Could not find place for this id.', 404));
  }

  if (place.creator.id !== req.userData.userId) {
    const error = new HttpError(
      'Your are not allowed to edit this place.',
      401
    );
    return next(error);
  }

  try {
    const session = await mongoose.startSession();
    session.startTransaction();
    await place.remove({ session: session });

    place.creator.places.pull(place);
    await place.creator.save({ session: session });

    await session.commitTransaction();
  } catch (err) {
    console.error(`deletePlace - remove error: ${err}`);
    return next(
      new HttpError('Something went wrong, could not delete place', 500)
    );
  }

  const imagePath = place.image;
  fs.unlink(imagePath, (err) => {
    if (err) {
      console.log(err);
    } else {
      console.log('The place image is deleted. ImagePath: ' + imagePath);
    }
  });

  res.status(200).json({ message: 'Deleted place.' });
};

module.exports = {
  getPlaceById,
  getPlacesByUserId,
  createPlace,
  updatePlace,
  deletePlace,
};
