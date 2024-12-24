import multer from "multer";
import path from "path";

const storage = multer.diskStorage({
    destination: function (req, file, callback) {
        callback(null, path.join(process.cwd(), 'public', 'uploads'));
    },
    filename: function (req, file, callback) {
        const originalNameParts = file.originalname.split('.');
        const filename = Date.now() + "." + originalNameParts[originalNameParts.length - 1];
        file.originalname = filename;

        return callback(null, `${filename}`);
    }
});

export const uploads = multer({ storage });
