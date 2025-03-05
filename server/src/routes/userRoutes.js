const express = require('express');
const router = express.Router();
const {
    registerUser,
    validateUser,
    loginUser,
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
 *                 example: admin
 *               password:
 *                 type: string
 *                 description: La contraseña del usuario
 *                 example: admin
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
 *                 example: "123456"
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
 *                 default: "admin"
 *               password:
 *                 type: string
 *                 description: La contraseña del usuario
 *                 default: "admin"
 *     responses:
 *       200:
 *         description: Inicio de sesión exitoso
 *         headers:
 *           Authorization:
 *             description: Token JWT que debe usarse en las siguientes solicitudes
 *             schema:
 *               type: string
 *               example: "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyX2lkIjoiMTIzNDU2In0.KTj-Q6Deq9SHfRzNk-TuNT_1mcXaQ3YjH2J7_z0NS2I"
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
 *                       example: "johndoe"
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

module.exports = router;
