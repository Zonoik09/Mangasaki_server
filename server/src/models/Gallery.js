const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Gallery = sequelize.define('Gallery', {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },
    name: {
        type: DataTypes.STRING(100),
        allowNull: false
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
    manga_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'Manga',
            key: 'id'
        },
        onDelete: 'CASCADE'
    },
    likes: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0
    }
}, {
    timestamps: true,
    tableName: 'Gallery',
    underscored: true
});

module.exports = Gallery;
