const express = require('express');
const placeControllers = require('../controllers/places-controller');

const router = express.Router();

router.get('/:pid', placeControllers.getPlaceById);
router.get('/user/:uid', placeControllers.getPlaceByUserId);
router.post('/', placeControllers.createPlace);

module.exports = router;
