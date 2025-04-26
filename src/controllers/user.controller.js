import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/apiError.js";
import { User } from "../models/user.model.js";
import {uploadOnCloudinary} from "../utils/cloudinary.js"
import { ApiResponse } from "../utils/ApiResponse.js";  

const generateAccessAndRefreshTokens = async(userId) => {
   try{
      const user = await User.findById(userId)
      const accessToken = user.generateAccessToken()
      const refreshToken = user.generateRefreshToken()

      user.refreshToken = refreshToken //added to the user object (upper user)
      await user.save({validateBeforeSave : false})//it is now connected to the user object in the db it wil ask for other fields to be saved as well like passwords that we r not passing here so we use validate before saving....
      return {accessToken, refreshToken}


      
   }catch(error){
      throw newApiError(500, "Something went wrong while generating tokens")
   }
}

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
        field?.trim() === "")
   ){
     throw new ApiError(400,"All fields are required")
   }

   const existedUser= await User.findOne({
    $or: [
        {email},
        {username}
    ]
   })

   if(existedUser){
    throw new ApiError(409,"User already exists")
   }
   //console.log(req.files)

   const avatarLocalPath=req.files?.avatar[0]?.path
   // const coverImageLocalPath=req.files?.coverImage[0]?.path

   let coverImageLocalPath
   if(req.files && Array.isArray(req.files.coverImage) && req.files.coverImage.length > 0){
      coverImageLocalPath = req.files.coverImage[0].path
   }

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
const loginUser = asyncHandler(async (req, res) => {
      // req.body -> data
      // username or email
      //find the user
      //password check
      //access and refresh token generation
      //send cookies
      //send response
      const {username, email, password} =req.body
      if(!username || !email){
         throw new ApiError(400,"Username or email is required")
      }

      const user = await User.findOne({
         $or: [
            {username},
            {email}
         ]
      })

      if(!user){
         throw new ApiError(404,"user does not exist")
      }

      const isPasswordValid=await user.isPasswordCorrect(password)
      if(!isPasswordValid){
         throw new ApiError(401,"password incorrect")
      }
      
      const {accessToken, refreshToken}=await generateAccessAndRefreshTokens(user._id)
      
      const loggedInUser = await User.findById(user._id)
      .select("-password -refreshToken")
      const options = {
         httpOnly: true,
         secure: true
      }

      return res
      .status(200)
      .cookie("accessToken", accessToken, options)
      .cookie("refreshToken", refreshToken, options)
      .json(
         new ApiResponse(200,{
            user: loggedInUser,accessToken, refreshToken //data to be sent in response
         }, 
         "User Lgged in Successfully"
        )
      )
      




})
const logoutUser = asyncHandler(async (req, res)=>{
         await User.findByIdAndUpdate(
            req.user._id,
            {
               $set: {
                  refreshToken: undefined
               }
            },
            {
               new: true
            }
         )

         const options = {
            httpOnly: true,
            secure: true
         }

         return res
         .status(200)
         .clearCookie("accessToken", options)
         .cookie("refreshToken", options)
         .json(
         new ApiResponse(200,{
      }, 
         "User Logged out Successfully!!"
        )
      )
})


export {
        registerUser,
        loginUser,
        logoutUser
}