import { asyncHandler } from "../utils/asyncHandler";
import { ApiError } from "../utils/apiError";
import jwt from "jsonwebtoken";
import {User} from "../models/user.model.js"


export const verifyJWT= asyncHandler(async (req, _, next)=>{
    try{
    const token=req.cookies?.accessToken || req.header("Authorization")?.replace("Bearer ", "") 

    if (!token){
        throw new ApiError(401, "You are not authorized to access this resource")
    }

    const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET)
    const user = await User.findById(decodedToken?._id)
    .select("-password -refreshToken")

    if(!user){
        throw new ApiError(401, "Invalid Acces Token")
    }

    req.user = user
    next()
}catch(error){
    throw new ApiError(401, "Invalid Acces Token")
}


})