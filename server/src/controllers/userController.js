const User = require('../models/User');
const Verification = require('../models/Verification');

const axios = require('axios');
const crypto = require('crypto');
const { logger } = require('../config/logger');

const path = require('path');
const fs = require('fs');

const API_SMS_URL = process.env.API_SMS_URL;
const SMS_API_TOKEN = process.env.SMS_API_TOKEN;
const SMS_API_USERNAME = process.env.SMS_API_USERNAME;

/**
 * Registra un usuario y envia SMS
 * @route POST /api/user/register
 */
const registerUser = async (req, res, next) => {
    try {
        const { nickname, password, phone } = req.body;

        logger.info('Nueva solicitud para registrar un usuario', { nickname, password, phone});

        if (!nickname || !password || !phone) {
            return res.status(400).json({ status: 'ERROR', message: 'Todos los campos son obligatorios' });
        }

        const newUser = await User.create({
            nickname,
            password,
            phone,
            token: null,
            image_url: null,
        });

        logger.info('Usuario registrado correctamente', { newUser });

        const verificationCode = Math.floor(100000 + Math.random() * 900000);     

        const newVerification = await Verification.create({
            user_id: newUser.id,
            code: verificationCode,
        });

        generateSMS(newUser.phone, verificationCode);

        res.status(201).json({
            status: 'OK',
            message: 'Usuario registrado correctamente',
            data: {userId: newUser.id, nickname, phone},
        });
    } catch (error) {

        logger.error('Error al registrar el usuario', { error: error.message, stack: error.stack });

        res.status(500).json({
            status: 'ERROR',
            message: 'Error interno al registrar el usuario',
        });
    }
};

const generateSMS = async (receiver, verificationCode) => {

    const text = `Tu+número+de+validación+de+mangasaki:+${verificationCode}`;

    const url = `${API_SMS_URL}/sendsms/?api_token=${SMS_API_TOKEN}&username=${SMS_API_USERNAME}&receiver=${receiver}&text=${text}`;

    try {
        const response = await axios.get(url, {
            timeout: 30000,
            responseType: 'json'
        });

        console.log('SMS enviado con éxito:', response.data);
        return response.data;
    } catch (error) {
        console.error('Error al enviar el SMS:', error);
        throw error;
    }
};

/**
 * Valida un código de verificación para un usuario.
 * @route POST /api/user/validate
 */
const validateUser = async (req, res, next) => {
    try {
        const { userId, code } = req.body;

        logger.info('Nueva solicitud para validar un código de usuario', { userId, code });

        if (!userId || !code) {
            return res.status(400).json({ status: 'ERROR', message: 'Todos los campos son obligatorios' });
        }

        const user = await User.findByPk(userId);
        if (!user) {
            return res.status(404).json({
                status: 'ERROR',
                message: 'Usuario no encontrado',
            });
        }

        const existingVerification = await Verification.findOne({
            where: { user_id: userId }
        });

        if (!existingVerification) {
            return res.status(404).json({
                status: 'ERROR',
                message: 'No se ha encontrado una verificación pendiente para este usuario',
            });
        }

        if (existingVerification.code !== code) {
            return res.status(400).json({
                status: 'ERROR',
                message: 'Código de verificación incorrecto',
            });
        }

        existingVerification.destroy();

        const token = generateToken();

        await user.update({ token });

        res.set('Authorization', token);

        res.status(200).json({
            status: 'OK',
            message: 'Validación de token correcta',
            data: {
                userId: user.id,
                phone: user.nickname,
                nickname: user.phone,
            },
        });

    } catch (error) {
        logger.error('Error al validar el usuario', { error: error.message, stack: error.stack });

        res.status(500).json({
            status: 'ERROR',
            message: 'Error interno al validar el código',
            data: null,
        });
    }
};

const generateToken = (length = 50) => {
    return crypto.randomBytes(length).toString('hex').slice(0, length);
};

/**
 * Inicia sesión un usuario.
 * @route POST /api/user/login
 */
const loginUser = async (req, res, next) => {
    try {
        const { nickname, password } = req.body;

        logger.info('Nueva solicitud de inicio de sesión', { nickname });

        if (!nickname || !password ) {

            return res.status(400).json({
                status: 'ERROR',
                message: 'El nickname y la contraseña son obligatorios',
                data: null,
            });
        }

        const user = await User.findOne({
            where: { nickname },
        });

        if (!user) {

            logger.warn('Usuario no encontrado', { nickname });
            return res.status(404).json({
                status: 'ERROR',
                message: 'Usuario no encontrado',
                data: null,
            });
        }

        if (!user.token) {
            logger.warn(`Token no validado para el usuario ${nickname}`);
            return res.status(401).json({
                status: 'ERROR',
                message: 'La cuenta no está validada',
                data: null,
            });
        }

        if (user.password !== password) {
            logger.warn(`Contraseña incorrecta para el usuario ${nickname}`);
            return res.status(401).json({
                status: 'ERROR',
                message: 'Contraseña incorrecta',
                data: null,
            });
        }

        logger.info('Inicio de sesión exitoso', { userId: user.id });

        res.set('Authorization', user.token);

        res.status(200).json({
            status: 'OK',
            message: 'Inicio de sesión exitoso',
            data: {
                userId: user.id,
                phone: user.phone,
                nickname: user.nickname,
                email: user.email,
                type_id: user.type_id,
            },
        });
    } catch (error) {

        logger.error('Error al iniciar sesión', {
            error: error.message,
            stack: error.stack,
        });

        res.status(500).json({
            status: 'ERROR',
            message: 'Error interno al iniciar sesión',
            data: null,
        });
    }
};

