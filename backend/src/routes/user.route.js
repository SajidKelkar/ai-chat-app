import express from "express";
import {signup, login, logout, profile , deleteAccount} from "../controllers/user.controllers.js";
import userAuthMiddleware from "../middlewares/userAuthMiddleware.js";

const userRouter = express.Router();


userRouter.post("/signup", signup);
userRouter.post("/login", login);
userRouter.post("/logout", logout);
userRouter.get("/profile", userAuthMiddleware, profile);
userRouter.post("/delete", userAuthMiddleware, deleteAccount);




export default userRouter;