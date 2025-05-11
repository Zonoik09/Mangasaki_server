const express = require('express');
const router = express.Router();
const {
    analyzeManga,
    addOrUpdateUserMangaStatus,
    deleteUserManga,
    getUserMangasByStatus,
} = require('../controllers/mangaController.js');

/**
 * @swagger
 * /api/manga/analyzeManga:
 *   post:
 *     summary: Analiza un libro basado en una imagen en Base64
 *     tags: [Manga]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               base64Image:
 *                 type: string
 *                 description: Imagen codificada en Base64 para analizar
 *                 example: "iVBORw0KGgoAAAANSUhEUgAA..."
 *     responses:
 *       200:
 *         description: Análisis exitoso
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
 *                   example: "Libro analizado correctamente"
 *       400:
 *         description: Datos inválidos o incompletos
 *       500:
 *         description: Error interno del servidor
 */
router.post('/analyzeManga', analyzeManga);

/**
 * @swagger
 * /api/manga/mvMangaByStatus:
 *   post:
 *     summary: Crea o actualiza el estado de un manga para un usuario
 *     description: Si el manga no existe en el registro del usuario, se crea con el estado indicado. Si ya existe, se actualiza al nuevo estado si es diferente.
 *     tags: [Manga]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               userId:
 *                 type: integer
 *                 example: 1
 *               mangaId:
 *                 type: integer
 *                 example: 101
 *               status:
 *                 type: string
 *                 enum: [PENDING, READING, COMPLETED, ABANDONED]
 *                 example: "READING"
 *     responses:
 *       200:
 *         description: Estado de manga actualizado o creado exitosamente
 *       400:
 *         description: Datos faltantes o inválidos
 *       500:
 *         description: Error interno del servidor
 */
router.post('/mvMangaByStatus', addOrUpdateUserMangaStatus);


/**
 * @swagger
 * /api/manga/deleteMangaStatus:
 *   delete:
 *     summary: Elimina un manga del seguimiento de un usuario
 *     description: Borra la entrada de User_Manga correspondiente al usuario y manga dados.
 *     tags: [Manga]
 *     parameters:
 *       - in: query
 *         name: userId
 *         required: true
 *         schema:
 *           type: integer
 *           example: 1
 *       - in: query
 *         name: mangaId
 *         required: true
 *         schema:
 *           type: integer
 *           example: 101
 *     responses:
 *       200:
 *         description: Manga eliminado del seguimiento del usuario
 *       400:
 *         description: Datos faltantes
 *       404:
 *         description: Relación no encontrada
 *       500:
 *         description: Error interno del servidor
 */
router.delete('/deleteMangaStatus', deleteUserManga);


/**
 * @swagger
 * /api/manga/getUserMangas:
 *   get:
 *     summary: Obtiene los mangas de un usuario clasificados por estado
 *     description: Devuelve listas con los IDs de mangas en los estados PENDING, READING, COMPLETED y ABANDONED para el usuario indicado.
 *     tags: [Manga]
 *     parameters:
 *       - in: query
 *         name: userId
 *         required: true
 *         schema:
 *           type: integer
 *           example: 1
 *     responses:
 *       200:
 *         description: Listas de mangas clasificadas por estado
 *       400:
 *         description: Faltan datos necesarios
 *       500:
 *         description: Error interno del servidor
 */
router.get('/getUserMangas', getUserMangasByStatus);

module.exports = router;
