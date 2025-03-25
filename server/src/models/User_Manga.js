const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const User_Manga = sequelize.define('User_Manga', {
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
        onDelete: 'CASCADE'
    },
    manga_name: {
        type: DataTypes.STRING(50),
        allowNull: false
    },
    status: {
        type: DataTypes.ENUM('PENDING', 'READING', 'COMPLETED', 'ABANDONED'),
        allowNull: false,
        defaultValue: 'PENDING'
    },
}, {
    timestamps: true,
    tableName: 'User_Manga',
    underscored: true,
    indexes: [
        {
            unique: true,
            fields: ['user_id', 'manga_name']
        }
    ]
});

module.exports = User_Manga;
