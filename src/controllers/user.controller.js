import { asyncHandler } from  '../utils/asyncHandler.js';
import {ApiError} from  '../utils/ApiError.js'
import {uploadOnCloudinary} from "../utils/cloudinary.js"
import { ApiResponse } from '../utils/ApiResponse.js';
import { createUser, findUserById, findUserByEmailOrUsername, generateAccessAndRefreshToken, logoutUser } from '../services/user.service.js';

const registerUser =  asyncHandler(async (req, res) => {
    const {fullName, email, username, password} = req.body;

    //Validation for null
    if([fullName, email, username, password].some(el => el?.trim() == "" )) {
        throw new ApiError(400, "Please  provide full name, email, username and password");
    }

    //Check if User already exist
    const userAlreadyExist = await findUserByEmailOrUsername(username, email);
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

    if(!avatarLocalPath)
        throw new ApiError(422,'Avatar image is required')

    //upload images to cloudinary
    const avatar = await uploadOnCloudinary(avatarLocalPath);
    const coverImage = await uploadOnCloudinary(coverImageLocalPath);    

    if(!avatar)
        throw new ApiError(500, 'Avatar image is not uploaded');

    const user = await createUser(req.body, avatar, coverImage);
    const createdUser = await findUserById(user._id);

    if(!createdUser)
        throw new ApiError(500, "User creation failed");

    return res.status(201).json(
        new ApiResponse(200, createdUser, "User registered Successfully !!")
    ) 
})

const loginUser = asyncHandler(async (req, res) => {
    const {email, username, password} = req.body;

    if(!(email || username))
        throw new ApiError(400, "Username or email is required");

    //find user by email or username

    const user = await findUserByEmailOrUsername(email, username);
    if(!user)
        throw new ApiError(404,"Use  does not exist");

    const isPasswordValid = await user.isPasswordCorrect(password);

    if(!isPasswordValid)
        throw new ApiError(401, "Invalid user credentials");

    const {accessToken, refreshToken} = await generateAccessAndRefreshToken(user);

    const options = {
        httpOnly : true,
        secure : true
    }

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
    await logoutUser(req.user._id);

    const options = {
        httpOnly : true,
        secure : true
    }

    return res
    .status(200)
    .clearCookie("accessToken", options)
    .clearCookie("refreshToken", options)
    .json(new ApiResponse(200, {},  "User logged Out "))
})


export {
    registerUser, 
    loginUser,
    logoutUser,
}
