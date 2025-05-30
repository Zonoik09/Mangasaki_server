const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');
const Gallery = require('./Gallery');

const Gallery_Manga = sequelize.define('Gallery_Manga', {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },
    gallery_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'Gallery',
            key: 'id'
        },
        onDelete: 'CASCADE'
    },
    manga_id: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
}, {
    timestamps: true,
    tableName: 'Gallery_Manga',
    underscored: true,
    indexes: [
        {
            unique: true,
            fields: ['gallery_id', 'manga_id']
        }
    ]
});

module.exports = Gallery_Manga;
