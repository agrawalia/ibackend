import { Router } from "express"
import { registerUser, loginUser, logoutUser, refreshAccessToken, changeCurrentPassword, getCurrentUser, updateAccountDetails, updateUserAvatar, updateUserCover } from "../controllers/user.controller.js";
import { upload } from "../middlewares/multer.middleware.js";
import { verifyUser } from "../middlewares/auth.middleware.js";

const router = Router();

router.route("/register").post(
    upload.fields([
        {
            name : 'avatar',
            maxCount: 1
        },
        {
            name : 'coverImage',
            maxCount : 1
        }
    ]),
    registerUser
    )

router.route("/login").post(loginUser)

//secured routes
router.route("/").get(verifyUser, getCurrentUser);

router.route("/logout").post(verifyUser, logoutUser);
router.route("/refresh-token").post(refreshAccessToken);
router.route("/update-password").patch(verifyUser, changeCurrentPassword);
router.route("/account-details").patch(verifyUser, updateAccountDetails);
router.route("/avatar-details").patch(verifyUser, upload.single('avatar'), updateUserAvatar);
router.route("/cover-image-details").patch(verifyUser, upload.single('cover'), updateUserCover);

    
export default router
