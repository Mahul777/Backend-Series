import dotenv from 'dotenv';
import { connectDB } from './db/database.js'; // Corrected import (named import)

import { app } from './app.js';
// Load environment variables
dotenv.config({
    path: './.env', // Adjust if the .env file is in a different location
});

// Connect to MongoDB
connectDB()
    .then(() => {
        // Start the server once DB connection is successful
        app.listen(process.env.PORT || 8000, () => {
            console.log(`⚙️ Server is running at port : ${process.env.PORT}`);
        });
    })
    .catch((err) => {
        console.log("MONGO DB connection failed!!!", err);
    });
