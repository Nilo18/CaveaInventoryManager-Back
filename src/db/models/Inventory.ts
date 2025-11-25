import { DataTypes, Model, Optional } from "sequelize"
const { sequelize } = require('../config.ts')

interface ItemAttributes {
    id: number
    name: string,
    price: number
    createdAt?: Date,
    updatedAt?: Date
}

// Make id optional since the database generates it automatically
interface ItemCreationAttributes extends Optional<ItemAttributes, 'id'> {}

class Inventory extends Model<ItemAttributes, ItemCreationAttributes> implements ItemAttributes {
    public id!: number
    public name!: string
    public price!: number

    public readonly createdAt?: Date
    public readonly updatedAt?: Date
}

Inventory.init({
    id: {
        type: DataTypes.INTEGER.UNSIGNED,
        allowNull: false,
        primaryKey: true
    },

    name: {
        type: DataTypes.STRING,
        allowNull: false
    },

    price: {
        type: DataTypes.INTEGER.UNSIGNED,
        allowNull: false
    }
}, 
{
    tableName: 'inventory',
    sequelize,
    timestamps: true
})

export default Inventory