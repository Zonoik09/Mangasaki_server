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
        type: DataTypes.ENUM('PENDING', 'ACCEPTED', 'DECLINED'),
        allowNull: false,
        defaultValue: 'PENDING',
    },
}, {
    timestamps: true,
    tableName: 'Notification_Friend_Request',
    underscored: true,
});

module.exports = Notification_Friend_Request;
