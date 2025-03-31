import multer from "multer";
//we r using diskstorage........
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, "./public/temp")//all the files in the public folder
    },
    filename: function (req, file, cb) {
      
      cb(null, file.originalname)
    }
  })
  
export const upload = multer({
     storage,

     })