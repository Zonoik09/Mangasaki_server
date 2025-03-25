const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Friendship_Request = sequelize.define('Friendship_Request', {
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
    status: {
        type: DataTypes.ENUM('PENDING', 'ACCEPTED', 'DECLINED'),
        allowNull: false,
        defaultValue: 'PENDING'
    },
}, {
    timestamps: true,
    tableName: 'Friendship',
    underscored: true,
    indexes: [
        {
            unique: true,
            fields: ['user_id_1', 'user_id_2']
        }
    ]
});

module.exports = Friendship_Request;
