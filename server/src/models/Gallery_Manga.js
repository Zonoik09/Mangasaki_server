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
    manga_name: {
        type: DataTypes.STRING(50),
        allowNull: false
    },

}, {
    timestamps: true,
    tableName: 'Gallery_Manga',
    underscored: true,
    indexes: [
        {
            unique: true,
            fields: ['manga_name', 'vol']
        }
    ]
});

module.exports = Gallery_Manga;
