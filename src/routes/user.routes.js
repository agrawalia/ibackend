import { Router } from "express"
import { registerUser, loginUser, logoutUser, refreshAccessToken } from "../controllers/user.controller.js";
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

router.route("/login").post(logoutUser)

//secured routes
router.route("/logout").post(verifyUser, logoutUser);
router.route("/refresh-token").post(refreshAccessToken);
       
    
export default router
