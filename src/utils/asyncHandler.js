// const asyncHandler = (fn) => (req, res, next) => {
//     Promise.resolve(fn(req, res, next)).catch((err) => next(err));
// };
  

const asyncHandler = (requestHandler) => {
     return async (req, res, next) => {
        try{
            await requestHandler(req, res, next);
        } catch(error) {
            // return next(error);
            res.status(error.statusCode || 500).json({
                code : error.statusCode || 500,
                success : false,
                message : error.message
            })
        }
    }
}

export { asyncHandler };
