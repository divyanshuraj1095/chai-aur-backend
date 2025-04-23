import { Router } from "express";
import { registerUser } from "../controllers/user.controller.js";

const router = Router()

// router.route("/register").post(registerUser)
router.route("/register").post((req, res, next)=>{
    console.log("Inside register route")

    next()
}, registerUser)


export default router
