/*
    id string pk
    username string
    email string
    fullname string
    avatar string
    coverImage string
    watchHistory ObjectId[] videos
    password string
    refreshToken string
    createdAt Date
    updatedAt Date
*/

import { Schema, model } from "mongoose";


const userSchema = new Schema(
    {
        username: {
            type: String,
            required: [true, "Username is required"],
            unique: true,
            lowercase: true,
            trim: true,
            index: true
        },
        email: {
            type: String,
            required: [true, "Email is required"],
            unique: true,
            lowercase: true,
            trim: true,
            index: true
        },
        fullname: {
            type: String,
            required: [true, "FullName is required"],
            trim: true,
            index: true
        },
        avatar: {
            type: String,  // cloudinary url
            required: [true, "Avatar is required"],
        },
        coverImage: {
            type: String,  // cloudinary url
        },
        watchHistory: [
            {
                type: Schema.Types.ObjectId,
                ref: "Video"
            }
        ],
        password: {
            type: String,
            required: [true, "Password is required"],
        },
        refreshToken: {
            type: String,
        },
        // createdAt: {
        //     type: Date,
        //     default: Date.now
        // },
        // updatedAt: {
        //     type: Date,
        //     default: Date.now
        // },
    },
    { timestamps: true } // mongoose will add createdAt and updatedAt fields to the schema automatically 
);

const User = model("User", userSchema);

export default User;
