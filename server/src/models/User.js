const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const User = sequelize.define('User', {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },
    nickname: {
        type: DataTypes.STRING(50),
        allowNull: false,
        unique: true
    },
    password: {
        type: DataTypes.STRING(20),
        allowNull: false,
        unique: false
    },
    phone: {
        type: DataTypes.STRING(15),
        allowNull: false,
        unique: true
    },
    token: {
        type: DataTypes.STRING(100),
        allowNull: true,
        unique: true
    },
    image_url: {
        type: DataTypes.STRING(100),
        allowNull: true,
        unique: true
    },
}, {
    timestamps: true,
    tableName: 'User',
    underscored: true
});

module.exports = User;
