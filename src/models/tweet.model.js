/*
    id string pk
    owner string
    content string
    createdAt Date
    updatedAt Date
*/

import { Schema, model } from "mongoose";

const tweetSchema = new Schema(
    {
        content: {
            type: String,
            required: [true, "Content is required"],
            trim: true
        },
        owner: {
            type: Schema.Types.ObjectId,
            ref: "User"
        },
    },
    { timestamps: true }
)