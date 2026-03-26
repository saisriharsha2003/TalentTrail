const multer = require('multer');

const profileUpload = multer({
    fileFilter: (req, file, callback) => {
        if (file.mimetype === 'image/jpg' ||
            file.mimetype === 'image/png' ||
            file.mimetype === 'image/jpeg') {
            callback(null, true);
        }
        else {
            callback(null, false);
        }
    },
    limits: {
        fileSize: 1024 * 1024 * 2
    }
});

const storage = multer.diskStorage({
    destination: function (req, file, callback) {
        // Check if the directory exists, create it if not
        const fs = require('fs');
        if (!fs.existsSync('/tmp/')) {
            fs.mkdirSync('/tmp/');
        }
        callback(null, '/tmp/');
    },
    filename: (req, file, callback) => {
        callback(null, file.originalname);
    }
})
const resumeUpload = multer({
    storage: storage,
    fileFilter: (req, file, callback) => {
        if (file.mimetype === 'application/pdf') {
            callback(null, true);
        }
        else {
            callback(null, false);
        }
        console.log('uploaded')
    },
    limits: {
        fileSize: 1024 * 1024 * 2
    }
});

module.exports = {
    profileUpload,
    resumeUpload
}