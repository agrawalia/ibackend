import { Video } from "../models/video.model.js"
import mongoose from "mongoose"
import { ApiError } from "../utils/ApiError.js"

const getAllVideos = async(userId, sortBy, options) => {
    return await Video.find({owner : new mongoose.Schema.ObjectId(userId)})
    .sort({[sortBy] : options.sortOrder})
    .skip(options.page)
    .limit(options.limit)    
}

const publishAVideo = async(video) => {
    try {
        return await Video.create(video);
    } catch (error) {
        throw new ApiError(error.code || 500, error.message || "video service => publishAVideo");
    }
}

const getVideoById = async(videoId) => {
    return await Video.findById(videoId);
}

const updateVideo = async(videoId, body) => {
    try {
        return await Video.findByIdUpdate(
            videoId,
            { $set : body},
            {new : true}
        )
    } catch (error) {
        throw new ApiError(error.code || 500, error.message || "video service => updateVideo");
    }
}

const deleteVideo = async(videoId) => {
    return await Video.findByIdAndUpdate(
        videoId,
        { $set : {deletedAt : new Date()} }
    )
}

const togglePublishStatus = async(videoId) => {
    return await Video.findByIdAndUpdate(
        videoId,
        { $set : { isPublished : false } }
    )
}

export {
    getAllVideos,
    publishAVideo,
    getVideoById,
    updateVideo,
    deleteVideo,
    togglePublishStatus,
}
