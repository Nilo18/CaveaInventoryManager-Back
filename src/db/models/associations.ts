/* This file will define associations for all models */

const Inventory = require('./Inventory.ts')
const Location = require('./Location.ts')

// Each Inventory object will be bounded to a single Location object with the foreign key of locationId
Inventory.belongsTo(Location, {foreignKey: 'locationId', as: 'location'})
Location.hasMany(Inventory, {foreignKey: 'locationId', as: 'inventories'})

module.exports = { Location, Inventory }