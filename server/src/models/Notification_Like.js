const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Notification_Like = sequelize.define('Notification_Like', {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    },
    sender_user_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'User',
            key: 'id',
        },
        onDelete: 'CASCADE',
    },
    receiver_user_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'User',
            key: 'id',
        },
        onDelete: 'CASCADE',
    },
    gallery_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'Gallery',
            key: 'id',
        },
        onDelete: 'CASCADE',
    },
}, {
    timestamps: true,
    tableName: 'Notification_Like',
    underscored: true,
});

module.exports = Notification_Like;
