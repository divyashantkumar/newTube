import express from "express";
import cors from 'cors';
import cookieParser from "cookie-parser";
import healthcheckRouter from './routes/healthcheck.route.js'
import userRouter from './routes/user.route.js';
import { errorHandler } from "./middleware/errors.middleware.js";


const app = express();


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
// Inorder to access cookies in request object, cookieParser() middleware is required (mentioned in express docs)
app.use(cookieParser());


// 3. Enable static files
app.set('view engine', 'ejs');
app.set("views", "./views");
app.use(express.static('public'));


// ROUTES
app.use('/api/v1/healthcheck', healthcheckRouter);
app.use('/api/v1/user', userRouter);

app.use(errorHandler);

export default app 
