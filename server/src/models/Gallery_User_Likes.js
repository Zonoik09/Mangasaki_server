const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Gallery_User_Likes = sequelize.define('Gallery_User_Likes', {
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
    timestamps: false,
    tableName: 'Gallery_User_Likes',
    underscored: true,
    indexes: [
        {
            unique: true,
            fields: ['sender_user_id', 'receiver_user_id', 'gallery_id']
        }
    ]
});

module.exports = Gallery_User_Likes;
