const express = require('express')
const InventoryRouter = express.Router()
const { getInventory, addInventory, removeInventory } = require('../controllers/InventoryController.ts')

InventoryRouter.get('/', getInventory)
InventoryRouter.post('/', addInventory)
InventoryRouter.delete('/:inventoryID', removeInventory)

module.exports = InventoryRouter