import mongoose, {isValidObjectId} from "mongoose"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"
import {uploadOnCloudinary} from "../utils/cloudinary.js"
import { paginateQuery, pick } from "../utils/utils.js"
import videoService from "../services/video.service.js"


const getAllVideos = asyncHandler(async (req, res) => {
    const { page = 1, limit = 10, query, sortBy, sortOrder, userId } = req.query
    const paginateOptions = paginateQuery(req.query);
    const videos = await videoService.getAllVideos(userId,sortBy, paginateOptions);

    return res
    .status(200)
    .json(new ApiResponse(
        200,
        videos,
        "All videos fetched successfully"
    ))
})

const publishAVideo = asyncHandler(async (req, res) => {
    const { title, description} = req.body
    if(!req.files?.videoFile) throw new ApiError(400, "No video file attached!");
    if(!req.files?.thumbnail) throw new ApiError(400, "No thumbnail attached!");

    const videoFileLocalPath = req.files?.videoFile[0]?.path || '';
    const thumbnailLocalPath = req.files?.thumbnail[0]?.path || '';

    const videoFile = await uploadOnCloudinary(videoFileLocalPath);
    if(!videoFile) throw new ApiError(500, 'videoFile is not uploaded');

    const thumbnail = await uploadOnCloudinary(thumbnailLocalPath);
    if(!thumbnail) throw new ApiError(500, 'thumbnail is not uploaded');

    const video = {
        ...req.body,
        ...(videoFile?.url && {videoFile : videoFile?.url}),
        ...(thumbnail?.url && {thumbnail : thumbnail?.url}),
        owner : new mongoose.Schema.ObjectId(req.user),
        isPublished : true,
        ...(videoFile?.duration && {duration : videoFile?.duration})
    }

    const createdVideo = await videoService.publishAVideo(video);

    return res
    .status(200)
    .json(new ApiResponse(
        200,
        createdVideo,
        "Video is published successfully"
    ))
})

const getVideoById = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    const video = await videoService.getVideoById(videoId);

    return res
    .status(200)
    .json(new ApiResponse(
        200,
        video,
        "Video is fetched"
    ))
})

const updateVideo = asyncHandler(async (req, res) => {
    const { videoId } = req.params

    const video = await videoService.updateVideo(videoId, req.body);
    return res
    .status(200)
    .json(new ApiResponse(
        200,
        video,
        "Video Updated successfully !"
    ))
})

const deleteVideo = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    await videoService.deleteVideo(videoId);

    return res
    .status(200)
    .json(new ApiResponse(
        200,
        {},
        "Video deleted succesfully !"
    ))
})

const togglePublishStatus = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    await videoService.togglePublishStatus(videoId);

    return res
    .status(200)
    .json( new ApiResponse(
        200,
        {},
        "SUCCESS"
    ))
})

export {
    getAllVideos,
    publishAVideo,
    getVideoById,
    updateVideo,
    deleteVideo,
    togglePublishStatus
}
