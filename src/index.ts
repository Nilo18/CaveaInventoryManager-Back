import {Request, Response, NextFunction} from 'express'
require("dotenv").config()
const sequelize = require('./db/config.ts')
const express = require('express')
const app = express()
const cors = require('cors')
const InventoryRouter = require('./routes/InventoryRoute.ts')
const LocationRouter = require('./routes/LocationRoute.ts')

app.use(express.json())
app.use(cors({
    origin: ['http://localhost:4200', 'https://cavea-inventory-manager.vercel.app/']
}))

app.use('/locations', LocationRouter)
app.use('/inventories', InventoryRouter)

async function connect() {
    try {
        await sequelize.authenticate()
        console.log('Connected to the database.')
    } catch (error) {
        console.log(`Couldn't connect to the database: ${error}`)
    }
}

connect()

const PORT = process.env.PORT || 3000
app.listen(PORT, () => {
    console.log(`App listening on port ${PORT}`)
})