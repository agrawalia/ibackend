import {User} from "../models/user.model.js";
import { ApiError } from "../utils/ApiError.js";

const checkUserExist = async({email, username}) =>{
    let user = await User.findOne({$or:[{username}, {email}]}).lean();  
    return !!user;  // returns true if the user is found otherwise false
};

const createUser = async({fullName, email, password, username}, avatar, coverImage) => {
    try{
        if(!avatar?.url)
            throw new ApiError(400,"Please provide a profile picture URL");
        const avatarUrl = avatar.url;
        const coverImageUrl = coverImage?.url ? coverImage.url : '';

        const newUser = await User.create({
            fullName,
            email,
            password,
            username : username.toLowerCase(),
            avatar : avatarUrl,
            coverImage : coverImageUrl
        })

        return newUser;
    } catch (error) {
        console.log("Something went wrong while creating a user", error);
        throw new ApiError(error.statusCode || 500, error.message || "Something went wrong while creating a user");
    }
}

const findUserById = async(userId) => {
    return await User.findById(userId)
                    .select("-passsword -refreshToken")
                    .lean()
}

export {
    checkUserExist,
    createUser,
    findUserById,
}
