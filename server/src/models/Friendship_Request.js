const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Friendship_Request = sequelize.define('Friendship_Request', {
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
    status: {
        type: DataTypes.ENUM('PENDING', 'ACCEPTED', 'DECLINED'),
        allowNull: false,
        defaultValue: 'PENDING'
    },
}, {
    timestamps: true,
    tableName: 'Friendship_Request',
    underscored: true
});

module.exports = Friendship_Request;
