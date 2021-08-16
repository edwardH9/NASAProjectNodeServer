const express=require('express')
const router = express.Router()
const userController = require('../controllers/userController')

router.get('/', userController.view)
router.post('/',userController.login)
router.get('/missionInformation',userController.api)
router.post("/missionInformation",userController.search)
module.exports=router