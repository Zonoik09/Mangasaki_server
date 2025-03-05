const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');
const User = require('../models/User');

const Verification = sequelize.define('Verification', {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },
    user_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: User,
            key: 'id'
        },
        onDelete: 'CASCADE',
        unique: true
    },
    code: {
        type: DataTypes.STRING(50),
        allowNull: false,
        unique: true
    }
}, {
    timestamps: true,
    tableName: 'Verification',
    underscored: true
});

module.exports = Verification;
