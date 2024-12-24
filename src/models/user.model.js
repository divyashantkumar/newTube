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
import bcrypt from "bcrypt";
import jwt from 'jsonwebtoken';

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

// encrypt password before saving to database 
userSchema.pre("save", function (next) {
    // only hash the password if it has been modifiedss
    if (!this.isModified("password")) return next();

    this.password = bcrypt.hashSync(this.password, 10);

    next();
});


// compare password with hashed password in database 
userSchema.methods.comparePassword = async function (password) {
    return await bcrypt.compare(password, this.password);
}

userSchema.methods.generateAccessToken = function () {
    // short lived access token

    return jwt.sign(
        {
            _id: this._id,
            username: this.username,
            email: this.email,
            fullname: this.fullname,
        },
        process.env.ACCESS_TOKEN_SECRET,
        {
            expiresIn: process.env.ACCESS_TOKEN_EXPIRY,
        }
    )

}

userSchema.methods.generateRefreshToken = function () {
    // long lived refresh token

    return jwt.sign(
        {
            _id: this._id
        },
        process.env.REFRESH_TOKEN_SECRET,
        {
            expiresIn: process.env.REFRESH_TOKEN_EXPIRY,
        }
    )

}

const User = model("User", userSchema);

export default User;
