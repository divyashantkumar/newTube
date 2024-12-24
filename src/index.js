import { config } from "dotenv";
config();
import { connectDB } from "./db/index.js";
import app from "./app.js";

const PORT = process.env.PORT || 3000;



// START SERVER 
connectDB()
.then(() => {
    app.listen(PORT, () => {
        console.log(`Server is running on port ${PORT}`);
    });
}).catch((error) => {
    console.log("MongoDB failed to connect : ", error);
    process.exit(1);
});
