import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import jwt from "jsonwebtoken";
import userService from "../services/user.service.js";

const verifyUser = asyncHandler( async(req, _, next) => {

    try {
        const token = req.cookies?.accessToken || req.header("Authorization")?.replace("Bearer ", "");
        if(!token)
            throw new ApiError(401, "Unauthorized request");
    
        const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
    
        const user = await userService.findUserById(decodedToken._id);
    
        if(!user)
            throw new ApiError(401, "Invalid Access Token");
    
        req.user = user;
        next();
    
    } catch (error) {
        throw new ApiError(401, error?.message || "Invalid Access Token");
    }
    
})

export {verifyUser};