const express = require('express')
const InventoryRouter = express.Router()
const { getInventory } = require('../controllers/InventoryController.ts')

InventoryRouter.get('/', getInventory)

module.exports = InventoryRouter