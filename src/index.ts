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
    origin: ['http://localhost:4200']
}))

app.use('/locations', LocationRouter)
app.use('/inventories', InventoryRouter)


app.get('/', (req: Request, res: Response, next: NextFunction) => {
    try {
        return res.status(200).send("Hello")
    } catch (error) {
        return res.status(500).send(`Couldn't respond: ${error}`)
    }
})

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