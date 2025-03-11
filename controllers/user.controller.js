import { asyncHandler } from '../utils/asyncHandler.js';
import { ApiError } from '../utils/ApiError.js'; // relative path
import {User} from "../models/user.modal.js"
import {uploadCloudinary} from '../utils/cloudinary.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import jwt from 'jsonwebtoken';


const generateAccessAndRefreshToken = async(userId) =>
{
 //we need to pass "userId"
 try
{
  //we need to find User to generate token
   const user = await User.findById(userId);
   const accessToken= user.generateAccessToken();//it come from user.model.js
   const refreshToken= user.generateRefreshToken(); //it come from user.model.js

  //now send refreshToken send it to database and save it 
  //user is object and we need add the value
   user.refreshToken = refreshToken
   await user.save({validateBeforeSave: false});
   return {accessToken, refreshToken}
}
 catch(error)
 {
  throw new ApiError(500,"Something went wrong while generationg access and refresh token  ");
 }
} 


//create method to register user
const registerUser = asyncHandler(async(req,res,next)=>
    {
        // * get user details from frontend or take data from postman and userdata that depend on user.modal.js 
        // * validation user data 
        // * check user is already exists:email and username
        // * check you have file or not: avatar and images
        // * If available then upload in cloudnary avatar
        // *Create a user object containing all user details.Send the user object to MongoDB and create an entry in the database.
        // *remove password and refreshToken field from response
        // *check user creation
        // *return response

        const {fullName, email,username,password} = req.body;
        console.log("email", email);
        console.log("password", password);
        console.log("username", username);
        console.log("fullName", fullName);  

        //Validation
        if(fullName =="")
        {
           throw new ApiError(400,"Full Name is required");
        }
        else if(username =="")
        {
          throw new ApiError(400,"username is required");
        }
        else if(password =="")
        {
                   throw new ApiError(400,"password is required");
        }
        else if(email =="")
        {
         throw new ApiError(400,"email is required");
        }


         // Check if the email or username already exists in the database
  const existingUser = await User.findOne({ $or: [{ email }, { username }] });

  if (existingUser) {
    if (existingUser.email === email) {
      throw new ApiError(400, "Email is already taken");
    }

    if (existingUser.username === username) {
      throw new ApiError(400, "Username is already taken");
    }
  }

        //check you have file or not: avatar and images
        const avatarLocalPath = req.files?.avatar[0]?.path;
        //const coverImageLocalPath = req.files?.coverImage[0]?.path;
            
        //Now check when we do not give coverImage file then what happen
        let coverImageLocalPath;
        if (req.files && Array.isArray(req.files.coverImage) && req.files.coverImage.length > 0) 
        {
          coverImageLocalPath = req.files.coverImage[0].path;
        }
        console.log("Checking the object of req.files", req.files);
        
        //Now check avatar once wheter it has come properly
        if (!avatarLocalPath) {  //if avatarLocalPath is not come 
            throw new ApiError(400,"Avatr files is required");
        }

        //If file available then upload in cloudnary avatar
        const avatar = await uploadCloudinary(avatarLocalPath);
        const coverImage = await uploadCloudinary(coverImageLocalPath);
        //check if avatar image is present or not 
        if(!avatar){
            throw new ApiError(400,"Avatr files is required");
        }


        // Create a user object containing all user details.Send the user object to MongoDB and create an entry in the database.
        const user = await User.create(
            {
                fullName,
                avatar:avatar.url,
                coverImage:coverImage?.url || "", //if coverImageis present in cloudnaru then send url in database otherwise remain as empty
                email,
                password,
                username: username.toLowerCase(),

            })

            // remove password and refreshToken field from response
            const createdUser = await User.findById(user._id).select(
                "-password -refreshToken"
            );

            //now check is user has come or not 
            if(!createdUser)
                {
                    throw new ApiError(500,"Something went wrong while registering the user");
                }

            // return response
            // return response.status(201).json({createdUser}); -> first war to response 
            //send response  in organize way
            return res.status(201).json(
              //object ApiResponse
              new ApiResponse(200,createdUser,"User created Successfully while register")
            )

    }) 
