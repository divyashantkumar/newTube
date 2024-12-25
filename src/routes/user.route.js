import { Router } from "express";
import {
    changeCurrentPassword,
    getCurrentUser,
    getUserChannelProfile,
    getWatchHistory,
    loginUser,
    logoutUser,
    refreshAccessToken,
    registerUser,
    updateAccountDetails,
    updateUserAvatar,
    updateUserCoverImage
} from "../controllers/user.controller.js";
import { uploads } from '../middleware/multer.middleware.js'
import { verifyJwt } from "../middleware/auth.middleware.js";

const router = Router();

// PUBLIC ROUTES
router.route('/register').post(
    uploads.fields(
        [
            { name: 'avatar', maxCount: 1 },
            { name: 'coverImage', maxCount: 1 }
        ]
    ), registerUser
);

router.route('/login').post(loginUser);

router.route('/refresh-token').post(refreshAccessToken);

// SECURED ROUTES
router.route('/logout').post(verifyJwt, logoutUser);

router.route('/change-password').post(verifyJwt, changeCurrentPassword);

router.route('/current-user').get(verifyJwt, getCurrentUser);

router.route('/c/:username').get(verifyJwt, getUserChannelProfile);

router.route('/update-acccount').put(verifyJwt, updateAccountDetails);

router.route('/update-avatar').put(verifyJwt, uploads.single('avatar'), updateUserAvatar);

router.route('/update-cover-image').put(verifyJwt, uploads.single('coverImage'), updateUserCoverImage);

router.route('/watch-history').get(verifyJwt, getWatchHistory);

export default router;