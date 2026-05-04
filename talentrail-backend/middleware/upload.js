const multer = require('multer');
const fs = require('fs');

const profileUpload = multer({
    fileFilter: (req, file, callback) => {
        if (
            file.mimetype === 'image/jpg' ||
            file.mimetype === 'image/png' ||
            file.mimetype === 'image/jpeg'
        ) {
            callback(null, true);
        } else {
            callback(null, false);
        }
    },
    limits: {
        fileSize: 1024 * 1024 * 2
    }
});

const storage = multer.diskStorage({
    destination: function (req, file, callback) {
        if (!fs.existsSync('/tmp/')) {
            fs.mkdirSync('/tmp/');
        }
        callback(null, '/tmp/');
    },
    filename: (req, file, callback) => {
        callback(null, Date.now() + "-" + file.originalname);
    }
});

const resumeUpload = multer({
    storage: storage,
    fileFilter: (req, file, callback) => {
        if (file.mimetype === 'application/pdf') {
            callback(null, true);
        } else {
            callback(null, false);
        }
    },
    limits: {
        fileSize: 1024 * 1024 * 2
    }
});

const jdUpload = multer({
    storage: storage,
    fileFilter: (req, file, callback) => {
        const allowedTypes = [
            "application/pdf",
            "application/msword",
            "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
            "text/plain"
        ];

        if (allowedTypes.includes(file.mimetype)) {
            callback(null, true);
        } else {
            callback(null, false);
        }
    },
    limits: {
        fileSize: 1024 * 1024 * 2
    }
});

module.exports = {
    profileUpload,
    resumeUpload,
    jdUpload
};