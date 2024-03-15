import {asyncHandler} from  '../utils/asyncHandler';

const registerUser = asyncHandler(async (req, res) => {
    res.status(201).json({success: true, message:'User registered successfully'})
})
