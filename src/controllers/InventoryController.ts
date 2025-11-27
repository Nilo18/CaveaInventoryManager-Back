import type { Request, Response, NextFunction } from "express";

const { Inventory, Location } = require('../db/models/associations.ts')

async function getInventory(req: Request, res: Response, next: NextFunction) {
    try {
        // Extract from, to, pageNumber, filter and sort options from query params
        const {page, filter, sort} = req.query
        const currentPage = Number(page) || 1
        console.log("The page number is: " + currentPage)
        console.log(filter)
        console.log(sort)
        const amount = 20 // Always fetch 20 items
        console.log("The amount is: " + amount)
        // offset defines the amount of items to skip
        // For example if currentPage === 1 offset = (1 - 1) * 20 = 0 so nothing will be skipped on the first page
        // if currentPage === 2 offset = (2 - 1) * 20 = 20, the first 20 items will be skipped, and so on
        const offset = (currentPage - 1) * amount
        console.log("The offset is: " + offset)

        const where: any = {}

        if (filter && filter !== 'ყველა') {
            where['$location.name$'] = filter
        }
        // const sortOption
       
        const order: any[] = []

        // Map each possible query value to what will be pushed into order
        // This avoids a long else if chain and is more scalable and maintainable,
        // because if we wanted to handle a new specific query, we would just have to add another property on orderActions
        const orderActions: Record<string, (...args: any[]) => any> = {
            'ადგილმდებარეობით': () => order.push([{ model: Location, as: 'location' }, 'name', 'ASC']),
            'ფასით(ზრდადობით)': () => order.push(['price', 'ASC']),
            'ფასით(კლებადობით)': () => order.push(['price', 'DESC']),
            'სახელით': () =>  order.push(['name', 'ASC'])
        }

        // Execute the 'name' function by default, i.e sort by item name if sort query parameter is not specified
        const action = orderActions[String(sort)] || orderActions['სახელით']!
        action()
        
        console.log(order)

        const items = await Inventory.findAll({
            include: [{
                model: Location, 
                as: 'location',
                required: true,
                attributes: ['name']
            }],
            where,
            order,
            limit: amount,
            offset,
        })
        console.log('The amount of Items is: ' + items.length)
        // for (let item of items) {
        //     console.log(item.id)
        // }

        // Count the amount of rows to determine the total amount of pages for this request
        let pageCount = 0
        const totalRows = await Inventory.count({
            include: [{
                model: Location,
                as: 'location',
                required: true,
                attributes: [] // This won't select any rows unnecessarily
            }],
            where,
            distinct: true,
            col: Inventory.id
        })

        console.log("Total amount of rows are: " + totalRows)
        // Since each page contains 20 rows, the amount of pages will increase by 1 for every 20th row
        for (let i = 0; i < totalRows; i++) {
            if (i % 20 === 0) {
                // console.log("The multiple of 20 row is: " + totalRows[i])
                pageCount++
            }
        }
        console.log("The page count is: " + pageCount)
        res.status(200).json({items, pageCount})
    } catch (error) {
        return res.status(500).send(`Couldn't GET inventory: ${error}`)
    }
    next()
}

async function addInventory(req: Request, res: Response, next: NextFunction) {
    try {
        const { name, price, location } = req.body
        // The frontend will handle the validation but these checks are for safety measures
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

        console.log("The location found is: " + suggestedLocation)

        const newItem = await Inventory.create({
            name: name,
            price: price,
            locationId: suggestedLocation.id
        })

        console.log("The new item is: " + newItem)
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
}

module.exports = { getInventory, addInventory, removeInventory }