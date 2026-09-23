import express from "express";
import userAuthMiddleware from "../middlewares/userAuthMiddleware.js";
import { createChat, getRecentChats, getSingleChat, deleteChat } from "../controllers/chat.controllers.js";
import authenticatedRateLimiter from "../middlewares/authenticatedRateLimiter.js";
import loadUserMiddleware from "../middlewares/loadUserMiddleware.js";
const chatRouter = express.Router();

chatRouter.use(userAuthMiddleware);
chatRouter.use(authenticatedRateLimiter);
chatRouter.use(loadUserMiddleware);


chatRouter.post("/createChat",createChat);
chatRouter.get("/getRecentChats",getRecentChats);
chatRouter.get("/:chatId",getSingleChat);
chatRouter.get("/",getSingleChat);
chatRouter.delete("/:chatId",deleteChat);


export default chatRouter;