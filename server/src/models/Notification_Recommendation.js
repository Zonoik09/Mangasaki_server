const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Notification_Recommendation = sequelize.define('Notification_Recommendation', {
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
    manga_name: {
        type: DataTypes.STRING(100),
        allowNull: false,
    },
    message: {
        type: DataTypes.STRING(255),
        allowNull: true,
    },
}, {
    timestamps: true,
    tableName: 'Notification_Recommendation',
    underscored: true,
});

module.exports = Notification_Recommendation;
