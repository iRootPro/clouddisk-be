const Router = require("express")
const authMiddleWare = require("./../middlewares/auth")
const fileController = require("./../controllers/file")
const router = new Router


router.post('', authMiddleWare, fileController.createDir)
router.get('', authMiddleWare, fileController.getFiles)

module.exports = router
