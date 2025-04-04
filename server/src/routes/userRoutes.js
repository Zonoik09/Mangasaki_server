const express = require('express');
const router = express.Router();

const {
    registerUser,
    validateUser,
    dropUser,
    loginUser,
    getUserInfo,
    getUserImage,
    getUserBanner,
    changeUserImage,
    changeUserBanner,
} = require('../controllers/userController.js');

/**
 * @swagger
 * /api/user/register:
 *   post:
 *     summary: Registra un nuevo usuario con nickname, contraseña y teléfono
 *     tags: [User]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               nickname:
 *                 type: string
 *                 description: El nickname del usuario
 *                 example: user
 *               password:
 *                 type: string
 *                 description: La contraseña del usuario
 *                 example: user
 *               phone:
 *                 type: string
 *                 description: El número de teléfono del usuario
 *                 example: 655179162
 *     responses:
 *       200:
 *         description: Registro exitoso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: "success"
 *                 message:
 *                   type: string
 *                   example: "Usuario registrado correctamente"
 *       400:
 *         description: Datos inválidos o incompletos
 *       500:
 *         description: Error interno del servidor
 */
router.post('/register', registerUser);

/**
 * @swagger
 * /api/user/validate:
 *   post:
 *     summary: Valida un código de 6 cifras para un usuario específico
 *     tags: [User]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               userId:
 *                 type: string
 *                 description: El ID del usuario a validar
 *                 example: "2"
 *               code:
 *                 type: string
 *                 description: El código de 6 cifras enviado para validación
 *                 example: "654321"
 *     responses:
 *       200:
 *         description: Código validado correctamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: "success"
 *                 message:
 *                   type: string
 *                   example: "Código validado correctamente"
 *       400:
 *         description: Código inválido o formato incorrecto
 *       404:
 *         description: Usuario no encontrado
 *       500:
 *         description: Error interno del servidor
 */
router.post('/validate', validateUser);

/**
 * @swagger
 * /api/user/dropUser/{nickname}:
 *   delete:
 *     summary: Elimina un usuario y su imagen asociada por su nickname
 *     description: Endpoint para eliminar un usuario y la imagen asociada a él a través de su nickname.
 *     tags: [User]
 *     parameters:
 *       - in: path
 *         name: nickname
 *         required: true
 *         description: El nickname del usuario que se desea eliminar
 *         schema:
 *           type: string
 *           example: admin
 *     responses:
 *       200:
 *         description: Usuario y su imagen eliminados correctamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: "SUCCESS"
 *                 message:
 *                   type: string
 *                   example: "Usuario y su imagen eliminados correctamente"
 *       400:
 *         description: El nickname es obligatorio
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: "ERROR"
 *                 message:
 *                   type: string
 *                   example: "El nickname es obligatorio"
 *       404:
 *         description: Usuario no encontrado
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: "ERROR"
 *                 message:
 *                   type: string
 *                   example: "Usuario no encontrado"
 *       500:
 *         description: Error interno del servidor
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: "ERROR"
 *                 message:
 *                   type: string
 *                   example: "Error al intentar eliminar el usuario"
 */
router.delete('/dropUser/:nickname', dropUser);

