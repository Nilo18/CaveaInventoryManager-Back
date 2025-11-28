import express from 'express'
const LocationRouter = express.Router()
const { getLocationStats, addLocation, updateLocation, deleteLocation } = require('../controllers/LocationController.ts')

LocationRouter.get('/', getLocationStats)

LocationRouter.post('/', addLocation)

LocationRouter.put('/', updateLocation)

LocationRouter.delete('/:locationId', deleteLocation)

module.exports = LocationRouter
