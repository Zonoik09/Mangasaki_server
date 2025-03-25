const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Notification = sequelize.define('Notification', {
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
    type: {
        type: DataTypes.ENUM('DEFAULT', 'FRIENDSHIP_REQUEST'),
        allowNull: false,
        defaultValue: 'DEFAULT'
    },
    notification_body: {
        type: DataTypes.STRING(255),
        allowNull: false
    },
}, {
    timestamps: true,
    tableName: 'Notification',
    underscored: true
});

module.exports = Notification;
