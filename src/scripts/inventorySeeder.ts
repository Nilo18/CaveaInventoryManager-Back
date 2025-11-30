import '../db/models/associations'  
const { Inventory } = require('../db/models/associations.ts')
const { Location } = require('../db/models/associations.ts')
const sequelize = require('../db/config.ts')

const locationNames = [
  "მთავარი ოფისი",
  "კავეა გალერია",
  "კავეა თბილისი მოლი",
  "კავეა ისთ ფოინთი",
  "კავეა სითი მოლი"
]

const bSize = 5000  
const tItems = 500000

const randomPrice = () => Number((Math.random() * 490 + 10).toFixed(2))
const randomName = (i: number) => `Item ${i}`

async function seedLocations() {
  const existing = await Location.findAll()

  if (existing.length === locationNames.length) {
    return existing
  }

  const created = await Location.bulkCreate(
    locationNames.map(name => ({ name })),
    { returning: true }
  )

  return created
}

async function seedInventory(locations: any[]) {
  const locationIds = locations.map(l => l.id)

  let count = 0

  while (count < tItems) {
    const remaining = tItems - count
    const batchSize = Math.min(bSize, remaining)

    const batch: any[] = []

    for (let i = 0; i < batchSize; i++) {
      batch.push({
        name: randomName(count + i + 1),
        price: randomPrice(),
        locationId: locationIds[Math.floor(Math.random() * locationIds.length)],
        createdAt: new Date(),
        updatedAt: new Date()
      })
    }

    await Inventory.bulkCreate(batch, { logging: false })

    count += batchSize
  }
}

async function main() {
  try {
    await sequelize.authenticate()

    const locations = await seedLocations()
    await seedInventory(locations)

    process.exit(0)
  } catch (err) {
    console.error(err)
    process.exit(1)
  }
}

main()
