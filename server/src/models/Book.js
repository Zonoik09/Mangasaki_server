const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Book = sequelize.define('Book', {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },
    name: {
        type: DataTypes.STRING(50),
        allowNull: false
    },
    vol: {
        type: DataTypes.STRING(100),
        allowNull: false
    },
    isbn: {
        type: DataTypes.STRING(20),
        allowNull: false,
        unique: true
    }
}, {
    timestamps: true,
    tableName: 'Book',
    underscored: true,
    indexes: [
        {
            unique: true,
            fields: ['name', 'vol']
        }
    ]
});

module.exports = Book;
