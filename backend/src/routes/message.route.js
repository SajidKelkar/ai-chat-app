import express from "express";
import { getMessage, sendMessage } from "../controllers/message.controllers.js";
import userAuthMiddleware from "../middlewares/userAuthMiddleware.js";

const messageRouter = express.Router();

messageRouter.use(userAuthMiddleware);


messageRouter.get("/", getMessage);
messageRouter.get("/:chatId", getMessage);
messageRouter.post("/", sendMessage);
messageRouter.post("/:chatId", sendMessage);

export default messageRouter;
