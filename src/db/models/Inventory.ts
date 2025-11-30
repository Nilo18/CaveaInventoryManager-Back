import { DataTypes, Model, Optional } from "sequelize"
const sequelize = require('../config.ts')
const Location = require('./Location.ts')

interface InventoryAttributes {
    id: number
    name: string
    price: number
    locationId: number
    createdAt?: Date
    updatedAt?: Date
}

interface InventoryCreationAttributes extends Optional<InventoryAttributes, 'id'> {}

class Inventory extends Model<InventoryAttributes, InventoryCreationAttributes> implements InventoryAttributes {
    public id!: number
    public name!: string
    public price!: number
    public locationId!: number

    public readonly createdAt?: Date
    public readonly updatedAt?: Date
}

Inventory.init({
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true, 
        allowNull: false,
        primaryKey: true
    },

    name: {
        type: DataTypes.STRING,
        allowNull: false
    },

    price: {
        type: DataTypes.DOUBLE,
        allowNull: false
    },

    locationId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: "location",
            key: "id"
        },
        onDelete: 'CASCADE',
    }
}, 
{
    tableName: 'inventory',
    sequelize,
    timestamps: true
})

module.exports = Inventory