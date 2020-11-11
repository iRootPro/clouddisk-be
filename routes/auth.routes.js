const Router = require("express")
const bcrypt = require("bcryptjs")
const {check, validationResult} = require("express-validator")
const User = require("./../models/User")
const router = Router()


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

            const hashPassword = await bcrypt.hash(password, 15)
            const user = new User({email, password: hashPassword})
            await user.save()
            return res.status(200).json({message: 'User was created'})
        } catch (e) {
            console.error(e)
            return res.send({message: "Server error"})
        }
    })

module.exports = router
