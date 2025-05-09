const User = require('../models/User');
const { Op } = require('sequelize');

const { logger } = require('../config/logger');

const getUsersByCombination = async (req, res) => {
    try {
        const { combination } = req.params;

        if (!combination) {
            return res.status(400).json({
                status: 'ERROR',
                message: 'La combinación es obligatoria',
                data: null,
            });
        }

        const users = await User.findAll({
            where: {
                nickname: {
                    [Op.like]: `%${combination}%`
                }
            },
            attributes: ['id', 'nickname']
        });

        // Reemplaza image_url por default0.jpg solo si es null
        const processedUsers = users.map(user => {
            return {
                id: user.id,
                nickname: user.nickname,
                image_url: user.image_url || 'default0.jpg'
            };
        });

        return res.status(200).json({
            status: 'SUCCESS',
            message: 'Usuarios encontrados',
            data: processedUsers,
        });
    } catch (error) {
        console.error('Error al buscar usuarios:', error);
        return res.status(500).json({
            status: 'ERROR',
            message: 'Error interno al buscar usuarios',
            data: null,
        });
    }
};

module.exports = {
    getUsersByCombination,
};
