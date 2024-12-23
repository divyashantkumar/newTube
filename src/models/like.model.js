/*
    id string pk
    video ObjectId video
    comment ObjectId comment
    tweet ObjectId tweet 
    likedBy objectId user
    createdAt Date
    updatedAt Date
*/

import { Schema, model } from "mongoose";

const likedSchema = new Schema(
    {
        video: {
            typeof: Schema.Types.ObjectId,
            ref: "Video"
        },
        comment: {
            type: Schema.Types.ObjectId,
            ref: "Comment"
        },
        tweet: {
            type: Schema.Types.ObjectId,  
            ref: "Tweet"
        },
        likedBy: {
            type: Schema.Types.ObjectId,
            ref: "User"
        }
    },
    { timestamps: true }
);

const Like = model("Like", likedSchema);

export default Like;
