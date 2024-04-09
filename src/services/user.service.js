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

const getUserChannelProfile = async(username) => {
    return await User.aggregate([
        {
            $match: {
                username: username?.toLowerCase()
            }
        },
        {
            $lookup: {
                from: "subscriptions",
                localField: "_id",
                foreignField: "channel",
                as: "subscribers"
            }
        },
        {
            $lookup: {
                from: "subscriptions",
                localField: "_id",
                foreignField: "subscriber",
                as: "subscribedTo"
            }
        },
        {
            $addFields: {
                subscribersCount: {
                    $size: "$subscribers"
                },
                channelsSubscribedToCount: {
                    $size: "$subscribedTo"
                },
                isSubscribed: {
                    $cond: {
                        if: {$in: [req.user?._id, "$subscribers.subscriber"]},
                        then: true,
                        else: false
                    }
                }
            }
        },
        {
            $project: {
                fullName: 1,
                username: 1,
                subscribersCount: 1,
                channelsSubscribedToCount: 1,
                isSubscribed: 1,
                avatar: 1,
                coverImage: 1,
                email: 1

            }
        }
    ])
}

const getWatchHistory = async(userId) => {
    return await User.aggregate([
        {
            $match: {
                _id: new mongoose.Types.ObjectId(userId)
            }
        },
        {
            $lookup: {
                from: "videos",
                localField: "watchHistory",
                foreignField: "_id",
                as: "watchHistory",
                pipeline: [
                    {
                        $lookup: {
                            from: "users",
                            localField: "owner",
                            foreignField: "_id",
                            as: "owner",
                            pipeline: [
                                {
                                    $project: {
                                        fullName: 1,
                                        username: 1,
                                        avatar: 1
                                    }
                                }
                            ]
                        }
                    },
                    {
                        $addFields:{
                            owner:{
                                $first: "$owner"
                            }
                        }
                    }
                ]
            }
        }
    ])
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
    getUserChannelProfile,
    getWatchHistory,
}
