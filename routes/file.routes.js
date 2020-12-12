const Router = require("express")
const authMiddleWare = require("./../middlewares/auth")
const fileController = require("./../controllers/file")
const router = new Router


router.post('', authMiddleWare, fileController.createDir)
router.post('/upload', authMiddleWare, fileController.uploadFile)
router.get('', authMiddleWare, fileController.getFiles)
router.get('/download', authMiddleWare, fileController.downloadFile)
router.delete('/', authMiddleWare, fileController.deleteFile)
router.get('/search', authMiddleWare, fileController.searchFile)
router.post('/avatar', authMiddleWare, fileController.uploadAvatar)
router.delete('/avatar', authMiddleWare, fileController.deleteAvatar)

module.exports = router
