// Import express from the express module
import express from 'express';
import cookieParser from 'cookie-parser';
import cors from 'cors';

const app = express();

app.use(cors(
    {
        origin: process.env.CORS_ORIGIN,
        credentials:true

    }));

app.use(express.json({limit:"16kb"})); 
app.use(express.urlencoded({extends:true, limit:"16kb"}))
app.use(express.static("public"));
app.use(cookieParser());

// You can configure your app here (middleware, routes, etc.)
// Example: app.use(express.json()); for parsing JSON requests

// Export the app to be used in other files (e.g., server.js or index.js)



//import routes 
import userRoutes from './routes/user.routes.js';

//routes declaration with middleare(userRoutes)
app.use("/api/v1/users", userRoutes);


export { app };


