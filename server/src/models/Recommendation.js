const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Recommendation = sequelize.define('Recommendation', {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },
    friendship_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: Friendship,
            key: 'id'
        },
        onDelete: 'CASCADE'
    },
    book_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: Book,
            key: 'id'
        },
        onDelete: 'CASCADE'
    }
}, {
    timestamps: true,
    tableName: 'Recommendation',
    underscored: true
});

module.exports = Recommendation;