const getUserInfo = async (req, res, next) => {
    try {
        const { nickname } = req.params; // Acceder al nickname de la URL

        // Verificar si se ha proporcionado un nickname
        if (!nickname) {
            return res.status(400).json({
                ok: false,
                missatge: 'El nickname es obligatorio',
                resultat: null,
            });
        }

        logger.info(`Obteniendo información del usuario con nickname: ${nickname}`);

        // Buscar al usuario por nickname
        const user = await User.findOne({
            where: { nickname },
        });

        // Si el usuario no existe
        if (!user) {
            return res.status(404).json({
                ok: false,
                missatge: 'Usuario no encontrado',
                resultat: null,
            });
        }

        // Respuesta exitosa con los datos del usuario
        res.status(200).json({
            ok: true,
            missatge: `Información del usuario con nickname: ${user.nickname}`,
            resultat: {
                id: user.id,
                nickname: user.nickname,
                phone: user.phone,
                image_url: user.image_url || null, // Asegurarse de que no sea undefined
            },
        });
    } catch (error) {
        logger.error('Error al recuperar la información del usuario', {
            error: error.message,
            stack: error.stack,
        });
        next(error); // Delegar el error al middleware de manejo de errores
    }
};

const getUserImage = async (req, res, next) => {
    try {
        const { nickname } = req.params;

        if (!nickname) {
            return res.status(400).json({
                status: 'ERROR',
                message: 'El nickname es obligatorio',
                data: null,
            });
        }

        // Buscar usuario por nickname en la base de datos
        const user = await User.findOne({ where: { nickname } });

        if (!user) {
            return res.status(404).json({
                status: 'ERROR',
                message: 'Usuario no encontrado',
                data: null,
            });
        }

        // Si el usuario no tiene imagen, devolver la imagen por defecto
        let imagePath;
        if (!user.image_url) {
            imagePath = path.resolve(__dirname, '../../user_images/default.jpg');
        } else {
            imagePath = path.resolve(__dirname, '../../user_images', user.image_url);
        }

        // Verificar si el archivo existe
        if (!fs.existsSync(imagePath)) {
            return res.status(404).json({
                status: 'ERROR',
                message: 'Imagen no encontrada con path: ' + imagePath,
                data: null,
            });
        }

        // Enviar la imagen encontrada
        res.sendFile(imagePath);
    } catch (error) {
        console.error('Error al intentar recuperar la imagen', error);
        res.status(500).json({
            status: 'ERROR',
            message: 'Error al intentar recuperar la imagen',
            data: null,
        });
    }
};

const changeUserImage = async (req, res, next) => {
    try {
        const { nickname } = req.params;
        const image = req.file; // La imagen se recibe en FormData como archivo

        if (!nickname) {
            return res.status(400).json({
                status: 'ERROR',
                message: 'El nickname es obligatorio',
                data: null,
            });
        }

        const user = await User.findOne({ where: { nickname } });

        if (!user) {
            return res.status(404).json({
                status: 'ERROR',
                message: 'Usuario no encontrado',
                data: null,
            });
        }

        const userImagesPath = path.resolve(__dirname, '../../user_images');

        // Si no existe el directorio de imágenes, crearlo
        if (!fs.existsSync(userImagesPath)) {
            fs.mkdirSync(userImagesPath, { recursive: true });
        }

        // 🔹 CASO 1: Si `image` es `null`, eliminar la imagen del usuario y actualizar en la BD
        if (!image) {
            if (user.image_url) {
                const oldImagePath = path.join(userImagesPath, user.image_url);
                if (fs.existsSync(oldImagePath)) {
                    fs.unlinkSync(oldImagePath);
                }
            }

            await user.update({ image_url: null });

            return res.status(200).json({
                status: 'SUCCESS',
                message: 'Imagen eliminada correctamente',
                data: { image_url: null },
            });
        }

        // 🔹 CASO 2: Si `image` tiene un archivo, reemplazar la imagen anterior por la nueva
        if (user.image_url) {
            const oldImagePath = path.join(userImagesPath, user.image_url);
            if (fs.existsSync(oldImagePath)) {
                fs.unlinkSync(oldImagePath);
            }
        }

        // Guardar la nueva imagen
        const newImageName = `${nickname}_${Date.now()}${path.extname(image.originalname)}`;
        const newImagePath = path.join(userImagesPath, newImageName);
        fs.writeFileSync(newImagePath, image.buffer);

        // Actualizar en la base de datos
        await user.update({ image_url: newImageName });

        res.status(200).json({
            status: 'SUCCESS',
            message: 'Imagen actualizada correctamente',
            data: { image_url: newImageName },
        });
    } catch (error) {
        console.error('Error al cambiar la imagen del usuario:', error);
        res.status(500).json({
            status: 'ERROR',
            message: 'Error al cambiar la imagen del usuario',
            data: null,
        });
    }
};


module.exports = {
    registerUser,
    validateUser,
    loginUser,
    getUserInfo,
    getUserImage,
    changeUserImage,
};
