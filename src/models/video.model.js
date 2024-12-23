/*
    id string pk
    owner string
    videoFile string
    thumbnail string
    title string
    description string
    duration number
    views number
    isPublished boolean
    createdAt Date
    updatedAt Date
*/

import { Schema, model } from "mongoose";
import mongooseAggregatePaginate from "mongoose-aggregate-paginate-v2";

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

videoSchema.plugin(mongooseAggregatePaginate);

const Video = model("Video", videoSchema);

export default Video; 
