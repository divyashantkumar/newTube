import { Router } from "express";
import { loginUser, logoutUser, registerUser } from "../controllers/user.controller.js";
import { uploads } from '../middleware/multer.middleware.js'
import { verifyJwt } from "../middleware/auth.middleware.js";

const router = Router();



router.route('/register').post(
    uploads.fields(
        [
            { name: 'avatar', maxCount: 1 },    
            { name: 'coverImage', maxCount: 1 }
        ]
    ), registerUser
);

router.route('/login').post(loginUser);


// SECURED ROUTES
router.route('/logout').post(verifyJwt, logoutUser);

export default router;