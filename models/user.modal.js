import mongoose, { Schema } from 'mongoose'
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";

//Schema Creation
const UserSchema = new Schema(
    {
        username:
        {
            type:String,
            required:true,
            lowercase:true,
            unique:true,
            trim:true,
            index:true //it is used for searching 
        },
        email:
        {
            type:String,
            required:true,
            lowercase:true,
            unique:true,
            trim:true
        },
        fullName:
        {
            type:String,
            required:true,
            trim:true,
            index:true
        },
        avatar:
        {
            type:String, //Here we use Cloudinary url
            required:true
        },
        coverImage:
        {
            type:String, //Here we use Cloudinary url
        },
        watchHistory:
        [
            //it is dependent on videos  and has multiple value so we use array 
            {
                type: Schema.Types.ObjectId,
                ref:"Video"
            }
            
        ],
        password:
        {
          type:String,
          required:[true,"password is required"]
        },
        refreshToken:
        {
            type:String
        }
    },
    {
        timestamps:true, //if timestamps is true then u will get createdAt and updatedAt 
    });
    
    //password going to save then this pre-middleware help us to encrypt
    UserSchema.pre("save", async function (next)
    {
        //if we make changes in password then only encrypt and save it 
      if(!this.isModified("password")) return next();
      this.password = await bcrypt.hash(this.password,10)
      next()
    })
    //Now we put some methods so we can ask User the password is correct or not 
    UserSchema.methods.isPasswordCorrect = async function(password)
    {
        //now we ask bcrypt as check the password
        return await bcrypt.compare(password,this.password); //password->given by user, ,this.password ->encrypted password
    }
    //Now we are going to use Refresh and Access_token 
    UserSchema.methods.generateAccessToken = function(){
        return jwt.sign(
            {
                id:this.id, //id ->payload , this.id-> come from database
                email:this.email,
                username: this.username,
                fullName: this.fullName
            },
            process.env.ACCESS_TOKEN_SECRET,
            {
                expiresIn:process.env.ACCESS_TOKEN_EXPIRY
            }
        )
    }
    UserSchema.methods.generateRefreshToken = function(){
        return jwt.sign(
            {
                _id:this._id, //id ->payload , this.id-> come from database
            },
            process.env.REFRESH_TOKEN_SECRET,
            {
                expiresIn:process.env.REFRESH_TOKEN_EXPIRY
            }
        )
    }

export const User = mongoose.model("User",UserSchema);