const cloudinary = require("../../../config/cloudinary");
const streamifier = require("streamifier");

function uploadBufferToCloudinary(buffer, folder = "restaurant-images") {
    return new Promise((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
            { folder },
            (error, result) => {
                if (error) {
                    reject(error);
                    return;
                }
                resolve(result);
            }
        );

        streamifier.createReadStream(buffer).pipe(uploadStream);
    });
}

async function uploadRestaurantImages(files) {
    if (!Array.isArray(files) || files.length === 0) {
        return [];
    }

    return Promise.all(
        files.map((file) => uploadBufferToCloudinary(file.buffer))
    );
}

module.exports = {
    uploadRestaurantImages,
};