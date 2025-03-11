const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Manga = sequelize.define('Manga', {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },
    name: {
        type: DataTypes.STRING(50),
        allowNull: false
    },
    vol: {
        type: DataTypes.STRING(100),
        allowNull: false
    },
    isbn: {
        type: DataTypes.STRING(20),
        allowNull: false,
        unique: true
    }
}, {
    timestamps: true,
    tableName: 'Manga',
    underscored: true,
    indexes: [
        {
            unique: true,
            fields: ['name', 'vol']
        }
    ]
});

module.exports = Manga;
