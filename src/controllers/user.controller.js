import {asyncHandler} from  '../utils/asyncHandler.js';
import {ApiError} from  '../utils/ApiError.js'
import {uploadOnCloudinary} from "../utils/cloudinary.js"
import {User} from "../models/user.model.js";
import { ApiResponse } from '../utils/ApiResponse.js';
import { checkUserExist, createUser, findUserById } from '../services/user.service.js';

const registerUser = asyncHandler (async (req, res) => {

    const {fullName, email, username, password} = req.body;

    //Validation for null
    if([fullName, email, username, password].some(el => el?.trim() == "" )) {
        throw new ApiError(400, "Please  provide full name, email, username and password");
    }

    //Check if User already exist
    const userAlreadyExist = await checkUserExist(req.body);
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

export {registerUser}