/**
 * @swagger
 * /api/user/login:
 *   post:
 *     summary: Inicia sesión con un nickname y una contraseña
 *     tags: [User]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               nickname:
 *                 type: string
 *                 description: El nickname del usuario para iniciar sesión
 *                 default: "user"
 *               password:
 *                 type: string
 *                 description: La contraseña del usuario
 *                 default: "user"
 *     responses:
 *       200:
 *         description: Inicio de sesión exitoso
 *         headers:
 *           Authorization:
 *             description: Token JWT que debe usarse en las siguientes solicitudes
 *             schema:
 *               type: string
 *               example: "Authorization eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyX2lkIjoiMTIzNDU2In0.KTj-Q6Deq9SHfRzNk-TuNT_1mcXaQ3YjH2J7_z0NS2I"
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: "success"
 *                 message:
 *                   type: string
 *                   example: "Inicio de sesión exitoso"
 *                 data:
 *                   type: object
 *                   properties:
 *                     userId:
 *                       type: string
 *                       example: "123456"
 *                     nickname:
 *                       type: string
 *                       example: "user"
 *       400:
 *         description: Datos inválidos o formato incorrecto
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: "ERROR"
 *                 message:
 *                   type: string
 *                   example: "Por favor, ingrese un nickname y una contraseña válidos"
 *       401:
 *         description: Usuario o contraseña incorrectos
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: "ERROR"
 *                 message:
 *                   type: string
 *                   example: "Usuario o contraseña incorrectos"
 *       500:
 *         description: Error interno del servidor
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: "ERROR"
 *                 message:
 *                   type: string
 *                   example: "Error interno al intentar iniciar sesión"
 */
router.post('/login', loginUser);

/**
 * @swagger
 * /api/user/getUserInfo/{nickname}:
 *   get:
 *     summary: Obtiene la información del usuario a través del nickname
 *     description: Endpoint para obtener la información de un usuario específico utilizando su nickname.
 *     tags: [User]
 *     parameters:
 *       - in: path
 *         name: nickname
 *         required: true
 *         description: El nickname del usuario para obtener su información
 *         schema:
 *           type: string
 *           example: admin
 *     responses:
 *       200:
 *         description: Información del usuario obtenida correctamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: "OK"
 *                 message:
 *                   type: string
 *                   example: "Información del usuario con nickname: admin"
 *                 data:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: integer
 *                       example: 1
 *                     nickname:
 *                       type: string
 *                       example: "admin"
 *                     phone:
 *                       type: string
 *                       example: "658541674"
 *                     image_url:
 *                       type: string
 *                       example: null
 *       400:
 *         description: El nickname es obligatorio
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: "ERROR"
 *                 message:
 *                   type: string
 *                   example: "El nickname es obligatorio"
 *                 data:
 *                   type: null
 *       404:
 *         description: Usuario no encontrado
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: "ERROR"
 *                 message:
 *                   type: string
 *                   example: "Usuario no encontrado"
 *                 data:
 *                   type: null
 *       500:
 *         description: Error interno del servidor
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: "ERROR"
 *                 message:
 *                   type: string
 *                   example: "Error interno al recuperar la información del usuario"
 *                 data:
 *                   type: null
 */
router.get('/getUserInfo/:nickname', getUserInfo);

/**
 * @swagger
 * /api/user/getUserImage/{nickname}:
 *   get:
 *     summary: Obtiene la imagen del usuario por su nickname
 *     description: Endpoint para obtener la imagen de un usuario a través de su nickname.
 *     tags: [User]
 *     parameters:
 *       - in: path
 *         name: nickname
 *         required: true
 *         description: El nickname del usuario cuya imagen se quiere obtener
 *         schema:
 *           type: string
 *           example: admin
 *     responses:
 *       200:
 *         description: Imagen obtenida correctamente
 *         content:
 *           application/octet-stream:
 *             schema:
 *               type: string
 *               format: binary
 *       400:
 *         description: El nickname es obligatorio
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: "ERROR"
 *                 message:
 *                   type: string
 *                   example: "El nickname es obligatorio"
 *       404:
 *         description: Imagen no encontrada
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: "ERROR"
 *                 message:
 *                   type: string
 *                   example: "Imagen no encontrada"
 *       500:
 *         description: Error interno del servidor
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: "ERROR"
 *                 message:
 *                   type: string
 *                   example: "Error al intentar recuperar la imagen"
 */
router.get('/getUserImage/:nickname', getUserImage);


