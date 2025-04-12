import { asyncHandler} from "../utils/asyncHandler.js";
import {ApiError} from "../utils/ApiError.js";
import { User } from "../models/user.model.js";
import { uploadToCloudinary } from "../utils/cloudinary.js";
import { ApiResponse } from "../utils/ApiResponse.js";

const registerUser = asyncHandler(async(req,res)=>{
   //get user information from frontend
   //validation-not empty
   //check if user alredy exists :username, email
   //check for images, check for avtar
   //upload them to cloudinary: avatar
   //create user object - crete entry in db
   //remove password and refresh token field from response
   //check for use creation 
   //return res
   
   const {username, email, fullName, password} = req.body;
   console.log("Email: ",email)

   if(
    [fullName, username, email, password].some((field) => field?.trim() === "")
   ){
    throw new ApiError(400, "All fields are required")
   }

   const existedUser = User.findOne({
    $or : [{email},{username}]
   })
   if(existedUser){
    throw new ApiError(409, "User already exists")
   }
   const avatatLocalPath=req.files?.avatar[0]?.path //middleware property
   const coverImageLocalPath=req.files?.coverImage[0]?.path //middleware property
   if(!avatatLocalPath){
    throw new ApiError(400, "Avatar is required")
   }

   const avatar=await uploadToCloudinary(avatatLocalPath)
   const coverImage= await uploadToCloudinary(coverImageLocalPath)

   if(!avatar){
     throw new ApiError(400,"Avatar is required")
   }
   const user = await User.create({
    fullName,
    avatar:avatar.url,
    coverImage:coverImage?.url || "",
    email,
    password,
    username: username.toLowerCase()
   })
   const createdUser =await User.findById(user._id).select(
    "-password -refreshToekn"
   )
   if(!createdUser){
    throw new ApiError(500, "something went wrong while creating user")
   }

   return res.status(201).json(

    new ApiResponse(200, createdUser, "User registered successfully")
   )

})

export {
    registerUser,
}