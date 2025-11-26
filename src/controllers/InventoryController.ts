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
        for (let item of items) {
            console.log(item.id)
        }

        return res.status(200).json(items)
    } catch (error) {
        return res.status(500).send(`Couldn't GET inventory: ${error}`)
    }
    // next()
}

module.exports = { getInventory }