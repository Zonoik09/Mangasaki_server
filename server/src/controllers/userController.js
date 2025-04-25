const User = require('../models/User');
const Verification = require('../models/Verification');

const axios = require('axios');
const crypto = require('crypto');
const { logger } = require('../config/logger');

const bcrypt = require('bcrypt'); // Sirve para encriptar la contraseña del usuario

const fs = require('fs');            // Para manipulación de archivos (leer, escribir, borrar)
const path = require('path');        // Para trabajar con rutas de archivos

const multer = require('multer');    // Para manejar la subida de archivos (multipart/form-data)


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

        logger.info('Nueva solicitud para registrar un usuario', { nickname, password, phone });

        if (!nickname || !password || !phone) {
            return res.status(400).json({ status: 'ERROR', message: 'Todos los campos son obligatorios' });
        }

        // Verifica si el nombre de usuario (nickname) ya está registrado
        const existingNickname = await User.findOne({ where: { nickname } });
        if (existingNickname) {
            logger.info('El nombre de usuario que se quiere registrar ya existe');
            return res.status(401).json({ status: 'ERROR', message: 'The nickname is already registered' });
        }

        // Verifica si el número de teléfono ya está registrado
        const existingPhone = await User.findOne({ where: { phone } });
        if (existingPhone) {
            logger.info('El teléfono de usuario que se quiere registrar ya existe');
            return res.status(402).json({ status: 'ERROR', message: 'The phone number is already registered'});
        }

        const hashedPassword = await bcrypt.hash(password, 12); //2^12 = 4096 iteraciones


        // Si no existe, crea un nuevo usuario
        const newUser = await User.create({
            nickname,
            password: hashedPassword,
            phone,
            token: null,
            image_url: null,
            banner_url: null,
        });

        logger.info('Usuario registrado correctamente', { newUser });

        // Genera el código de verificación
        const verificationCode = Math.floor(100000 + Math.random() * 900000);

        // Crea un nuevo registro de verificación
        const newVerification = await Verification.create({
            user_id: newUser.id,
            code: verificationCode,
        });

        // Envía el SMS con el código de verificación
        generateSMS(newUser.phone, verificationCode);

        res.status(201).json({
            status: 'OK',
            message: 'Usuario registrado correctamente',
            data: { userId: newUser.id, nickname, phone },
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

const dropUser = async (req, res, next) => {
    try {
        console.log('Iniciando eliminación de usuario...');

        const { nickname } = req.params;  // Obtenemos el nickname de los parámetros de la URL
        console.log('Datos recibidos:', { nickname });

        // Validación de existencia del nickname
        if (!nickname) {
            console.error('Error: El nickname es obligatorio');
            return res.status(400).json({
                status: 'ERROR',
                message: 'El nickname es obligatorio',
                data: null,
            });
        }
        console.log('Nickname validado:', nickname);

        // Buscar usuario en la base de datos
        console.log('Buscando usuario en la base de datos...');
        const user = await User.findOne({ where: { nickname } });
        if (!user) {
            console.error('Error: Usuario no encontrado');
            return res.status(404).json({
                status: 'ERROR',
                message: 'Usuario no encontrado',
                data: null,
            });
        }
        console.log('Usuario encontrado:', user.nickname);

        // Si el usuario tiene una imagen asociada, eliminar la imagen del sistema de archivos
        if (user.image_url) {
            const userImagesPath = path.resolve(__dirname, '../../user_images');
            const imagePath = path.join(userImagesPath, user.image_url);
            console.log('Eliminando imagen asociada:', imagePath);

            // Verificar si el archivo existe y eliminarlo
            if (fs.existsSync(imagePath)) {
                fs.unlinkSync(imagePath);
                console.log('Imagen eliminada correctamente.');
            } else {
                console.log('La imagen no existe en el sistema de archivos.');
            }
        }

        // Eliminar el usuario de la base de datos
        console.log('Eliminando usuario de la base de datos...');
        await user.destroy();
        console.log('Usuario eliminado correctamente.');

        // Devolver la respuesta
        return res.status(200).json({
            status: 'SUCCESS',
            message: 'Usuario y su imagen eliminados correctamente',
            data: null,
        });

    } catch (error) {
        console.error('Error al eliminar el usuario:', error);
        return res.status(500).json({
            status: 'ERROR',
            message: 'Error al eliminar el usuario',
            data: null,
        });
    }
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

        const isPasswordValid = await bcrypt.compare(password,user.password); // Se comparán las contraseñas para saber si son la misma

        if (!isPasswordValid) {
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
            imagePath = path.resolve(__dirname, '../../user_images/default0.jpg');
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


const getUserBanner = async (req, res, next) => {
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

        // Si el usuario no tiene banner, devolver el banner por defecto
        let bannerPath;
        if (!user.banner_url) {
            bannerPath = path.resolve(__dirname, '../../user_banners/default0.jpg');
        } else {
            bannerPath = path.resolve(__dirname, '../../user_banners', user.banner_url);
        }

        // Verificar si el archivo existe
        if (!fs.existsSync(bannerPath)) {
            return res.status(404).json({
                status: 'ERROR',
                message: 'Banner no encontrado con path: ' + bannerPath,
                data: null,
            });
        }

        // Enviar el banner encontrado
        res.sendFile(bannerPath);
    } catch (error) {
        console.error('Error al intentar recuperar el banner', error);
        res.status(500).json({
            status: 'ERROR',
            message: 'Error al intentar recuperar el banner',
            data: null,
        });
    }
};

const changeUserImage = async (req, res, next) => {
    try {
        console.log('Iniciando cambio de imagen del usuario...');

        const { nickname, base64 } = req.body; // Ahora obtenemos el nickname y la imagen Base64 desde el cuerpo de la solicitud
        console.log('Datos recibidos:', { nickname, base64 });

        // Validaciones de entrada
        if (!nickname) {
            console.error('Error: El nickname es obligatorio');
            return res.status(400).json({
                status: 'ERROR',
                message: 'El nickname es obligatorio',
                data: null,
            });
        }
        console.log('Nickname validado:', nickname);

        // Buscar usuario en la base de datos
        console.log('Buscando usuario en la base de datos...');
        const user = await User.findOne({ where: { nickname } });
        if (!user) {
            console.error('Error: Usuario no encontrado');
            return res.status(404).json({
                status: 'ERROR',
                message: 'Usuario no encontrado',
                data: null,
            });
        }
        console.log('Usuario encontrado:', user.nickname);

        // Si base64 es null y la imagen del usuario ya es null, no hacemos nada
        if (!base64 && user.image_url === null) {
            console.log('No se realiza ningún cambio, la imagen ya es nula.');
            return res.status(200).json({
                status: 'SUCCESS',
                message: 'No se realizó ningún cambio, ya que la imagen es nula',
                data: null,
            });
        }

        // Si base64 es null pero la imagen del usuario no lo es, se actualiza a null y se elimina la imagen del servidor
        if (!base64 && user.image_url !== null) {
            console.log('Base64 es nulo, pero el usuario tiene una imagen. Se eliminará la imagen.');
            
            // Eliminar la imagen anterior del servidor
            const oldImagePath = path.resolve(__dirname, '../../user_images', user.image_url);
            if (fs.existsSync(oldImagePath)) {
                console.log('Eliminando la imagen anterior:', oldImagePath);
                fs.unlinkSync(oldImagePath);
                console.log('Imagen anterior eliminada correctamente.');
            } else {
                console.log('No se encontró la imagen anterior para eliminar.');
            }

            // Actualizar la base de datos a null
            await user.update({ image_url: null });
            console.log('Imagen eliminada correctamente en la base de datos.');
            return res.status(200).json({
                status: 'SUCCESS',
                message: 'La imagen fue eliminada correctamente',
                data: { image_url: null },
            });
        }

        // Si la imagen en base64 es proporcionada, procesamos la imagen
        if (base64) {
            console.log('Base64 recibido, procesando la imagen...');

            // Directorio donde se almacenarán las imágenes
            const userImagesPath = path.resolve(__dirname, '../../user_images');
            console.log('Verificando existencia del directorio de imágenes:', userImagesPath);
            if (!fs.existsSync(userImagesPath)) {
                console.log('El directorio no existe, creándolo...');
                fs.mkdirSync(userImagesPath, { recursive: true });
            }

            // Decodificar la imagen en Base64
            console.log('Decodificando la imagen Base64...');
            const buffer = Buffer.from(base64, 'base64');
            console.log('Imagen decodificada correctamente.');

            // Generar un nombre único para la imagen
            const newImageName = `${nickname}_${Date.now()}.jpg`; // Asumimos que la imagen será en formato JPG
            const newImagePath = path.join(userImagesPath, newImageName);
            console.log('Nuevo nombre de imagen generado:', newImageName);

            // Guardar la imagen en el sistema de archivos
            console.log('Guardando la imagen en el sistema de archivos...');
            fs.writeFileSync(newImagePath, buffer);
            console.log('Imagen guardada correctamente en:', newImagePath);

            // Si el usuario ya tiene una imagen, eliminamos la anterior
            if (user.image_url) {
                const oldImagePath = path.resolve(__dirname, '../../user_images', user.image_url);
                if (fs.existsSync(oldImagePath)) {
                    console.log('Eliminando la imagen anterior:', oldImagePath);
                    fs.unlinkSync(oldImagePath);
                    console.log('Imagen anterior eliminada correctamente.');
                } else {
                    console.log('No se encontró la imagen anterior para eliminar.');
                }
            }

            // Actualizar la base de datos con la nueva URL de la imagen
            console.log('Actualizando la base de datos con la nueva URL de la imagen...');
            await user.update({ image_url: newImageName });
            console.log('Base de datos actualizada correctamente.');

            // Devolver la respuesta
            console.log('Imagen actualizada correctamente.');
            return res.status(200).json({
                status: 'SUCCESS',
                message: 'Imagen actualizada correctamente',
                data: { image_url: newImageName },
            });
        }

    } catch (error) {
        console.error('Error al cambiar la imagen del usuario:', error);
        return res.status(500).json({
            status: 'ERROR',
            message: 'Error al cambiar la imagen del usuario',
            data: null,
        });
    }
};

const changeUserBanner = async (req, res, next) => {
    try {
        console.log('Iniciando cambio de banner del usuario...');

        const { nickname, base64 } = req.body; // Ahora obtenemos el nickname y el banner Base64 desde el cuerpo de la solicitud
        console.log('Datos recibidos:', { nickname, base64 });

        // Validaciones de entrada
        if (!nickname) {
            console.error('Error: El nickname es obligatorio');
            return res.status(400).json({
                status: 'ERROR',
                message: 'El nickname es obligatorio',
                data: null,
            });
        }
        console.log('Nickname validado:', nickname);

        // Buscar usuario en la base de datos
        console.log('Buscando usuario en la base de datos...');
        const user = await User.findOne({ where: { nickname } });
        if (!user) {
            console.error('Error: Usuario no encontrado');
            return res.status(404).json({
                status: 'ERROR',
                message: 'Usuario no encontrado',
                data: null,
            });
        }
        console.log('Usuario encontrado:', user.nickname);

        // Si base64 es null y el banner del usuario ya es null, no hacemos nada
        if (!base64 && user.banner_url === null) {
            console.log('No se realiza ningún cambio, el banner ya es nulo.');
            return res.status(200).json({
                status: 'SUCCESS',
                message: 'No se realizó ningún cambio, ya que el banner es nulo',
                data: null,
            });
        }

        // Si base64 es null pero el banner del usuario no lo es, se actualiza a null y se elimina el banner del servidor
        if (!base64 && user.banner_url !== null) {
            console.log('Base64 es nulo, pero el usuario tiene un banner. Se eliminará el banner.');
            
            // Eliminar el banner anterior del servidor
            const oldBannerPath = path.resolve(__dirname, '../../user_banners', user.banner_url);
            if (fs.existsSync(oldBannerPath)) {
                console.log('Eliminando el banner anterior:', oldBannerPath);
                fs.unlinkSync(oldBannerPath);
                console.log('Banner anterior eliminado correctamente.');
            } else {
                console.log('No se encontró el Banner anterior para eliminar.');
            }

            // Actualizar la base de datos a null
            await user.update({ banner_url: null });
            console.log('Banner eliminado correctamente en la base de datos.');
            return res.status(200).json({
                status: 'SUCCESS',
                message: 'El banner fue eliminado correctamente',
                data: { banner_url: null },
            });
        }

        // Si el banner en base64 es proporcionada, procesamos el banner
        if (base64) {
            console.log('Base64 recibido, procesando el banner...');

            // Directorio donde se almacenarán las imágenes
            const userBannersPath = path.resolve(__dirname, '../../user_banners');
            console.log('Verificando existencia del directorio de banners:', userBannersPath);
            if (!fs.existsSync(userBannersPath)) {
                console.log('El directorio no existe, creándolo...');
                fs.mkdirSync(userBannersPath, { recursive: true });
            }

            // Decodificar el banner en Base64
            console.log('Decodificando el banner Base64...');
            const buffer = Buffer.from(base64, 'base64');
            console.log('Banner decodificado correctamente.');

            // Generar un nombre único para el banner
            const newBannerName = `${nickname}_${Date.now()}.jpg`; // Asumimos que el banner será en formato JPG
            const newBannerPath = path.join(userBannersPath, newBannerName);
            console.log('Nuevo nombre de banner generado:', newBannerName);

            // Guardar el banner en el sistema de archivos
            console.log('Guardando el banner en el sistema de archivos...');
            fs.writeFileSync(newBannerPath, buffer);
            console.log('Banner guardado correctamente en:', newBannerPath);

            // Si el usuario ya tiene una banner, eliminamos el anterior
            if (user.banner_url) {
                const oldBannerPath = path.resolve(__dirname, '../../user_banners', user.banner_url);
                if (fs.existsSync(oldBannerPath)) {
                    console.log('Eliminando el banner anterior:', oldBannerPath);
                    fs.unlinkSync(oldBannerPath);
                    console.log('Banner anterior eliminada correctamente.');
                } else {
                    console.log('No se encontró el banner anterior para eliminar.');
                }
            }

            // Actualizar la base de datos con la nueva URL de el banner
            console.log('Actualizando la base de datos con la nueva URL de el banner...');
            await user.update({ banner_url: newBannerName });
            console.log('Base de datos actualizada correctamente.');

            // Devolver la respuesta
            console.log('Banner actualizado correctamente.');
            return res.status(200).json({
                status: 'SUCCESS',
                message: 'Banner actualizado correctamente',
                data: { banner_url: newBannerName },
            });
        }

    } catch (error) {
        console.error('Error al cambiar el banner del usuario:', error);
        return res.status(500).json({
            status: 'ERROR',
            message: 'Error al cambiar el banner del usuario',
            data: null,
        });
    }
};

module.exports = {
    registerUser,
    validateUser,
    dropUser,
    loginUser,
    getUserInfo,
    getUserImage,
    getUserBanner,
    changeUserImage,
    changeUserBanner,
};
