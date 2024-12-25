import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { ApiError } from "../utils/ApiError.js";
import User from '../models/user.model.js';
import { deleteFromCloudinary, uploadToCloudinary } from "../utils/cloudinary.js";



export const generateAccessTokenAndRefreshToken = async (userId) => {
    try {
        const user = await User.findById(userId);

        // Chekk if user exist
        if (!user) {
            throw new ApiError(404, "User not found");
        }

        const accessToken = user.generateAccessToken();
        const refreshToken = user.generateRefreshToken();

        user.refreshToken = refreshToken;

        await user.save({ validateBeforeSave: false });

        return { accessToken, refreshToken };
    } catch (error) {
        console.log("Failed to generate access token and refresh token : ", error);
        throw new ApiError(500, "Failed to generate access token and refresh token");
    }
}

export const registerUser = asyncHandler(async (req, res, next) => {
    const { fullname, email, username, password } = req.body;

    // Validation --> use zod or some other npm package to validate the input
    if (
        [fullname, email, username, password].some(field => field?.trim() === "")
    ) {
        throw new ApiError(400, "All fields are required");
    }


    // find out user, if user does not exist then only create new user.
    const isUserExist = await User.find(
        {
            $or: [{ username }, { email }]
        }
    )

    if (isUserExist?.length > 0) {
        throw new ApiError(409, "User with username or email already exist", []);
    }


    const avatarFilePath = req.files?.avatar?.[0]?.path;
    const coverImageFilePath = req.files?.coverImage?.[0]?.path;

    if (!avatarFilePath) {
        throw new ApiError(400, "Avatar File Missing.")
    }

    let avatar = null;
    try {
        avatar = await uploadToCloudinary(avatarFilePath);
    } catch (error) {
        console.log("Failed to upload avatar to Cloudinary : ", error);
        throw new ApiError(500, "Failed to upload avatar to Cloudinary");
    }

    let coverImage = null;
    try {
        coverImage = await uploadToCloudinary(coverImageFilePath);
    } catch (error) {
        console.log("Failed to upload avatar to Cloudinary : ", error);
        throw new ApiError(500, "Failed to upload avatar to Cloudinary");
    }


    try {
        // Create new User
        const user = await User.create({
            fullname,
            avatar: avatar?.url,
            coverImage: coverImage?.url || "",
            email,
            password,
            username: username.toLowerCase()
        });


        const createdUser = await User.find({ _id: user._id }).select( // select is used to remove mentioned fields in the response
            "-password -refreshToken"
        );

        if (!createdUser) {
            throw new ApiError(500, "Something went wrong while registering user");
        }

        return res.status(200).send(new ApiResponse(200, createdUser, "User Registration Successful"))
    } catch (error) {
        console.log("Failed to register user");

        if (avatar) {
            await deleteFromCloudinary(avatar.public_id);
        }
        if (coverImage) {
            await deleteFromCloudinary(coverImage.public_id);
        }
        throw new ApiError(500, "Something went wrong while registering user and images deleted form cloudinary");
    }
});

export const loginUser = asyncHandler(async (req, res, next) => {
    // Destructure email and password from req.body
    const { email, password, username } = req?.body;

    // Validation --> use zod or some other npm package to validate the input
    if (
        [email, password].some(field => field?.trim() === "")
    ) {
        throw new ApiError(400, "All fields are required");
    }

    const user = await User.find({
        $or: [{ username }, { email }]
    })

    if (!user) {
        throw new ApiError(404, "User not found");
    }

    // Validate Password
    const isValidPassword = await user[0].comparePassword(password);

    if (!isValidPassword) {
        throw new ApiError(401, "Invalid Password");
    }

    // Generate access token and refresh token
    const { accessToken, refreshToken } = await generateAccessTokenAndRefreshToken(user[0]._id);

    const loggedInUser = User.find(user._id).select("-password -refreshToken");

    const options = {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",  // only send cookie over https
        sameSite: "none",
        maxAge: 1000 * 60 * 60 * 24,
    }

    return res
        .status(200)
        .cookie("accessToken", accessToken, options)
        .cookie("refreshToken", refreshToken, options)
        .json(new ApiResponse(200, loggedInUser[0], "Login Successful"));

});

export const refreshAccessToken = asyncHandler(async (req, res, next) => {
    const incomingRefreshToken = req.cookies?.refreshToken || req.body?.refreshToken;

    if (!incomingRefreshToken) {
        throw new ApiError(401, "Refresh token not found");
    }

    try {
        const decodedToken = jwt.verify(incomingRefreshToken, process.env.REFRESH_TOKEN_SECRET);

        const user = await User.findById(decodedToken?._id);

        if (!user) {
            throw new ApiError(401, "Invalid refresh token");
        }

        if (user?.refreshToken !== incomingRefreshToken) {
            throw new ApiError(401, "Invalid refresh token");
        }

        const options = {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",  // only send cookie over https
            sameSite: "none",
            maxAge: 1000 * 60 * 60 * 24,
        }

        const { accessToken, refreshToken: newRefreshToken } = await generateAccessTokenAndRefreshToken(user._id);

        return res
            .status(200)
            .cookie("accessToken", accessToken, options)
            .cookie("refreshToken", newRefreshToken, options)
            .json(new ApiResponse(
                200,
                {
                    accessToken,
                    refreshToken: newRefreshToken
                },
                "Access token refreshed successfully"
            ));
    } catch (error) {
        throw new ApiError(500, "Something went wrong while refreshing access token");
    }
});

