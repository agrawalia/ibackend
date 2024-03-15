import { Router } from "express"
import { registerUser } from "../controllers/user.controller.js";

const router = Router();

router.route("/register").post(registerUser)
                        .get(function (req, res) {
                            console.log("get")
                            res.send("GET request to the /users route")});

export default router
