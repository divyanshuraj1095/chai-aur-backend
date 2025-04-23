import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/apiError.js";
import { User } from "../models/user.model.js";
import {uploadOnCloudinary} from "../utils/cloudinary.js"
import { ApiResponse } from "../utils/ApiResponse.js";  

const registerUser = asyncHandler( async (req, res)=> {
   // get user details from frontend
   //validation - not empty
   //check if user already exists : username and email
   //check for images ,,,check for avatar
   //upload them to cloudinary , avatar
   //create user object - create entry in db
   //remove password and refresh token field from response
   //check for user creation
   //return response

   const {fullname, email, username, password}= req.body
   console.log("Email: ", email)

//    if(fullname === ""){
//      throw new ApiError(400,"fullname is required")
//    }
   if(
    [fullname, email, username, password].some((field)=>
        fielld?.trim() === "")
   ){
     throw new ApiError(400,"All fields are required")
   }

   const existedUser=User.findOne({
    $or: [
        {email},
        {username}
    ]
   })

   if(existedUser){
    throw new ApiError(409,"User already exists")
   }

   const avatarLocalPath=req.files?.avatar[0]?.path
   const coverImageLocalPath=req.files?.coverImage[0]?.path

   if(!avatarLocalPath){
    throw new ApiError(400,"Avatar is required")
   }

   const avatar = await uploadOnCloudinary(avatarLocalPath)
   const coverImage = await uploadOnCloudinary(coverImageLocalPath)

   if(!avatarLocalPath){
    throw new ApiError(400,"Avatar is required")
   }

   const user=await User.create({
    fullname,
    avatar: avatar.url,
    coverImage: coverImage?.url || "",
    email,
    password,
    username: username.toLowerCase()
   })

   const createdUser = await User.findById(user._id).select(
    "-password -refreshToken"
   )

   if(!createdUser){
    throw new ApiError(500,"User creation failed")
   }

   return res.status(201).json(
    new ApiResponse(200, createdUser, "User registered successfully")
   )

})


export {registerUser}