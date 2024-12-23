import { asyncHandler } from '../utils/asyncHandler.js'
import { ApiResponse } from '../utils/ApiResponse.js';
import { ApiError } from '../utils/ApiError.js';


const healthcheck = asyncHandler(async (req, res, next) => {
    return res
        .status(200)
        .json(new ApiResponse(200, "Healthy", "Server is Well and Running !"));
});

export { healthcheck };
