const { v4: uuidv4 } = require('uuid');
const HttpError = require('../models/http-error');

const DUMMY_PLACES = [
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

const getPlaceByUserId = (req, res, next) => {
  const userId = req.params.uid;
  const place = DUMMY_PLACES.find((p) => p.creator === userId);

  if (!place) {
    return new HttpError('Could not find a place for the user id.', 404);
  }

  res.json({ place });
};

const createPlace = (req, res, next) => {
  const { title, description, coordinates, address, creator } = req.body;
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

// exports.getPlaceById = getPlaceById;
// exports.getPlaceByUserId = getPlaceByUserId;
// exports.createPlace = createPlace;
module.exports = {
  getPlaceById,
  getPlaceByUserId,
  createPlace,
};