export const logoutUser = asyncHandler(async (req, res, next) => {
    await User.findByIdAndUpdate(
        req.user._id,
        {
            $set: {
                refreshToken: undefined
            }
        },
        { new: true }
    );

    const options = {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",  // only send cookie over https
        sameSite: "none",
        maxAge: 0,
    }

    return res
        .status(200)
        .clearCookie("accessToken", options)
        .clearCookie("refreshToken", options)
        .json(new ApiResponse(200, {}, "Logout successful"));
});

export const changeCurrentPassword = asyncHandler(async (req, res, next) => {
    const { currentPassword, newPassword } = req.body;

    const user = await User.findById(req.user?._id);

    const isValidPassword = await user.comparePassword(currentPassword);

    if (!isValidPassword) {
        throw new ApiError(401, "Invalid Password");
    }

    user.password = newPassword;

    await user.save({ validateBeforeSave: false });

    return res.status(200).json(new ApiResponse(200, {}, "Password changed successfully"));
});

export const getCurrentUser = asyncHandler(async (req, res, next) => {
    return res.status(200).json(new ApiResponse(200, req.user, "Current User details"));
});

export const updateAccountDetails = asyncHandler(async (req, res, next) => {
    const { fullname, email } = req.body;

    if ([fullname, email].some(field => field?.trim() === "")) {
        throw new ApiError(400, "All fields are required");
    }

    const user = await User.findByIdAndUpdate(
        req.user?._id,
        {
            $set: {
                fullname,
                email
            }
        },
        { new: true }
    ).select("-password -refreshToken");

    return res
        .status(200)
        .json(new ApiResponse(
            200,
            user,
            "Account details updated successfully"
        ));
});

export const updateUserAvatar = asyncHandler(async (req, res, next) => {
    const avatarFilePath = req.file?.path;

    if (!avatarFilePath) {
        throw new ApiError(400, "Avatar is required");
    }

    const avatar = await uploadToCloudinary(avatarFilePath);

    if (!avatar.url) {
        throw new ApiError(500, "Failed to upload avatar to cloudinary");
    }

    const user = await User.findByIdAndUpdate(
        req.user?._id,
        {
            $set: {
                avatar: avatar.url
            }
        },
        { new: true }
    ).select("-password -refreshToken");

    return res
        .status(200)
        .json(new ApiResponse(
            200,
            user,
            "Avatar updated successfully"
        ))
});

export const updateUserCoverImage = asyncHandler(async (req, res, next) => {
    const coverImageFilePath = req.file?.path;

    if (!coverImageFilePath) {
        throw new ApiError(400, "Cover image is required");
    }

    const coverImage = await uploadToCloudinary(coverImageFilePath);

    if (!coverImage.url) {
        throw new ApiError(500, "Failed to upload cover image to cloudinary");
    }

    const user = await User.findByIdAndUpdate(
        req.user?._id,
        {
            $set: {
                coverImage: coverImage.url
            }
        },
        { new: true }
    ).select("-password -refreshToken");

    return res
        .status(200)
        .json(new ApiResponse(
            200,
            user,
            "Cover image updated successfully"
        ))

});

export const getUserChannelProfile = asyncHandler(async (req, res, next) => {
    const { username } = req.params;

    if (!username) {
        throw new ApiError(400, "Username is required");
    }

    const channel = await User.aggregate(
        [
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
                            if: {
                                $in: [
                                    req.user?._id,
                                    "$subscribers",
                                    "subscriber"
                                ],
                            },
                            then: true,
                            else: false
                        }
                    }
                }
            },
            {
                // Project only necessary fields
                $project: {
                    fullname: 1,
                    username: 1,
                    avatar: 1,
                    subscribersCount: 1,
                    channelsSubscribedToCount: 1,
                    isSubscribed: 1,
                    coverImage: 1,
                    email: 1
                }
            }
        ]
    )

    console.log("channel : ", channel);

    if (channel.length === 0) {
        throw new ApiError(404, "Channel not found");
    }

    return res
        .status(200)
        .json(new ApiResponse(
            200,
            channel[0],
            "Channel profile fetched successfully"
        ));
})

export const getWatchHistory = asyncHandler(async (req, res, next) => {
    const user = await User.aggregate(
        [
            {
                $match: {
                    _id: mongoose.Types.ObjectId(req.user?._id)
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
                                            fullname: 1,
                                            username: 1,
                                            avatar: 1
                                        }
                                    }
                                ]
                            }
                        },
                        {
                            $addFields: {
                                owner: {
                                    $first: "$owner"
                                }
                            }
                        }
                    ]
                }
            }
        ]
    );


    if (user.length === 0) {
        throw new ApiError(404, "Watch history not found");
    }

    return res
        .status(200)
        .json(new ApiResponse(
            200,
            user[0]?.watchHistory,
            "Watch history fetched successfully"
        ));
});

