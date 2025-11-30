import type { Request, Response, NextFunction } from "express";

const { Inventory, Location } = require('../db/models/associations.ts')

interface InventoryQuery {
  page?: string
  filter?: string
  sort?: string
}

const itemsPerPage = 20

const allowedFilters = new Set([
  'მთავარი ოფისი',
  'კავეა გალერია',
  'კავეა თბილისი მოლი',
  'კავეა ისთ ფოინთი',
  'კავეა სითი მოლი',
  'ყველა',
])

const sortOrders = new Map<string, any>([
    ['ადგილმდეობარეობით', [[{model: Location, as: 'location', }]]],
    ['ფასით(ზრდადობით)', [['price', 'ASC']]],
    ['ფასით(კლებადობით)', [['price', 'DESC']]],
    ['სახელით', [['name', 'ASC']]]
])

async function getInventory(req: Request, res: Response, next: NextFunction) {
    try {
        const query = req.query as InventoryQuery

        const currentPage = Math.max(Number(query.page) || 1, 1)
        const filter = allowedFilters.has(query.filter ?? '') ? query.filter : 'ყველა'
        const sortKey = sortOrders.has(query.sort ?? '') ? query.sort! : 'სახელით'

        const offset = (currentPage - 1) * itemsPerPage

        const order = sortOrders.get(sortKey)!

        const where = filter === 'ყველა' ? {} : {"$location.name$": filter}

        const { rows: items, count: totalInventory} = await Inventory.findAndCountAll({
            attributes: ['id', 'name', 'price'],
            include: [{
                model: Location,
                as: 'location',
                attributes: ['name'],
                required: true,
            }],
            where,
            order,
            limit: itemsPerPage,
            offset,
            distinct: true, 
        })

        const pageCount = Math.ceil(totalInventory / itemsPerPage)

        return res.status(200).json({ items, pageCount, totalInventory })
    } catch (error) {
        return res.status(500).send(`Couldn't GET inventory: ${error}`)
    }
}

async function addInventory(req: Request, res: Response, next: NextFunction) {
    try {
        const { name, price, location } = req.body
        if (!name) {
            return res.status(401).send("Please provide the name of the item.")
        }

        if (!price) {
            return res.status(401).send("Please provide the price of the item.")
        }

        if (!location) {
            return res.status(401).send("Please provide the location of the item.")
        }

        const suggestedLocation = await Location.findOne({
            where: { name: location }
        })

        if (!suggestedLocation) {
            return res.status(404).send("The given location was not found to add the item.")
        }

        const newItem = await Inventory.create({
            name: name,
            price: price,
            locationId: suggestedLocation.id
        })

        res.status(200).json(newItem)
    } catch (error) {
        return res.status(500).send(`Couldn't add new inventory: ${error}`)
    }
    next()
}

async function removeInventory(req: Request, res: Response, next: NextFunction) {
    try {
        const { inventoryID } = req.params
        const deletedCount = await Inventory.destroy({
            where: {id: inventoryID}
        })

        if (deletedCount === 0) {
            return res.status(404).send('Item with the given id was not found.')
        }

        res.status(200).json({success: true, deletedAmount: deletedCount})
    } catch (error) {
        return res.status(500).send(`Couldn't remove the item: ${error}`)
    }
    next()
}

module.exports = { getInventory, addInventory, removeInventory }