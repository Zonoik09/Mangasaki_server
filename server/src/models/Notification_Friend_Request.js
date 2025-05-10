const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Notification_Friend_Request = sequelize.define('Notification_Friend_Request', {
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
    status: {
        type: DataTypes.ENUM('PENDING'),
        allowNull: false,
        defaultValue: 'PENDING',
    },
    message: {
        type: DataTypes.STRING(255),
        allowNull: true,
    },
}, {
    timestamps: true,
    tableName: 'Notification_Friend_Request',
    underscored: true,
    indexes: [
        {
            unique: true,
            fields: ['sender_user_id', 'receiver_user_id']
        }
    ]
});

module.exports = Notification_Friend_Request;
