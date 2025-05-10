const User = require('../models/User');
const { Op } = require('sequelize');

const { logger } = require('../config/logger');

const fs = require('fs');         
const path = require('path'); 

const Gallery = require('../models/Gallery');
const Gallery_Manga = require('../models/Gallery_Manga');

const createGallery = async (req, res, next) => {
    try {
        const { name, nickname } = req.body;
        
        logger.info('Nueva solicitud de creación de una galeria de', { nickname });

        if (!nickname || !name ) {
            return res.status(400).json({
                status: 'ERROR',
                message: 'El nickname y el nombre son obligatorios.',
                data: null,
            });
        }

        const user = await User.findOne({ where: { nickname } });

        if (!user) {
            logger.warn('Usuario no encontrado', { nickname });
            return res.status(404).json({
                status: 'ERROR',
                message: 'Usuario no encontrado',
                data: null,
            });
        }

        const gallery = await Gallery.create({
            name,
            user_id: user.id,
            image_url: "default0.jpg",
        });

        logger.info('Creación de una galería exitosa', { userId: user.id, galleryId: gallery.id });

        res.set('Authorization', user.token);

        res.status(200).json({
            status: 'OK',
            message: 'Galería creada exitosamente',
            data: {
                userId: user.id,
                nickname: user.nickname,
                galleryId: gallery.id,
                galleryName: gallery.name,

            },
        });
    } catch (error) {
        logger.error('Error al crear la galería', {
            error: error.message,
            stack: error.stack,
        });

        res.status(500).json({
            status: 'ERROR',
            message: 'Error interno al crear la galería',
            data: null,
        });
    }
};

const dropGallery = async (req, res, next) => {
    try {
        const { nickname, name } = req.body;
        console.log('Iniciando eliminación de galería...', { nickname, name });

        // Validación de entrada
        if (!nickname || !name) {
            return res.status(400).json({
                status: 'ERROR',
                message: 'El nickname y el nombre de la galería son obligatorios',
                data: null,
            });
        }

        // Buscar al usuario
        const user = await User.findOne({ where: { nickname } });
        if (!user) {
            return res.status(404).json({
                status: 'ERROR',
                message: 'Usuario no encontrado',
                data: null,
            });
        }

        // Buscar la galería asociada al usuario
        const gallery = await Gallery.findOne({
            where: {
                name,
                user_id: user.id
            }
        });

        if (!gallery) {
            return res.status(404).json({
                status: 'ERROR',
                message: 'Galería no encontrada para este usuario',
                data: null,
            });
        }

        // Eliminar la galería
        await gallery.destroy();
        console.log('Galería eliminada:', name);

        return res.status(200).json({
            status: 'SUCCESS',
            message: 'Galería eliminada correctamente',
            data: {
                galleryId: gallery.id,
                galleryName: gallery.name
            },
        });

    } catch (error) {
        console.error('Error al eliminar la galería:', error);
        return res.status(500).json({
            status: 'ERROR',
            message: 'Error interno al eliminar la galería',
            data: null,
        });
    }
};

/**
 * Añade un manga a una galería de un usuario.
 * @route POST /api/gallery/add_In_Gallery
 */
const addInGallery = async (req, res, next) => {
    try {
        const { nickname, galleryName, mangaid } = req.body;

        logger.info('Nueva solicitud de añadir un manga a la galería', { nickname, galleryName, mangaid });

        // Validación básica
        if (!nickname || !galleryName || !mangaid) {
            return res.status(400).json({
                status: 'ERROR',
                message: 'El nickname, el nombre de la galería y el id del manga son obligatorios.',
                data: null,
            });
        }

        // Buscar al usuario
        const user = await User.findOne({ where: { nickname } });
        if (!user) {
            logger.warn('Usuario no encontrado', { nickname });
            return res.status(404).json({
                status: 'ERROR',
                message: 'Usuario no encontrado',
                data: null,
            });
        }

        // Buscar la galería del usuario
        const gallery = await Gallery.findOne({
            where: {
                user_id: user.id,
                name: galleryName
            }
        });

        if (!gallery) {
            logger.warn('Galería no encontrada para el usuario', { nickname });
            return res.status(404).json({
                status: 'ERROR',
                message: 'Galería no encontrada para este usuario',
                data: null,
            });
        }

        // Crear relación galería-manga
        const galleryManga = await Gallery_Manga.create({
            gallery_id: gallery.id,
            manga_id: mangaid,
        });

        logger.info('Manga añadido a galería exitosamente', { galleryId: gallery.id, mangaid });

        res.set('Authorization', user.token);

        res.status(200).json({
            status: 'OK',
            message: 'Manga añadido correctamente a la galería',
            data: {
                userId: user.id,
                nickname: user.nickname,
                galleryId: gallery.id,
                galleryName: gallery.name,
                mangaAdded: mangaid
            },
        });
    } catch (error) {
        logger.error('Error al añadir manga a galería', {
            error: error.message,
            stack: error.stack,
        });

        res.status(500).json({
            status: 'ERROR',
            message: 'Error interno al añadir el manga a la galería',
            data: null,
        });
    }
};

