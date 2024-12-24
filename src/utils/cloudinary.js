import { v2 as cloudinary } from "cloudinary";
import fs from 'fs';

// CONFIGURATION
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

const uploadToCloudinary = async (filepath) => {
    try {
        if(!filepath) return null;

        const response = await cloudinary.uploader.upload(filepath, {
            resource_type: 'auto',
        });

        console.log("File uploaded to cloudinary : File src - ", response.url);

        // Delete file from server
        fs.unlinkSync(filepath);

        return response;
    } catch (error) {
        // Delete file from server
        fs.unlinkSync(filepath);
        return null;
    }
}

export { uploadToCloudinary }