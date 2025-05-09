const express = require('express');
const router = express.Router();

const {
    createGallery,
    dropGallery,
    addInGallery,
    getGallery,
    getGalleryImage,
    getMangasGallery,
    removeFromGallery,
    changeGalleryImage,
} = require('../controllers/galleryController.js');


/**
 * @swagger
 * /api/gallery/create:
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
router.post('/create', createGallery);

/**
 * @swagger
 * /api/gallery/delete:
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
router.delete('/delete', dropGallery);

/**
 * @swagger
 * /api/gallery/addin:
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
router.post('/addIn', addInGallery);

/**
 * @swagger
 * /api/gallery/getGallery/{nickname}:
 *   get:
 *     summary: Obtiene las galerías del usuario por su nickname
 *     description: Devuelve todas las galerías asociadas a un usuario específico, identificado por su nickname.
 *     tags: [Gallery]
 *     parameters:
 *       - in: path
 *         name: nickname
 *         required: true
 *         description: Nickname del usuario cuyas galerías se desean obtener
 *         schema:
 *           type: string
 *           example: admin
 *     responses:
 *       200:
 *         description: Galerías del usuario obtenidas correctamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 ok:
 *                   type: boolean
 *                   example: true
 *                 missatge:
 *                   type: string
 *                   example: "Galerías de admin"
 *                 resultat:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: integer
 *                         example: 1
 *                       title:
 *                         type: string
 *                         example: "Vacaciones en la playa"
 *                       userId:
 *                         type: integer
 *                         example: 5
 *       400:
 *         description: El nickname es obligatorio
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 ok:
 *                   type: boolean
 *                   example: false
 *                 missatge:
 *                   type: string
 *                   example: "El nickname es obligatorio"
 *                 resultat:
 *                   type: null
 *       404:
 *         description: Usuario no encontrado
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 ok:
 *                   type: boolean
 *                   example: false
 *                 missatge:
 *                   type: string
 *                   example: "Usuario no encontrado"
 *                 resultat:
 *                   type: null
 *       500:
 *         description: Error interno al recuperar las galerías
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 ok:
 *                   type: boolean
 *                   example: false
 *                 missatge:
 *                   type: string
 *                   example: "Error al recuperar las galerías del usuario"
 *                 resultat:
 *                   type: null
 */
router.get('/getGallery/:nickname', getGallery);

/**
 * @swagger
 * /api/gallery/getMangasGallery/{id}:
 *   get:
 *     summary: Obtiene los mangas de una galería por su ID
 *     description: Devuelve todos los mangas asociados a una galería específica, identificada por su ID.
 *     tags: [Gallery]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID de la galería cuyos mangas se desean obtener
 *         schema:
 *           type: string
 *           example: 1
 *     responses:
 *       200:
 *         description: Mangas de la galería obtenidos correctamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 ok:
 *                   type: boolean
 *                   example: true
 *                 missatge:
 *                   type: string
 *                   example: "Mangas de la galería de admin"
 *                 resultat:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: integer
 *                         example: 10
 *                       title:
 *                         type: string
 *                         example: "Manga A"
 *                       description:
 *                         type: string
 *                         example: "Un manga de acción"
 *       400:
 *         description: El ID es obligatorio
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 ok:
 *                   type: boolean
 *                   example: false
 *                 missatge:
 *                   type: string
 *                   example: "El ID es obligatorio"
 *                 resultat:
 *                   type: null
 *       404:
 *         description: Galería no encontrada
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 ok:
 *                   type: boolean
 *                   example: false
 *                 missatge:
 *                   type: string
 *                   example: "Galería no encontrada"
 *                 resultat:
 *                   type: null
 *       500:
 *         description: Error interno al recuperar los mangas de la galería
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 ok:
 *                   type: boolean
 *                   example: false
 *                 missatge:
 *                   type: string
 *                   example: "Error al recuperar los mangas de la galería"
 *                 resultat:
 *                   type: null
 */
