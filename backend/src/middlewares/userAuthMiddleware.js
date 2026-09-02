import jwt from "jsonwebtoken";
import User from "../models/user.model.js";

const userAuthMiddleware = async (req,res,next) => {
    try{

        const {token} = req.cookies;
        if(!token){
            return res.status(401).json({
                message: "token not provided"
            })
        }

        let payload;
        try{
            payload = jwt.verify(token,process.env.JWT_SECRET);
        }catch(err){
            return res.status(401).json({
                message: "token not valid"
            })
        }

        const existingUser = await User.findById(payload.id);
        if(!existingUser){
            return res.status(404).json({
                message: "user not found"
            })
        }

        req.user = existingUser;
        next();

    }catch(err){
        console.log(err);
        res.status(500).json({
            message: "internal server error"
        })
    }
}


export default userAuthMiddleware;