/**
 * @swagger
 * /api/user/getUserBanner/{nickname}:
 *   get:
 *     summary: Obtiene el banner del usuario por su nickname
 *     description: Endpoint para obtener el banner de un usuario a través de su nickname.
 *     tags: [User]
 *     parameters:
 *       - in: path
 *         name: nickname
 *         required: true
 *         description: El nickname del usuario cuya banner se quiere obtener
 *         schema:
 *           type: string
 *           example: admin
 *     responses:
 *       200:
 *         description: Banner obtenido correctamente
 *         content:
 *           application/octet-stream:
 *             schema:
 *               type: string
 *               format: binary
 *       400:
 *         description: El nickname es obligatorio
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: "ERROR"
 *                 message:
 *                   type: string
 *                   example: "El nickname es obligatorio"
 *       404:
 *         description: Banner no encontrado
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: "ERROR"
 *                 message:
 *                   type: string
 *                   example: "Banner no encontrado"
 *       500:
 *         description: Error interno del servidor
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: "ERROR"
 *                 message:
 *                   type: string
 *                   example: "Error al intentar recuperar el banner"
 */
router.get('/getUserBanner/:nickname', getUserBanner); 

/**
 * @swagger
 * /api/user/changeUserProfileImage:
 *   post:
 *     summary: Cambia la imagen de perfil de un usuario
 *     description: Endpoint para actualizar la imagen de perfil de un usuario usando el nickname y la imagen en base64.
 *     tags: [User]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               nickname:
 *                 type: string
 *                 description: El nickname del usuario para cambiarle la imagen de perfil
 *                 default: "admin"
 *               base64:
 *                 type: string
 *                 description: La imagen en base64
 *                 default: ""
 *     responses:
 *       200:
 *         description: Imagen de perfil actualizada correctamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: "SUCCESS"
 *                 message:
 *                   type: string
 *                   example: "Imagen actualizada correctamente"
 *                 imageUrl:
 *                   type: string
 *                   example: "/uploads/1710456789-profile.jpg"
 *       400:
 *         description: El nickname o la imagen son obligatorios
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: "ERROR"
 *                 message:
 *                   type: string
 *                   example: "El nickname y la imagen son obligatorios"
 *       404:
 *         description: Usuario no encontrado
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: "ERROR"
 *                 message:
 *                   type: string
 *                   example: "Usuario no encontrado"
 *       500:
 *         description: Error interno del servidor
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: "ERROR"
 *                 message:
 *                   type: string
 *                   example: "Error al actualizar la imagen de perfil"
 */
router.post('/changeUserProfileImage', changeUserImage);

/**
 * @swagger
 * /api/user/changeUserProfileBanner:
 *   post:
 *     summary: Cambia el banner de perfil de un usuario
 *     description: Endpoint para actualizar el banner de perfil de un usuario usando el nickname y el banner en base64.
 *     tags: [User]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               nickname:
 *                 type: string
 *                 description: El nickname del usuario para cambiarle el banner de perfil
 *                 default: "admin"
 *               base64:
 *                 type: string
 *                 description: El banner en base64
 *                 default: ""
 *     responses:
 *       200:
 *         description: Banner de perfil actualizado correctamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: "SUCCESS"
 *                 message:
 *                   type: string
 *                   example: "Banner actualizado correctamente"
 *                 bannerUrl:
 *                   type: string
 *                   example: "/uploads/1710456789-profile.jpg"
 *       400:
 *         description: El nickname o el banner son obligatorios
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: "ERROR"
 *                 message:
 *                   type: string
 *                   example: "El nickname y el banner son obligatorios"
 *       404:
 *         description: Usuario no encontrado
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: "ERROR"
 *                 message:
 *                   type: string
 *                   example: "Usuario no encontrado"
 *       500:
 *         description: Error interno del servidor
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: "ERROR"
 *                 message:
 *                   type: string
 *                   example: "Error al actualizar el banner de perfil"
 */
router.post('/changeUserProfileBanner', changeUserBanner);

module.exports = router;