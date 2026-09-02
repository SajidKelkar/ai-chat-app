import Chat from "../models/chat.model.js";
import Message from "../models/message.model.js";
import mongoose from "mongoose";


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
                topic: content.trim().slice(0,40)
            })

        }

        const userMessage = await Message.create({
            userId: req.user._id,
            chatId: chat._id,
            role: "user",
            content: content.trim()
        })

        const aiReply = "dummy reply";

        const assistantMessage = await Message.create({
            userId: req.user._id,
            chatId: chat._id,
            role: "assistant",
            content: aiReply
        })

        chat.messageCount += 2;
        if(chat.topic === "New Chat"){
            chat.topic = content.trim().slice(0, 40)
        }
        await chat.save();

        res.status(201).json({
            message: "message send successfully",
            chatId: chat._id,
            userMessage,
            assistantMessage
        })

    }catch(err){
        console.log(err);
        res.status(500).json({
            message: "Internal server error"
        })
    }
}