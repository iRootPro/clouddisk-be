const fileService = require("./../services/file")
const config = require('config')
const fs = require("fs")
const User = require("./../models/User")
const File = require("./../models/File")

class FileController {
    async createDir(req, res) {
        try {
            const {name, type, parent} = req.body
            const file = new File({name, type, parent, user: req.user.id})
            const parentFile = await File.findOne({_id: parent})
            if (!parentFile) {
                file.path = name
                await fileService.createDir(file)
            } else {
                file.path = `${parentFile.path}/${file.name}`
                await fileService.createDir(file)
                parentFile.childs.push(file._id)
                await parentFile.save()
            }
            await file.save()
            res.json(file)
        } catch (e) {
            console.log(e)
            return res.status(400).json({message: e})
        }

    }

    async getFiles(req, res) {
        try {
            const {sort} = req.query
            let files
            switch (sort) {
                case 'name':
                    files = await File.find({user: req.user.id, parent: req.query.parent}).sort({name: 1})
                    break
                case 'date':
                    files = await File.find({user: req.user.id, parent: req.query.parent}).sort({date: 1})
                    break
                case 'type':
                    files = await File.find({user: req.user.id, parent: req.query.parent}).sort({type: 1})
                    break
                default:
                    files = await File.find({user: req.user.id, parent: req.query.parent})
                    break
            }

            return res.json(files)
        } catch (e) {
            console.log(e)
            return res.status(400).json({message: 'Can not get files'})
        }
    }

    async uploadFile(req, res) {
        try {
            const file = req.files.file

            const parent = await File.findOne({user: req.user.id, _id: req.body.parent})
            const user = await User.findOne({_id: req.user.id})

            if (user.usedSpace + file.size > user.diskSpace) {
                return res.status(400).json({message: 'Your disk is full'})
            }

            user.usedSpace += file.size
            let path

            if (parent) {
                path = `${config.get("filesPath")}/${user.id}/${parent.path}/${file.name}`
            } else {
                path = `${config.get("filesPath")}/${user.id}/${file.name}`
            }

            if (fs.existsSync(path)) {
                return res.status(400).json('File this name already exist')
            }
            file.mv(path)
            const type = file.name.split('.').pop()
            const dbFile = new File({
                name: file.name,
                size: file.size,
                type,
                parent: parent ? parent._id : null,
                path: parent ? parent.path : null,
                user: user._id
            })
            await dbFile.save()
            await user.save()
            return res.status(200).json(dbFile)
        } catch (e) {
            console.log(e)
            return res.status(400).json({message: 'Upload error'})
        }
    }

    async downloadFile(req, res) {
        try {
            const file = await File.findOne({_id: req.query.id, user: req.user.id})
            const filePath = file.path ? file.path + '/' + file.name : file.name
            const path = config.get('filesPath') + '/' + req.user.id + '/' + filePath
            if (fs.existsSync(path)) {
                return res.download(path, file.name)
            } else {
                return res.status(404).json({message: 'File not found'})
            }
        } catch (e) {
            console.log(e)
            res.status(500).json({message: 'Download error'})
        }
    }

    async deleteFile(req, res) {
        try {
            const file = await File.findOne({_id: req.query.id, user: req.user.id})
            if (!file) {
                return res.status(400).json({message: 'File not found'})
            }
            fileService.deleteFile(file)
            await file.remove()
            return res.status(200).json({message: 'File was deleted'})
        } catch (e) {
            console.log(e)
            res.status(500).json({message: 'Dir is not empty'})
        }
    }
    async searchFile(req, res) {
        try {
            let files = File.find({user: req.user.id})
            files = files.filter(file => file.name.includes(req.query.search))
            return res.status(200).json(files)
        }
        catch (e) {
            console.log(e)
            return res.status(400).json({message: 'Search error'})
        }
    }
}

module.exports = new FileController()
