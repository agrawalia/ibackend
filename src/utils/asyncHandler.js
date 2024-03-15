const asyncHandler = (requestHandler) => {
    return async (req, res, next) => {
        try{
            return await requestHandler(req, res, next);
        } catch(error) {
            req.status(error.code || 500).json({
                success : false,
                message : error.message
            })
        }
    }
}

export {asyncHandler};
