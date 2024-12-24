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
        .json(new ApiResponse(200, {},"Logout successful"));
});
