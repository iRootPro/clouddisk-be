const Router = require("express")
const config = require("config")
const bcrypt = require("bcryptjs")
const jsonwebtoken = require("jsonwebtoken")
const {check, validationResult} = require("express-validator")
const User = require("./../models/User")
const authMiddleWare = require("./../middlewares/auth")
const router = Router()


const secretKey = config.get('secretKey')

router.post('/registration',
    [
        check('email', 'Incorrect email').isEmail(),
        check('password', 'Password must be longer than 3 and shorten than 12').isLength({min: 3, max: 12})
    ],
    async (req, res) => {
        try {
            const error = validationResult(req)

            if (!error.isEmpty()) {
                return res.status(400).json({message: 'Incorrect request', error})
            }

            const {email, password} = req.body
            const candidate = await User.findOne({email})
            if (candidate) {
                return res.status(400).json({message: `User with ${email} already exist`})
            }

            const hashPassword = await bcrypt.hash(password, 8)
            const user = new User({email, password: hashPassword})
            await user.save()
            return res.status(200).json({message: 'User was created'})
        } catch (e) {
            console.error(e)
            return res.send({message: "Server error"})
        }
    })

router.post('/login', async (req, res) => {
    try {
        const {email, password} = req.body
        const user = await User.findOne({email})
        if (!user) {
            return res.status(404).json({message: 'User not found'})
        }
        const isPassValid = bcrypt.compareSync(password, user.password)
        if (!isPassValid) {
            return res.status(400).json({message: 'Invalid password'})
        }
        const token = jsonwebtoken.sign({id: user.id}, secretKey, {expiresIn: '1h'})
        return res.json({
            token,
            user: {
                id: user.id,
                email: user.email,
                diskSpace: user.diskSpace,
                usedSpace: user.usedSpace,
                avatar: user.avatar
            }
        })
    } catch (e) {
        console.error(e)
        return res.send({message: "Server error"})
    }
})

router.get('/auth', authMiddleWare,async (req, res) => {
    try {
        const user = await User.findOne({_id: req.user.id})
        const token = jsonwebtoken.sign({id: user.id}, secretKey, {expiresIn: '1h'})
        return res.json({
            token,
            user: {
                id: user.id,
                email: user.email,
                diskSpace: user.diskSpace,
                usedSpace: user.usedSpace,
                avatar: user.avatar
            }
        })
    } catch (e) {
        console.error(e)
        return res.send({message: "Server error"})
    }
})

module.exports = router
