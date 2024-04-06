import { asyncHandler } from  '../utils/asyncHandler.js';
import { ApiError } from  '../utils/ApiError.js'
import {uploadOnCloudinary, deleteFromCloudinary} from "../utils/cloudinary.js"
import { ApiResponse } from '../utils/ApiResponse.js';
import { extractImageNameFromUrl } from "../utils/utils.js";
import userService from '../services/user.service.js';
import jwt from "jsonwebtoken";
const options = {
    httpOnly : true,
    secure : true
}

const registerUser =  asyncHandler(async (req, res) => {
    const {fullName, email, username, password} = req.body;

    //Validation for null
    if([fullName, email, username, password].some(el => el?.trim() == "" )) {
        throw new ApiError(400, "Please  provide full name, email, username and password");
    }

    //Check if User already exist
    const userAlreadyExist = await userService.findUserByEmailOrUsername(username, email);
    if(userAlreadyExist){
        throw new ApiError(409,"User with this username or email already exists")
    }

    //get file path where image is stored in local path by multer

    const avatarLocalPath = req.files?.avatar[0]?.path || '';
    // const coverImageLocalPath = req.files?.coverImage[0]?.path || '';

    let coverImageLocalPath;
    if(req.files && Array.isArray(req.files.coverImage) && req.files.coverImage.length > 0){
        coverImageLocalPath = req.files.coverImage[0].path;
    }

    if(!avatarLocalPath) throw new ApiError(422,'Avatar image is required')

    //upload images to cloudinary
    const avatar = await uploadOnCloudinary(avatarLocalPath);
    const coverImage = await uploadOnCloudinary(coverImageLocalPath);    

    if(!avatar) throw new ApiError(500, 'Avatar image is not uploaded');

    const user = await userService.createUser(req.body, avatar, coverImage);
    const createdUser = await userService.findUserById(user._id);

    if(!createdUser) throw new ApiError(500, "User creation failed");

    return res.status(201).json(
        new ApiResponse(200, createdUser, "User registered Successfully !!")
    ) 
})

const loginUser = asyncHandler(async (req, res) => {
    const {email, username, password} = req.body;

    if(!(email || username))
        throw new ApiError(400, "Username or email is required");

    //find user by email or username
    const user = await userService.findUserByEmailOrUsername(username, email);
    if(!user) throw new ApiError(404, "User does not exist");

    const isPasswordValid = await user.isPasswordCorrect(password);
    if(!isPasswordValid)
        throw new ApiError(401, "Invalid user credentials");

    const {accessToken, refreshToken} = await userService.generateAccessAndRefreshToken(user);

    return res
    .status(200)
    .cookie("accessToken",accessToken, options)
    .cookie("refreshToken", refreshToken, options)
    .json(
        new ApiResponse(
            200,
            {
                user : user, accessToken, refreshToken
            },
            "User loggedIn Successfully"
        )
    )
})

const logoutUser = asyncHandler( async(req, res) => {
    await userService.logoutUser(req.user._id);

    return res
    .status(200)
    .clearCookie("accessToken", options)
    .clearCookie("refreshToken", options)
    .json(new ApiResponse(200, {},  "User logged Out "))
})

const refreshAccessToken = asyncHandler( async(req, res) => {
    const incomingRefreshToken = req.body.refreshToken || req.cookies.refreshToken;
    if(!incomingRefreshToken) throw new ApiError(401, "Unaothorized Request");

    const decodedToken = jwt.verify(
        incomingRefreshToken,
        process.env.REFRESH_TOKEN_SECRET
    )

    const user = await userService.findUserById(decodedToken?._id);
    if(!user) throw new ApiError(401, "Invalid Refresh Token");
    if(incomingRefreshToken !== user?.refreshToken) throw new ApiError(401, "Refresh token is expired or used");

    const {accessToken, newRefreshToken} = await userService.generateAccessAndRefreshToken(user._id);

    return res
    .status(200)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", newRefreshToken, options)
    .json((
        new ApiResponse(
            200,
            {accessToken, newRefreshToken},
            "Access Token Refreshed"
        )
    ))

})

const changeCurrentPassword = asyncHandler(async(req, res) => {
    const {oldPassword, newPassword} = req.body;
    const userId = req.user?._id;
    const user = await userService.findUserById(userId);
    const isPasswordCorrect = await user.isPasswordCorrect(oldPassword);

    if(!isPasswordCorrect) throw new ApiError(401, "Invalid old password");

    user.password = newPassword;
    await user.save({validateBeforeSave: false});

    return res
    .status(200)
    .json(new ApiResponse(200,{}, "Password changed successfully"))
    
})

const getCurrentUser = asyncHandler(async (req, res) => {
    return res
    .status(200)
    .json(new ApiResponse(200, req.user, "Current User fetched successfully"))
})

const updateAccountDetails = asyncHandler(async (req, res) => {
    const {fullName, email} = req.body;

    if(!fullName || !email) throw new ApiError(400, "All fields are required");

    const user = await userService.updateAccountDetails(req.user?._id, req.body);

    return res
    .status(200)
    .json(new ApiResponse(
        200,
        user,
        "User details updated successfully"
    ))
})

const updateUserAvatar = asyncHandler(async (req, res) => {
    const avatarLocalPath = req.file?.path;
    if(!avatarLocalPath) throw new ApiError(400, "Avatar file is missing");

    const avatar = await uploadOnCloudinary(avatarLocalPath);
    if(!avatar?.url) throw new ApiError(400, "Something went wrong while uploading avatar");

    const user = await userService.updateUserAvatar(req.user?._id, avatar?.url);

    //delete old image from cloudinary
    const userObject = await userService.findUserById(req.user?._id);
    const oldAvatarUrl = userObject?.avatar;

    const oldAvatarName = await extractImageNameFromUrl(oldAvatarUrl);

    await deleteFromCloudinary(oldAvatarName);

    return res
    .status(200)
    .json(new ApiResponse(
        200,
        user,
        "User avatar update successfully"
    ))

})

const updateUserCover = asyncHandler(async (req, res) => {
    const coverImageLocalPath = req.file?.path;
    if(!coverImageLocalPath) throw new ApiError(400, "Cover image file is missing");

    const cover = await uploadOnCloudinary(coverImageLocalPath);
    if(!cover?.url) throw new ApiError(400, "Something went wrong while uploading cover image");

    const user = await userService.updateUserCover(req.user?._id, cover?.url);

    //delete old image from cloudinary
    const userObject = await userService.findUserById(req.user?._id);
    const oldCoverUrl = userObject?.coverImage;

    if(oldCoverUrl) { 
        const oldCoverName = await extractImageNameFromUrl(oldCoverUrl);
        await deleteFromCloudinary(oldCoverName);
    }

    return res
    .status(200)
    .json(new ApiResponse(
        200,
        user,
        "User cover image update successfully"
    ))
})

export {
    registerUser, 
    loginUser,
    logoutUser,
    refreshAccessToken,
    getCurrentUser,
    updateAccountDetails,
    updateUserAvatar,
    updateUserCover,
    changeCurrentPassword,
}
