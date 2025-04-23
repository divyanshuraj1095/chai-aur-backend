import { asyncHandler } from "../utils/asyncHandler.js";


const registerUser = asyncHandler( async (req, res)=> {
    try{
    console.log("hit ")
    res.status(200).json({
        message: "ok"
    })
}catch(err){
        console.log("Error: ", err)
        res.status(500).json({
            message: "Internal server error"
        })
    }
})
// const registerUser = (req, res)=> {
//     try{
//         console.log("hit ")
//         res.status(200).json({
//             message: "ok"
//         })
//     }catch(err){
//         console.log("Error: ", err)
//         res.status(500).json({
//             message: "Internal server error"
//         })
//     }
// }

export {registerUser}