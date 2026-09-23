import express from "express";
import {signup, login, logout, profile , deleteAccount} from "../controllers/user.controllers.js";
import userAuthMiddleware from "../middlewares/userAuthMiddleware.js";
import authenticatedRateLimiter from "../middlewares/authenticatedRateLimiter.js";
import unauthenticatedRateLimiter from "../middlewares/unauthenticatedRateLimiter.js";
import loadUserMiddleware from "../middlewares/loadUserMiddleware.js";

const userRouter = express.Router();


userRouter.post("/signup", unauthenticatedRateLimiter, signup);
userRouter.post("/login", unauthenticatedRateLimiter, login);
userRouter.post("/logout", userAuthMiddleware, authenticatedRateLimiter, logout);
userRouter.get("/profile", userAuthMiddleware, authenticatedRateLimiter, loadUserMiddleware, profile);
userRouter.post("/delete", userAuthMiddleware, authenticatedRateLimiter, loadUserMiddleware, deleteAccount);


export default userRouter;