const multer = require("multer");

const storage = multer.memoryStorage();

const uploadRestaurantImages = multer({
    storage,
    limits: {
        fileSize: 5 * 1024 * 1024,
        files: 8,
    },
    fileFilter: (req, file, cb) => {
        if (file.mimetype && file.mimetype.startsWith("image/")) {
            cb(null, true);
            return;
        }

        cb(new Error("Only image files are allowed"));
    },
});

module.exports = uploadRestaurantImages;