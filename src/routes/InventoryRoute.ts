const express = require('express')
const InventoryRouter = express.Router()
const { getInventory, addInventory } = require('../controllers/InventoryController.ts')

InventoryRouter.get('/', getInventory)
InventoryRouter.post('/', addInventory)

module.exports = InventoryRouter