/*
    id string pk
    content string
    video ObjectId video
    owner objectId user
    createdAt Date
    updatedAt Date
*/

import { Schema, model } from "mongoose";
import mongooseAggregatePaginate from "mongoose-aggregate-paginate-v2";

const commentSchema = new Schema(
    {
        content: {
            type: String,
            required: [true, "Content is required"],
            trim: true
        },
        video: {
            type: Schema.Types.ObjectId,
            ref: "Video"
        },
        owner: {
            type: Schema.Types.ObjectId,
            ref: "User"        
        },
    },
    { timestamps: true }
);

commentSchema.plugin(mongooseAggregatePaginate);

const Comment = model("Comment", commentSchema);

export default Comment;
