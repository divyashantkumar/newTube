/*
    id string pk
    owner string
    videos ObjectId[] video
    name string
    description string
    createdAt Date
    updatedAt Date
*/

import { Schema, model } from "mongoose";


const videoSchema = new Schema(
    {
        videoFile: {
            type: String, // cloudinary url
            required: [true, "videoFile is required"]
        },
        thumbnail: {
            type: String, // cloudinary url
            required: [true, "Thumbnail is required"]
        },
        title: {
            type: String,
            required: [true, "Title is required"]
        },
        desctiption: {
            type: String, // cloudinary url
            required: [true, "Desctiption is required"]
        },
        duration: {
            type: Number,
            required: true,
        },
        views: {
            type: Number,
            default: 0,
        },
        isPublished: {
            type: Boolean,
            default: false
        },
        owner: {
            type: Schema.Types.ObjectId,
            ref: "User",
            required: [true, "Owner is required"]
        }
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

const Video = model("Video", videoSchema);

export default Video; 