const getGallery = async (req, res, next) => {
    try {
        const { nickname } = req.params;

        if (!nickname) {
            return res.status(400).json({
                ok: false,
                missatge: 'El nickname es obligatorio',
                resultat: null,
            });
        }

        const user = await User.findOne({ where: { nickname } });

        if (!user) {
            return res.status(404).json({
                ok: false,
                missatge: 'Usuario no encontrado',
                resultat: null,
            });
        }

        const galleries = await Gallery.findAll({
            where: { user_id: user.id },
        });

        res.status(200).json({
            ok: true,
            missatge: `Galerías de ${user.nickname}`,
            resultat: galleries,
        });
    } catch (error) {
        logger.error('Error al recuperar las galerías del usuario', {
            error: error.message,
            stack: error.stack,
        });
        next(error);
    }
};

const getGalleryImage = async (req, res, next) => {
    try {
        const { galleryId } = req.params;

        if (!galleryId) {
            return res.status(400).json({
                status: 'ERROR',
                message: 'El ID de la galería es obligatorio',
                data: null,
            });
        }

        // Buscar galería por ID
        const gallery = await Gallery.findByPk(galleryId);

        if (!gallery) {
            return res.status(404).json({
                status: 'ERROR',
                message: 'Galería no encontrada',
                data: null,
            });
        }

        // Si la galería no tiene imagen, usar imagen por defecto
        let imagePath;
        if (!gallery.image_url) {
            imagePath = path.resolve(__dirname, '../../gallery_images/default0.jpg');
        } else {
            imagePath = path.resolve(__dirname, '../../gallery_images', gallery.image_url);
        }

        if (!fs.existsSync(imagePath)) {
            return res.status(404).json({
                status: 'ERROR',
                message: 'Imagen no encontrada con path: ' + imagePath,
                data: null,
            });
        }

        // Enviar la imagen
        res.sendFile(imagePath);
    } catch (error) {
        console.error('Error al intentar recuperar la imagen de la galería', error);
        res.status(500).json({
            status: 'ERROR',
            message: 'Error al intentar recuperar la imagen de la galería',
            data: null,
        });
    }
};

const getMangasGallery = async (req, res, next) => {
    try {
        const { id } = req.params;

        if (!id) {
            return res.status(400).json({
                ok: false,
                missatge: 'El id es obligatorio',
                resultat: null,
            });
        }

        const galleries = await Gallery_Manga.findAll({
            where: { gallery_id: id },
        });

        res.status(200).json({
            ok: true,
            missatge: `Mangas de la galeria de ${id}`,
            resultat: galleries,
        });
    } catch (error) {
        logger.error('Error al recuperar los mangas de la galeria del usuario', {
            error: error.message,
            stack: error.stack,
        });
        next(error);
    }
};

const removeFromGallery = async (req, res) => {
    try {
        const { nickname, galleryName, manganame } = req.body;

        if (!nickname || !galleryName || !manganame) {
            return res.status(400).json({
                status: 'ERROR',
                message: 'Faltan datos requeridos: nickname, galleryName o manganame.',
                data: null,
            });
        }

        // Buscar al usuario por nickname
        const user = await User.findOne({ where: { nickname } });
        if (!user) {
            return res.status(404).json({
                status: 'ERROR',
                message: 'Usuario no encontrado.',
                data: null,
            });
        }

        // Buscar galería por nombre y usuario
        const gallery = await Gallery.findOne({
            where: {
                name: galleryName,
                user_id: user.id
            }
        });

        if (!gallery) {
            return res.status(404).json({
                status: 'ERROR',
                message: 'Galería no encontrada.',
                data: null,
            });
        }

        // Buscar relación en Gallery_Manga
        const galleryManga = await Gallery_Manga.findOne({
            where: {
                gallery_id: gallery.id,
                manga_name: manganame
            }
        });

        if (!galleryManga) {
            return res.status(404).json({
                status: 'ERROR',
                message: 'El manga no está en esta galería.',
                data: null,
            });
        }

        await galleryManga.destroy();

        return res.status(200).json({
            status: 'OK',
            message: 'Manga eliminado correctamente de la galería.',
            data: {
                galleryId: gallery.id,
                mangaRemoved: manganame
            }
        });

    } catch (error) {
        console.error('Error al eliminar el manga:', error);
        return res.status(500).json({
            status: 'ERROR',
            message: 'Error interno del servidor.',
            data: null,
        });
    }
};

