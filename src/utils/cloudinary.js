import { v2 as cloudinary } from 'cloudinary';
import fs from 'fs';

import { config } from 'dotenv';
config();

// CONFIGURATION
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

const uploadToCloudinary = async (filepath) => {
    try {
        if (!filepath) return null;

        const response = await cloudinary.uploader.upload(filepath, {
            resource_type: 'auto',
        });

        console.log("File uploaded to cloudinary : File src - ", response);

        // Delete file from server
        fs.unlinkSync(filepath);

        return response;
    } catch (error) {
        // Delete file from server
        fs.unlinkSync(filepath);
        return null;
    }
}

const deleteFromCloudinary = async (public_id) => {
    try {
        const result = await cloudinary.uploader.destroy(public_id);

        console.log("File deleted from cloudinary, public_id : ", public_id);
    } catch (error) {
        console.error("Failed to delete file from cloudinary : ", error);
        return null;
    }
}

export { uploadToCloudinary, deleteFromCloudinary }