//create method to login user
const loginUser = asyncHandler(async(req,res,next) =>
  {
    //Bring the data from req.body
    //Give access based on username or email
   // find the user in req.body
   //Check the password 
   //Generate Access and refresh token and send to user
   //Send the user through cookies

   //Bring the data from req.body
   const {email,username,password}= req.body; //User can send username or password or email

   //Give access based on username or email
   //email,username,password ->Out of these we need one 
   if (!email && !username) 
   { //if user not send none of them
     throw new ApiError(400,"username or email is required");
   } 
   

   // find the user in req.body
   //if you are register you can do login 
    const user = await User.findOne({$or: [ {username},{email}]})  //find User based on email or username and or-> it mongodb operator where we can array under which pass object
    //If you still not able to find then it means user is not register
    if(!user)
      {
        throw new ApiError(404,"User Does not Exists");
      }


      //Check the password
      //if you find the user then check the password
      const isPasswordValid = await user.isPasswordCorrect(password)  //isPasswordCorrect()-> this method define user.modal.js
      //If you able to find password in database 
    if(!isPasswordValid)
      {
        throw new ApiError(404,"Password Does not Exists");
      }


      //Generate Access and refresh token and send to user
        const {accessToken, refreshToken} = await generateAccessAndRefreshToken(user._id);


        //Send the user through cookies
        const loggedInUser = await User.findById(user._id).select("-password -refreshToken") //this is optional 
        const Options=
        {
          httpOnly:true,
          secure:true
        }

        return res
  .status(200)
  .cookie("accessToken", accessToken, Options)
  .cookie("refreshToken", refreshToken, Options)
  .json(
    new ApiResponse(200, {
      user: loggedInUser, 
      accessToken,  // Correct variable name here
      refreshToken
    }, "User logged in successfully")
  );


    })

const logOutUser = asyncHandler( async(req,res) =>
  {
   await User.findByIdAndUpdate(
    req.user._id,
    {
      $set:   //set->it is mongodb operator which is used what I need to update
      {
        refreshToken: undefined  //clean the refreshToken 
      }
    },
    {
      new:true //In response you new updated value
    }
   )
   //For cookies we need options and inside Option we need to clear the cookies
   const Options=
   {
     httpOnly:true,
     secure:true
   }
   return res
   .status(200)
   .clearCookie("accessToken",Options)
   .clearCookie("refreshToken",Options)
   .json(new ApiResponse(200,{},"User Logged Out Successfully"))
  })

  //Now we will create end-point so user can refresh his access token 
  const refreshAccessToken = asyncHandler(async(req,res) =>
    {
       //*Send refresh Access token which access from  cookies
      const incomingRefreshToken = req.cookies.refreshToken || req.body.refreshToken;
       //if don't get refreshAccessToken 
       if(!incomingRefreshToken){
        throw new ApiError(401,"Unauthorized request");
       }
       try {
        //*Now we need to verify incomingRefreshToken
       const decodedToken = jwt.verify      //to verify we need to send token and secretKey
       (
        incomingRefreshToken,
        process.env.REFRESH_TOKEN_SECRET
       ) 
       //* Finding the user 
       const user = await User.findById(decodedToken?._id)//find the user based on decodedToken
       //if you don't find the user
       if(!user)
        {
          throw new ApiError(401,"Invaid refresh token");
        } 

        //* Match the token 
        //if incomingRefreshToken which is given by user and decodedToken matches then generateAccessAndRefreshToken
        if (incomingRefreshToken != user.refreshToken) {
          throw new ApiError(401,"Refresh token is expired or used")
        } 
        const options=
        {
          httpOnly:true,
          secure:true
        }
        const {accessToken,newRefreshToken}= await generateAccessAndRefreshToken(user._id)
        //* send response
        return res
        .status(200)
        .cookie("accessToken",accessToken,options)
        .cookie("refreshToken",newRefreshToken,options)
        .json(
          new ApiResponse(
            200,
            {accessToken, refreshToken:newRefreshToken},"Access Token is refreshed"
          )
        )
        
       } catch (error) {
         throw new ApiError(400,error?.message || "Invalid Refresh Token ")
       }
    })
  //Now we are going to handle subscription Model
    const changeCurrentPassword = asyncHandler(async(req,res) =>
    {
      //Here we want to change current password of user
       //*  Here we take some field from user
       const {oldPassword,newPassword} = req.body; //The old and new passwords from the request body
       //* Step 1: Find the user by their ID (userId)
       const user = await User.findById(req.user?._id)
       //checking the oldPassword is correct 
       const isPasswordCorrect = await user.isPasswordCorrect(oldPassword); 
       if (!oldPassword) {
         throw new ApiError(400,"Invalid Old Password");
       }
       //Now oldPassword is correct and now we need to set newPassword
       user.password = new newPassword
       user.save({validateBeforeSave:false})

       //now we need to return the response 
       return res
       .status(200)
       .json(new ApiResponse(200,{},"Password Changed Successfully"))

    })
  //Now we tring to get current user 
  const getCurrentUser = asyncHandler(async(req,res) =>
    {
      return res
      .status(200)
      .json(ApiResponse(200,req.user,"cyrrent user fetched successfully"))
    })
  
  //Now we need allowed to change Account details
  const updateAccountDetails = asyncHandler( async(req,res) =>
    {
      const {fullName,email} = req.body; //user is allowed to change name  and email
      if (!fullName || !email) {
        throw new ApiError(400,"All fields are required");
      }
      //To Update we need to find the user
      const user = User.findByIdAndUpdate(
        req.user?._id,
      {$set:
        {
          fullName:fullName,
          email:email
        }}, //mondodb operator 
      {new:true} //it return value of after updation value
    ).select("-password")

    //return the response 
    return res
    .status(200)
    .json(new ApiResponse(200,user,"Account details Updated successfully"))

    })

