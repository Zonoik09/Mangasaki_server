const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const User_Book = sequelize.define('User_Book', {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },
    user_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'User',
            key: 'id'
        },
        onDelete: 'CASCADE'
    },
    book_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'Book',
            key: 'id'
        },
        onDelete: 'CASCADE'
    },
    status: {
        type: DataTypes.ENUM('PENDING', 'READING', 'COMPLETED', 'ABANDONED'),
        allowNull: false,
        defaultValue: 'PENDING'
    },
}, {
    timestamps: true,
    tableName: 'User_Book',
    underscored: true,
    indexes: [
        {
            unique: true,
            fields: ['user_id', 'book_id']
        }
    ]
});

module.exports = User_Book;
