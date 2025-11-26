import { DataTypes, Model, Optional } from "sequelize";
const sequelize = require('../config.ts')
const Inventory = require('./Inventory.ts')

interface LocationAttributes {
    id: number
    name: string
    createdAt?: string
    updatedAt?: string
}

interface LocationCreationAttributes extends Optional<LocationAttributes, 'id'> {}

class Location extends Model<LocationAttributes, LocationCreationAttributes> implements LocationAttributes {
    public id!: number
    public name!: string

    public readonly createdAt?: string;
    public readonly updatedAt?: string;
}

Location.init({
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        allowNull: false,
        primaryKey: true
    },

    name: {
        type: DataTypes.STRING,
        allowNull: false
    }
},
{
    tableName: 'location',
    sequelize,
    timestamps: true
})

module.exports = Location