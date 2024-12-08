const multer = require('multer');
const path = require('path');

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const uploadDir = path.join(__dirname , './public')
        cb(null, uploadDir)
    },
    filename: (req,file,cb) => {
        cb(null , file.originalname + '-' + Date.now())
    } 
})

const upload = multer({
    storage
})

module.exports = upload;