const fs = require("fs")
const config = require("config")
const File = require("../models/File")

class FileService {
    createDir(file) {
        const filePath = `${config.get('filesPath')}/${file.user}/${file.path}`
        return new Promise((res, rej) => {
            try {
                if (!fs.existsSync(filePath)) {
                    fs.mkdirSync(filePath)
                    return res({message: 'File created'})
                } else {
                    return rej({message: 'File already exist'})
                }
            } catch (e) {
                return rej({message: 'File error'})
            }
        })
    }
    deleteFile(file) {
        const path = this.getPath(file)
        if (file.type === 'dir') {
            fs.rmdirSync(config.get('filesPath') + '/' + file.user + '/' + file.path)
        } else {
            fs.unlinkSync(path)
        }
    }

    getPath(file) {
        const filePath = file.path ? file.path + '/' + file.name : file.name
        return config.get('filesPath') + '/' + file.user + '/' + filePath
    }
}

module.exports = new FileService()
