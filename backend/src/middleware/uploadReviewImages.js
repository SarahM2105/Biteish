const multer = require("multer");

const storage = multer.memoryStorage();

const uploadReviewImages = multer({
    storage,
    limits: {
        fileSize: 5 * 1024 * 1024,
        files: 3,
    },
    fileFilter: (req, file, cb) => {
        if (file.mimetype && file.mimetype.startsWith("image/")) {
            cb(null, true);
            return;
        }

        cb(new Error("Only image files are allowed"));
    },
});

module.exports = uploadReviewImages;