import '../db/models/associations'
const { Inventory } = require('../db/models/associations.ts')
const sequelize = require('../db/config.ts')

const totalItems = 500000
const batchSize = 50000 
async function deleteInventory() {
  let deletedTotal = 0

  while (deletedTotal < totalItems) {
    const deleted = await Inventory.destroy({
      where: {
        name: sequelize.where(
          sequelize.fn("substring", sequelize.col("name"), 1, 4),
          "=",
          "Item"
        )
      },
      limit: batchSize, 
      logging: false
    })

    if (deleted === 0) break 

    deletedTotal += deleted
  }
}

async function main() {
  try {
    await sequelize.authenticate()

    await deleteInventory()

    process.exit(0)
  } catch (err) {
    console.error(err)
    process.exit(1)
  }
}

main()