//Now we need to update the avatar
const updateAvatar = asyncHandler(async(req,res) =>
  {
    //First we need to take a file for Avatar
    const AvatarLocalPath = req.file?.path;
    if (!AvatarLocalPath) {
       throw new ApiError(400,"Avatar FIle is missing");
    }
    //We have Avatar file path then we need to upload file in cloudnary
    const avatar = await uploadCloudinary(AvatarLocalPath);
    //upload a file in cloudnary and did not get url
    if (!avatar.url) {
      throw new ApiError(400,"Error while uploading Avatar");
    }
    //update the avatar
    const user = await User.findByIdAndUpdate(
      req.user?._id,
      {$set:{avatar: avatar.url}},  //to updaate we use set operator of mongodb
      {new: true}
    ).select("-password")

    //return the response
    return res
    .status(200)
    .json
    (
      new ApiResponse(200,user,"Avatar Image updated Successfully")
    )

  })

  const updateCoverImage = asyncHandler(async(req,res) =>
    {
      //First we need to take a file for CoverImage
      const CoverLocalPath = req.file?.path;
      if (!CoverLocalPath) {
         throw new ApiError(400,"Cover Image FIle is missing");
      }
      //We have CoverImage file path then we need to upload file in cloudnary
      const coverImage = await uploadCloudinary(CoverLocalPath);
      //upload a file in cloudnary and did not get url
      if (!coverImage.url) {
        throw new ApiError(400,"Error while uploading coverImage");
      }
      //update the avatar
      const user = await User.findByIdAndUpdate(
        req.user?._id,
        {$set:{coverImage: coverImage.url}},  //to updaate we use set operator of mongodb
        {new: true}
      ).select("-password")

      //return the response
      return res
      .status(200)
      .json
      (
        new ApiResponse(200,user,"Cover Image updated Successfully")
      )
  
    })

  



export {registerUser,loginUser,logOutUser,refreshAccessToken,changeCurrentPassword,getCurrentUser,updateAccountDetails,updateAvatar,updateCoverImage}