import {User} from "../models/user.model.js";
import { ApiError } from "../utils/ApiError.js";

const createUser = async({fullName, email, password, username}, avatar, coverImage) => {
    try{
        // if(!avatar?.url)
        //     throw new ApiError(400,"Please provide a profile picture URL");
        // const avatarUrl = avatar.url;
        //const coverImageUrl = coverImage?.url ? coverImage.url : '';

        const newUser = await User.create({
            fullName,
            email,
            password,
            username : username.toLowerCase(),
            //avatar : avatarUrl,
            ...(avatar?.url && ({avatar : avatar?.url})),
            ...(coverImage?.url && ({coverImage : coverImage?.url}))
            //coverImage : coverImageUrl
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

const findUserByEmailOrUsername = async(username, email) =>{
    let user;
    if(username) {
        user = await User.findOne( {username: username.toLowerCase()} ).exec();
    }
    else if(email) {
        user = await User.findOne( {email} ).exec();
    }
    return user;
}

const generateAccessAndRefreshToken = async(user) => {
    try{
        const accessToken = await user.generateAccessToken();
        const refreshToken = await user.generateRefreshToken();
        user.refreshToken = refreshToken;
        await user.save({validateBeforeSave : false});

        return {accessToken, refreshToken};

    } catch (error) {
        throw new ApiError(500, "Something went wrong while generating refresh and access token");
    }
}

const logoutUser = async(userId) => {
    return await User.findByIdAndUpdate(
        userId,
        {
            $set: {
                refreshToken : undefined
            }
        },
        {
            new : true
        }
    )
}

const updateAccountDetails = async(userId, {fullName, email}) => {
    return await User.findByIdAndUpdate(
        userId,
        {
            $set : {fullName, email}
        },
        {
            new : true
        }
    ).select("-password")
}

const updateUserAvatar = async(userId, avatarUrl) => {
    return await User.findByIdAndUpdate(
        userId,
        {
            $set : {avatar : avatarUrl}
        },
        {
            new : true
        }
    ).select("-password")
}


const updateUserCover = async(userId, coverImageUrl) => {
    return await User.findByIdAndUpdate(
        userId,
        {
            $set : {coverImage : coverImageUrl}
        },
        {
            new : true
        }
    ).select("-password")
}

export default {
    createUser,
    findUserById,
    findUserByEmailOrUsername,
    generateAccessAndRefreshToken,
    logoutUser,
    updateAccountDetails,
    updateUserAvatar,
    updateUserCover,
}
