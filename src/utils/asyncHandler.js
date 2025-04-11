//promise method....
const asyncHandler = (requestHandler)=>{
      return (req, res, next)=>{
        Promise.resolve(requestHandler).catch((err)=>next(err))
    }
}


export {asyncHandler}
//try-catch method.....


// const asyncHandler = (fn) =>async(req, res, next) =>{
//  try {
//     await fn(req, res, next)
//  }catch (error){
//     res.status(error.code || 500).json({
//         success: false,
//         message: error.message
//     })
//  }

// }