const { v4: uuidv4 } = require('uuid');
const { validationResult } = require('express-validator');
const HttpError = require('../models/http-error');
const getCoordsForAddress = require('../utils/location');

let DUMMY_PLACES = [
  {
    id: 'p1',
    title: 'Empire State Building',
    description: 'One of the most famous sky scrapers in the world!',
    imageUrl:
      'https://upload.wikimedia.org/wikipedia/commons/thumb/1/10/Empire_State_Building_%28aerial_view%29.jpg/399px-Empire_State_Building_%28aerial_view%29.jpg',
    address: '20 W 34th St, New York, NY 10001',
    location: {
      lat: 40.7487658,
      lng: -73.9879135,
    },
    creator: 'u1',
  },
  {
    id: 'p2',
    title: 'Empire State Building 2',
    description: 'One of the most famous sky scrapers in the world!',
    imageUrl:
      'https://upload.wikimedia.org/wikipedia/commons/thumb/1/10/Empire_State_Building_%28aerial_view%29.jpg/399px-Empire_State_Building_%28aerial_view%29.jpg',
    address: '20 W 34th St, New York, NY 10001',
    location: {
      lat: 40.7487658,
      lng: -73.9879135,
    },
    creator: 'u2',
  },
];

const getPlaceById = (req, res, next) => {
  const placeId = req.params.pid; // {pid: "p1"}
  const place = DUMMY_PLACES.find((p) => p.id === placeId);

  if (!place) {
    throw new HttpError('Could not find a place for the place id.', 404);
  }

  res.json({ place }); // {place: place}
};

const getPlacesByUserId = (req, res, next) => {
  const userId = req.params.uid;
  const places = DUMMY_PLACES.filter((p) => p.creator === userId);

  if (!places || places.length === 0) {
    return next(new HttpError('Could not find a place for the user id.', 404));
  }

  res.json({ places });
};

const createPlace = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    console.log(errors);
    return next(
      new HttpError('Invalid inputs passed, please check your data.')
    );
  }

  const { title, description, address, creator } = req.body;

  let coordinates;
  try {
    coordinates = await getCoordsForAddress(address);
  } catch (error) {
    console.log(`GetCoordsForAddress error: ${error}`);
    return next(new HttpError('Could not get coordinates by address.'));
  }

  const createdPlace = {
    id: uuidv4(),
    title,
    description,
    location: coordinates,
    address,
    creator,
  };
  console.log(createdPlace);
  DUMMY_PLACES.push(createdPlace);
  res.status(201).json({ place: createdPlace });
};

const updatePlace = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    throw new HttpError('Invalid inputs passed, please check your data.');
  }

  const { title, description } = req.body;
  const placeId = req.params.pid;

  const updatedPlace = { ...DUMMY_PLACES.find((p) => p.id === placeId) };
  updatedPlace.title = title;
  updatedPlace.description = description;

  const placeIndex = DUMMY_PLACES.findIndex((p) => p.id === placeId);
  DUMMY_PLACES[placeIndex] = updatedPlace;

  res.status(200).json({ place: updatedPlace });
};

const deletePlace = (req, res, next) => {
  const placeId = req.params.pid;
  if (!DUMMY_PLACES.find((p) => p.id === placeId)) {
    throw new HttpError('Could not find a place for that id.', 404);
  }

  DUMMY_PLACES = DUMMY_PLACES.filter((p) => p.id != placeId);
  res.status(200).json({ message: 'Deleted place.' });
};

module.exports = {
  getPlaceById,
  getPlacesByUserId,
  createPlace,
  updatePlace,
  deletePlace,
};
