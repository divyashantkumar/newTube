import mongoose  from 'mongoose';
import { DB_NAME } from '../constants.js';



export const connectDB = async () => {
    try {
        console.log("DB connecting...");
       const conn = await mongoose.connect(`${process.env.MONGODB_URI}`);
        console.log(`DB connected, DB host : ${conn.connection.host}`);
    } catch (error) {
        console.log("MongoDB connection failed : ", error);
        process.exit(1);
    }
}

