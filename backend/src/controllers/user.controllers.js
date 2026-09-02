import User from "../models/user.model.js";
import Chat from "../models/chat.model.js";
import Message from "../models/message.model.js"
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { signupSchema,loginSchema } from "../validators/user.Validator.js";


const createToken = (email,id)=>{

    if(!process.env.JWT_SECRET){
        throw new Error("JWT secret key is missing")
    }

    const token = jwt.sign( {email,id}, process.env.JWT_SECRET, {expiresIn: "1h"});

    return token;
};

const cookieOption = {
    httpOnly: true,
    secure: false,
    maxAge: 60*60*1000
};

export const signup = async (req,res) =>{
    try{

        const validation = signupSchema.safeParse(req.body);
        if(!validation.success){
            return res.status(400).json({
                message: validation.error.issues[0].message
            });
        };

        const {name,age,email,password} = validation.data;

        const isRegistered = await User.findOne({email});
        if(isRegistered){
            return res.status(409).json({
                message: "Email id already exists"
            });
        }

        const hashedPassword = await bcrypt.hash(password,12);

        const createUser = await User.create({
            name,
            age,
            email,
            password:hashedPassword
        });

        const token = await createToken(email,createUser._id);
        res.cookie("token",token,cookieOption);

        res.status(201).json({
            message: "User Created Successfully",
            name,
            age,
            email
        })

    }catch(err){
        console.log(err);
        res.status(500).json({
            message: "Internal Server Error"
        })
    }
};

export const login = async (req,res) =>{ 
    try{

        const validation = loginSchema.safeParse(req.body);
        if(!validation.success){
            return res.status(400).json({
                message: validation.error.issues[0].message
            })
        }

        const {email,password} = validation.data;

        const userExists = await User.findOne({email});
        if(!userExists){
            return res.status(401).json({
                message: "Invalid credentials"
            })
        }

        const isMatch = await bcrypt.compare(password,userExists.password);
        if(!isMatch){
            return res.status(401).json({
                message: "Invalid credentials"
            })
        }

        const token = createToken(email,userExists._id);
        res.cookie("token",token,cookieOption);

        res.status(200).json({
            message: "user logged in successfully",
            name: userExists.name,
            age: userExists.age,
            email: userExists.email,
            usage: userExists.usage
        });

    }catch(err){
        console.log(err);
        res.status(500).json({
            message: "Internal server error"
        });
    }
};

export const logout = (req,res) =>{
    
    res.clearCookie("token",{
        httpOnly: true,
        secure: false
    });

    res.status(200).json(({
        message: "User Logged out successfully"
    }))
};

export const profile = (req,res) =>{
    
    try{
        
        res.status(200).json({
            name:  req.user.name,
            age:   req.user.age,
            email: req.user.email,
            usage: req.user.usage
        })

    }catch(err){

        console.log(err);
        res.status(500).json({
            message: "Internal server error"
        })
    }
};

export const deleteAccount = async (req,res) =>{
    try{

        const userId = req.user._id;

        await Message.deleteMany({
            userId
        });

        await Chat.deleteMany({
            userId
        });

        await User.deleteOne({
            _id: userId
        });

        res.clearCookie("token",{ httpOnly: true, secure: false });

        res.status(200).json({
            message: "Account deleted successfully"
        });


    }catch(err){
        console.log(err);
        return res.status(200).json({
            message: "Internal server error"
        })
    }
};