const changeGalleryImage = async (req, res, next) => {
    try {
        console.log('Iniciando cambio de imagen de la galeria...');
        const { id, base64 } = req.body;
        console.log('Datos recibidos:', { id, base64 });

        if (!id) {
            return res.status(400).json({
                status: 'ERROR',
                message: 'El id es obligatorio',
                data: null,
            });
        }

        const gallery = await Gallery.findOne({ where: { id } });
        if (!gallery) {
            return res.status(404).json({
                status: 'ERROR',
                message: 'Galería no encontrada',
                data: null,
            });
        }

        // CASO 1: base64 === null → Eliminar imagen, salvo si es default0.jpg
        if (base64 === null && gallery.image_url !== null) {
            if (gallery.image_url !== 'default0.jpg') {
                const oldImagePath = path.resolve(__dirname, '../../gallery_images', gallery.image_url);
                if (fs.existsSync(oldImagePath)) {
                    fs.unlinkSync(oldImagePath);
                }
            } else {
                console.log('La imagen es default0.jpg, no se eliminará.');
            }

            await gallery.update({ image_url: null });
            return res.status(200).json({
                status: 'SUCCESS',
                message: 'La imagen fue eliminada correctamente',
                data: { image_url: null },
            });
        }

        // CASO 2: base64 === '' → Poner imagen por defecto
        if (base64 === '') {
            if (gallery.image_url && gallery.image_url !== 'default0.jpg') {
                const oldImagePath = path.resolve(__dirname, '../../gallery_images', gallery.image_url);
                if (fs.existsSync(oldImagePath)) {
                    fs.unlinkSync(oldImagePath);
                }
            }

            await gallery.update({ image_url: 'default0.jpg' });

            return res.status(200).json({
                status: 'SUCCESS',
                message: 'Se asignó la imagen por defecto',
                data: { image_url: 'default0.jpg' },
            });
        }

        // CASO 3: base64 contiene imagen válida → Procesar imagen nueva
        if (base64) {
            const galleryImagesPath = path.resolve(__dirname, '../../gallery_images');
            if (!fs.existsSync(galleryImagesPath)) {
                fs.mkdirSync(galleryImagesPath, { recursive: true });
            }

            const buffer = Buffer.from(base64, 'base64');
            const newImageName = `${id}_${Date.now()}.jpg`;
            const newImagePath = path.join(galleryImagesPath, newImageName);

            fs.writeFileSync(newImagePath, buffer);

            // Eliminar imagen anterior si no es default
            if (gallery.image_url && gallery.image_url !== 'default0.jpg') {
                const oldImagePath = path.resolve(__dirname, '../../gallery_images', gallery.image_url);
                if (fs.existsSync(oldImagePath)) {
                    fs.unlinkSync(oldImagePath);
                }
            }

            await gallery.update({ image_url: newImageName });

            return res.status(200).json({
                status: 'SUCCESS',
                message: 'Imagen actualizada correctamente',
                data: { image_url: newImageName },
            });
        }

        // Si llega aquí, algo está mal
        return res.status(400).json({
            status: 'ERROR',
            message: 'Datos de imagen inválidos',
            data: null,
        });

    } catch (error) {
        console.error('Error al cambiar la imagen de la galeria:', error);
        return res.status(500).json({
            status: 'ERROR',
            message: 'Error interno del servidor',
            data: null,
        });
    }
};

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
    createGallery,
    dropGallery,
    addInGallery,
    getGallery,
    getGalleryImage,
    getMangasGallery,
    removeFromGallery,
    getUsersByCombination,
    changeGalleryImage,
};