router.get('/getMangasGallery/:id', getMangasGallery);

/**
 * @swagger
 * /api/gallery/removefrom
 *   delete:
 *     summary: Elimina un manga de una galería de un usuario
 *     description: Elimina un manga de la galería asociada a un usuario, identificada por su nombre de galería y manga.
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
 *                 example: "admin"
 *               galleryName:
 *                 type: string
 *                 example: "Mi galería"
 *               manganame:
 *                 type: string
 *                 example: "Manga A"
 *     responses:
 *       200:
 *         description: Manga eliminado de la galería correctamente
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
 *                   example: "Manga eliminado correctamente de la galería"
 *                 data:
 *                   type: object
 *                   properties:
 *                     userId:
 *                       type: integer
 *                       example: 1
 *                     nickname:
 *                       type: string
 *                       example: "admin"
 *                     galleryId:
 *                       type: integer
 *                       example: 2
 *                     galleryName:
 *                       type: string
 *                       example: "Mi galería"
 *                     mangaRemoved:
 *                       type: string
 *                       example: "Manga A"
 *       400:
 *         description: El nickname, el nombre de la galería y el nombre del manga son obligatorios
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
 *                   example: "El nickname, el nombre de la galería y el nombre del manga son obligatorios"
 *                 data:
 *                   type: null
 *       404:
 *         description: Galería o manga no encontrado
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
 *                   example: "Manga no encontrado en la galería"
 *                 data:
 *                   type: null
 *       500:
 *         description: Error interno al eliminar el manga de la galería
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
 *                   example: "Error interno al eliminar el manga de la galería"
 *                 data:
 *                   type: null
 */
router.delete('/removefrom', removeFromGallery);


/**
 * @swagger
 * /api/gallery/getGalleryImage/{galleryId}:
 *   get:
 *     summary: Obtiene la imagen de una galería por su ID
 *     description: Endpoint para obtener la imagen de una galería a través de su ID. Si no tiene imagen, se devuelve una por defecto.
 *     tags: [Gallery]
 *     parameters:
 *       - in: path
 *         name: galleryId
 *         required: true
 *         description: El ID de la galería cuya imagen se quiere obtener
 *         schema:
 *           type: integer
 *           example: 5
 *     responses:
 *       200:
 *         description: Imagen obtenida correctamente
 *         content:
 *           application/octet-stream:
 *             schema:
 *               type: string
 *               format: binary
 *       400:
 *         description: El ID de la galería es obligatorio
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
 *                   example: "El ID de la galería es obligatorio"
 *       404:
 *         description: Imagen o galería no encontrada
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
 *                   example: "Error al intentar recuperar la imagen de la galería"
 */
router.get('/getGalleryImage/:galleryId', getGalleryImage);

/**
 * @swagger
 * /api/gallery/changeImage:
 *   post:
 *     summary: Cambia o elimina la imagen de una galería
 *     description: Permite actualizar la imagen de una galería mediante una cadena en base64 o eliminarla si se pasa como null.
 *     tags: [Gallery]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - id
 *             properties:
 *               id:
 *                 type: integer
 *                 description: ID de la galería
 *                 example: 5
 *               base64:
 *                 type: string
 *                 nullable: true
 *                 description: Cadena base64 de la imagen (puede ser null para eliminar)
 *                 example: "iVBORw0KGgoAAAANSUhEUgAA..."
 *     responses:
 *       200:
 *         description: Imagen actualizada o eliminada correctamente
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
 *                 data:
 *                   type: object
 *                   nullable: true
 *                   properties:
 *                     image_url:
 *                       type: string
 *                       nullable: true
 *                       example: "5_1715104109930.jpg"
 *       400:
 *         description: El ID es obligatorio
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
 *                   example: "El id es obligatorio"
 *       404:
 *         description: Galería no encontrada
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
 *                   example: "gallery no encontrada"
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
 *                   example: "Error al cambiar la imagen de la galeria"
 */
router.post('/changeImage', changeGalleryImage);


module.exports = router;

