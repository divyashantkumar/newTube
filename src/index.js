import { app } from "./app.js";
import express from "express";
import dotenv from "dotenv";
import cors from 'cors';
import healthcheckRouter from './routes/healthcheck.route.js';
import { connectDB } from "./db/index.js";

dotenv.config();

const PORT = process.env.PORT || 3000;

// 1. Enable CORS
app.use(cors({
    origin: process.env.CORS_ORIGIN,
    allowedHeaders: [
        'Content-Type',
        'Authorization',
        'Accept',
    ],
    credentials: true,
}));

//2. Enable body parser
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));


// 3. Enable static files
app.set('view engine', 'ejs');
app.set("views", "./views");
app.use(express.static('public'));


// ROUTES
app.use('/api/v1/healthcheck', healthcheckRouter);

connectDB()
.then(() => {
    app.listen(PORT, () => {
        console.log(`Server is running on port ${PORT}`);
    });
}).catch((error) => {
    console.log("MongoDB failed to connect : ", error);
    process.exit(1);
});
