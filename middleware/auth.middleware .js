import jwt from 'jsonwebtoken';
import { ApiError } from '../utils/ApiError.js'; // relative path
import { asyncHandler } from '../utils/asyncHandler.js';

import { User } from "../models/user.modal.js";

export const verifyJWT = asyncHandler(async (req, res, next) => {
  try {
    // Accessing the token from Authorization header or cookies
    const token = req.cookies?.accessToken || req.header("Authorization")?.replace("Bearer ", "");
    
    console.log("Received Token:", token); // Log the received token
    
    // If no token is provided, throw an error
    if (!token) {
      throw new ApiError(404, "Unauthorized Request");
    }

    // Decode the token to access the payload
    const decodeToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);

    console.log("Decoded Token:", decodeToken); // Log the decoded token

    // Check if token is expired before proceeding further
    const currentTimestamp = Math.floor(Date.now() / 1000); // Get current timestamp in seconds

    if (decodeToken.exp < currentTimestamp) {
      throw new ApiError(401, "Access token expired. Please log in again.");
    }

    // If the token is valid, find the user
    const user = await User.findById(decodeToken.id).select("-password -refreshToken");

    if (!user) {
      throw new ApiError(401, "Invalid access token");
    }

    // Add user information to the request
    req.user = user;
    next();
  } catch (error) {
    console.error("Error in verifyJWT:", error); // Log the error
    
    // Handle token expiration explicitly
    if (error.name === "TokenExpiredError") {
      throw new ApiError(401, "Access token expired. Please log in again.");
    }

    // Handle other errors (invalid token, malformed token, etc.)
    throw new ApiError(401, error?.message || "Invalid Access Token");
  }
});
