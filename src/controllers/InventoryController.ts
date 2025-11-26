import type { Request, Response, NextFunction } from "express";

const { Inventory, Location } = require('../db/models/associations.ts')

async function getInventory(req: Request, res: Response, next: NextFunction) {
    try {
        const items = await Inventory.findAll({
            include: [{
                model: Location, 
                as: 'location',
                attributes: ['name']
            }]
        })
        return res.status(200).json(items)
    } catch (error) {
        return res.status(500).send(`Couldn't GET inventory: ${error}`)
    }
    // next()
}

module.exports = { getInventory }