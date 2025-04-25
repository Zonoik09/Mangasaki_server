const express = require('express');
const router = express.Router();

const {
    createGallery,
    dropGallery,
    addInGallery,
} = require('../controllers/userController.js');


/**
 * @swagger
 * /api/gallery/create_gallery:
 *   post:
 *     summary: Crea una nueva galería de manga para un usuario
 *     description: Crea una galería asociada a un usuario existente utilizando su nickname.
 *     tags: [Gallery]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               nickname:
 *                 type: string
 *                 description: El nickname del usuario dueño de la galería
 *                 example: "admin"
 *               name:
 *                 type: string
 *                 description: El nombre de la galería a crear
 *                 example: "Mi primera galería"
 *     responses:
 *       200:
 *         description: Galería creada exitosamente
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
 *                   example: "Galería creada exitosamente"
 *                 data:
 *                   type: object
 *                   properties:
 *                     userId:
 *                       type: integer
 *                       example: 5
 *                     nickname:
 *                       type: string
 *                       example: "mangafan123"
 *                     galleryId:
 *                       type: integer
 *                       example: 42
 *                     galleryName:
 *                       type: string
 *                       example: "Mi primera galería"
 *       400:
 *         description: El nickname y el nombre de la galería son obligatorios
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
 *                   example: "El nickname y el nombre son obligatorios."
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
 *         description: Error interno al crear la galería
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
 *                   example: "Error interno al crear la galería"
 */
router.post('/create_gallery', createGallery);

/**
 * @swagger
 * /api/gallery/delete_gallery:
 *   delete:
 *     summary: Elimina una galería de un usuario
 *     description: Elimina una galería específica asociada a un usuario mediante su nickname y el nombre de la galería.
 *     tags: [Gallery]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               nickname:
 *                 type: string
 *                 description: El nickname del usuario dueño de la galería
 *                 example: "admin"
 *               name:
 *                 type: string
 *                 description: El nombre de la galería a eliminar
 *                 example: "Mi primera galería"
 *     responses:
 *       200:
 *         description: Galería eliminada exitosamente
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
 *                   example: "Galería eliminada correctamente"
 *                 data:
 *                   type: object
 *                   properties:
 *                     galleryId:
 *                       type: integer
 *                       example: 42
 *                     galleryName:
 *                       type: string
 *                       example: "Mi primera galería"
 *       400:
 *         description: El nickname y el nombre de la galería son obligatorios
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
 *                   example: "El nickname y el nombre de la galería son obligatorios"
 *       404:
 *         description: Usuario o galería no encontrados
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
 *                   example: "Galería no encontrada para este usuario"
 *       500:
 *         description: Error interno al eliminar la galería
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
 *                   example: "Error interno al eliminar la galería"
 */
router.delete('/delete_gallery', dropGallery);

/**
 * @swagger
 * /api/gallery/add_In_Gallery:
 *   post:
 *     summary: Añade un manga a una galería de un usuario
 *     description: Permite agregar un manga a una galería específica de un usuario existente, usando su nickname, el nombre de la galería y el nombre del manga.
 *     tags: [Gallery]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               nickname:
 *                 type: string
 *                 description: Nickname del usuario dueño de la galería
 *                 example: "admin"
 *               galleryName:
 *                 type: string
 *                 description: Nombre de la galería donde se agregará el manga
 *                 example: "Favoritos"
 *               manganame:
 *                 type: string
 *                 description: Nombre del manga a agregar
 *                 example: "One Piece"
 *     responses:
 *       200:
 *         description: Manga añadido correctamente a la galería
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
 *                   example: "Manga añadido correctamente a la galería"
 *                 data:
 *                   type: object
 *                   properties:
 *                     userId:
 *                       type: integer
 *                       example: 5
 *                     nickname:
 *                       type: string
 *                       example: "mangafan123"
 *                     galleryId:
 *                       type: integer
 *                       example: 42
 *                     galleryName:
 *                       type: string
 *                       example: "Favoritos"
 *                     mangaAdded:
 *                       type: string
 *                       example: "One Piece"
 *       400:
 *         description: Datos incompletos o inválidos
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
 *                   example: "El nickname, el nombre de la galería y el nombre del manga son obligatorios."
 *       404:
 *         description: Usuario o galería no encontrada
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
 *                   example: "Galería no encontrada para este usuario"
 *       500:
 *         description: Error interno al añadir el manga
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
 *                   example: "Error interno al añadir el manga a la galería"
 */
router.post('/add_In_Gallery', addInGallery);

module.exports = router;

