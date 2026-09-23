import Chat from "../models/chat.model.js";
import Message from "../models/message.model.js";
import mongoose from "mongoose";
import { generateAiResponse } from "../service/openRouterService.js";
import { updateSummaryIfNeeded } from "../service/summaryService.js";
import { buildMessagesForAI } from "../utils/chatContext.js";
import { addChatTokenUsage } from "../utils/tokenUsage.js";
import { addUserTokenUsage } from "../utils/userUsage.js";
import { redisClient } from "../config/redis.js";

export const getMessage = async (req,res) =>{
    try{

        const{chatId} = req.params;

        if(!chatId){
            return res.status(409).json({
                message: "chatId not provided"
            })
        }

        if(!mongoose.Types.ObjectId.isValid(chatId)){
                return res.status(400).json({
                    message: "chat id not valid"
                })
            }

        const chat = await Chat.findOne({
            _id: chatId,
            userId: req.user._id
        })
        if(!chat){
            return res.status(404).json({
                message: "chat not found"
            })
        }

        const message = await Message.find({
            chatId: chatId,
            userId: req.user._id
        }).sort({ createdAt: 1 });

        // const message = await Message.find(
        // {
        //     chatId: chatId,
        //     userId: req.user._id
        // },
        // {
        //     role: 1,
        //     content: 1,
        //     _id: 0
        // }).sort({ createdAt: 1 });

        res.status(200).json({
            message: "Messages fetched seccessfull",
            msg: message
        })

    }catch(err){
        console.log(err);
        res.status(500).json({
            message: "Internal server error"
        })
    }
}

export const sendMessage = async (req,res) =>{
    try{

        const {chatId} = req.params;
        const {content, model} = req.body;

        if(!content || content.trim() === ""){
            return res.status(400).json({
                message: "content required"
            })
        }

        let chat;
        if(chatId){ 
            // chatId exists, chatId is provided in req.params

            if(!mongoose.Types.ObjectId.isValid(chatId)){
                return res.status(400).json({
                    message: "chat id not valid"
                })
            }
            chat = await Chat.findOne({
                _id: chatId,
                userId: req.user._id
            })
            if(!chat){
                return res.status(404).json({
                    message: "chat not found"
                })
            }

        }else{
            // new chat, no chatId is provided in req.params

            if(!model){
                return res.status(400).json({
                    message: "model name required"
                })
            }
            chat = await Chat.create({
                userId: req.user._id,
                model,
                topic: content.trim().slice(0,30)
            })

        }

        const oldMessages = await Message.find({
            chatId: chat._id,           
        })
          .sort({ createdAt: 1 })
          .skip(chat.summarizedTillMessageNumber);

        const messagesForAI = buildMessagesForAI({
            chat,
            oldMessages,
            currentMessage: content.trim(),
        });

        const { aiReply, usage } = await generateAiResponse({
            model: chat.model,
            messages: messagesForAI,
        });
        
        const userMessage = await Message.create({
            userId: req.user._id,
            chatId: chat._id,
            role: "user",
            content: content.trim()
        })

        const assistantMessage = await Message.create({
            userId: req.user._id,
            chatId: chat._id,
            role: "assistant",
            content: aiReply
        })

        chat.messageCount += 2;
        if(chat.topic === "New Chat"){
            chat.topic = content.trim().slice(0, 30)
        }
        await chat.save();

        await addChatTokenUsage(chat, usage);
        await addUserTokenUsage(req.user, usage.totalTokens);

        const tokenUsed = await redisClient.incrBy(
            req.tokenUsageKey,
            usage.totalTokens
        );

        if (tokenUsed === usage.totalTokens) {
            await redisClient.expire(
            req.tokenUsageKey,
            Number(process.env.TOKEN_WINDOW_SECONDS)
            );
        }

        res.status(201).json({
            message: "Message sent successfully",
            chatId: chat._id,
            reply: aiReply,
            usage,
            tokenUsed,
            tokenLimit: Number(process.env.TOKEN_LIMIT),
            userMessage,
            assistantMessage
        })

        updateSummaryIfNeeded(chat._id).catch((error) => {
            console.log("Summary update error:", error);
        });
        

    }catch(err){
        console.log(err);
        res.status(500).json({
            message: "Internal server error"
        })
    }
}
