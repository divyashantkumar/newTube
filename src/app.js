import express from "express";
import cors from 'cors';
import cookieParser from "cookie-parser";
import healthcheckRouter from './routes/healthcheck.route.js'
import userRouter from './routes/user.route.js';
import { errorHandler } from "./middleware/errors.middleware.js";


const app = express();

// TODO: Add loogger middleware
// 1. Logger Middleware


// TODO: Add Security middlewares
// 2. Security Middlewares


// 3. Enable CORS
app.use(cors({
    origin: process.env.CORS_ORIGIN,
    allowedHeaders: [
        'Content-Type',
        'Authorization',
        'Accept',
    ],
    credentials: true,
}));


// 4. Body Parser Middlewares
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));
// Inorder to access cookies in request object, cookieParser() middleware is required (mentioned in express docs)
app.use(cookieParser());


// 5. Set up view Engine or Template Engine
app.set('view engine', 'ejs');
app.set("views", "./views");
app.use(express.static('public'));


// 6. ROUTES
app.use('/api/v1/healthcheck', healthcheckRouter);
app.use('/api/v1/user', userRouter);

// 7. Base Route
app.get (RegExp('/$'), (req, res) => {
    res.send('Hello Base Route');
})


// 8. Global Error Handler
app.use(errorHandler);


// 9. 404 Global Path Handler
app.use((req, res, next) => {
    res.status(404);
    res.render('error404');
});


export default app 
