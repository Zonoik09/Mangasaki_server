const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Recommendation_Request = sequelize.define('Recommendation_Request', {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },
    user_id_1: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'User',
            key: 'id'
        },
        onDelete: 'CASCADE',
        unique: true
    },
    user_id_2: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'User',
            key: 'id'
        },
        onDelete: 'CASCADE',
        unique: true
    },
    manga_name: {
        type: DataTypes.STRING(50),
        allowNull: false
    },
}, {
    timestamps: true,
    tableName: 'Recommendation_Request',
    underscored: true
});

module.exports = Recommendation_Request;
