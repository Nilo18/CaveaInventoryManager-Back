import type { Request, Response, NextFunction } from "express";
import { Sequelize } from "sequelize";
const { Location, Inventory } = require('../db/models/associations.ts')

async function getLocationStats(req: Request, res: Response, next: NextFunction) {
    try {
        const stats = await Location.findAll({
            attributes: [
                'id',
                'name',
                [Sequelize.fn('COUNT', Sequelize.col('inventories.id')), 'totalItems'],
                [Sequelize.fn('SUM', Sequelize.col('inventories.price')), 'totalPrice']
            ],
            include: [{
                model: Inventory,
                as: 'inventories',
                attributes: []
            }],
            group: ['Location.id'],
            raw: true
        })

        stats.forEach((location: any) => {
            location.totalItems = Number(location.totalItems) // Convert total items to number since they're returned as string
            // Round the total priice to show 2 digits of floating point numbers
            // This will avoid large decimals like 540.34999999 which looks less professional
            location.totalPrice = Number(location.totalPrice) ? Math.round(location.totalPrice * 100) / 100 :  0
        })

        // console.log("The stats are: ", stats)
        res.status(200).json({locations: stats})
    } catch (error) {
        return res.status(500).send(`Couldn't get locations: ${error}`)
    }
    next()
}

async function addLocation(req: Request, res: Response, next: NextFunction) {
    try {
        const { name } = req.body

        if (!name) {
            return res.status(401).send("Please provide the name of the location.")
        }

        const suggestedLocation = await Location.findOne({
            where: {name: name}
        })

        if (suggestedLocation) {
            return res.status(401).send("Location with this name already exists.")
        }

        const newLocation = await Location.create({
            name: name
        })

        res.status(200).json(newLocation)
    } catch (error) {
        return res.status(500).send(`Couldn't add the location: ${error}`)
    }
    next()
}

async function updateLocation(req: Request, res: Response, next: NextFunction) {
    try {
        const { id, newName } = req.body

        if (!id) {
            return res.status(401).send("Please provide a valid id.")
        }

        if (!newName) {
            return res.status(401).send("Please provide a valid new name.")
        }

        const suggestedLocation = await Location.findByPk(id)
        
        if (!suggestedLocation) {
            return res.status(404).send("The suggested location was not found.")
        }

        await suggestedLocation.update({ name: newName })

        res.status(200).json(suggestedLocation)
    } catch (error) {
        return res.status(500).send(`Couldn't update the location ${error}`)
    }
    next()
}

async function deleteLocation(req: Request, res: Response, next: NextFunction) {
    try {
        const { locationId } = req.params
        
        const deletedCount = await Location.destroy({
            where: {id: locationId}
        })

        if (deletedCount === 0) {
            return res.status(401).send("Couldn't delete, Location with this id doesn't exist.")
        }

        res.status(200).json({success: true, deletedAmount: deletedCount})
    } catch (error) {
        return res.status(500).send(`Couldn't delete location: ${error}`)
    }
    next()
}

module.exports = { getLocationStats, addLocation, updateLocation, deleteLocation }