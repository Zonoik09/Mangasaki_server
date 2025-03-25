const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Book_Scan_Request = sequelize.define('Book_Scan_Request', {
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
        onDelete: 'CASCADE',
        unique: true
    },
    name: {
        type: DataTypes.STRING(50),
        allowNull: false
    },
}, {
    timestamps: true,
    tableName: 'Book_Scan_Request',
    underscored: true
});

module.exports = Book_Scan_Request;
