import Chat from "../models/chat.model.js"
import Message from "../models/message.model.js";


export const createChat = async (req,res)=>{
    try{

        const {model} = req.body;
        if(!model){
            return res.status(400).json({
                message: "model name is missing"
            })
        }

        // model name verification incomplete.

        const createdChat = await Chat.create({
            userId: req.user._id,
            model
        })

        res.status(200).json({
            message: "chat created successfully",
            chatId: createdChat._id,
            userId: req.user._id,
            model,
            topic: createdChat.topic,
            createdAt: createdChat.createdAt
        })

    }catch(err){
        console.log(err);
        res.status(500).json({
            message: "internal server error"
        })
    }
}

export const deleteChat = async (req,res)=>{
    try{

        const {chatId} = req.params;

        if(!chatId){
            return res.status(409).json({
                message: "chatId not provided"
            })
        }

        const findChat = await Chat.findOne({_id: chatId, userId: req.user._id});
        if(!findChat){
            return res.status(400).json({
                message: "not allowed to delete this chat"
            })
        }

        await Message.deleteMany({
            chatId: findChat._id
        });
        
        await Chat.deleteOne({
            _id: chatId
        });

        res.status(200).json({
            message: "Your chat is deleted"
        })

    }catch(err){
        console.log(err);
        res.status(500).json({
            message: "internal server error"
        })
    }
}

export const getRecentChats = async (req,res)=>{
    try{

        const getChat = await Chat.find({ userId: req.user._id}).select("topic updatedAt").sort({ updatedAt: -1}).limit(20);

        res.status(200).json({
            message: "recent chats fetched successfully",
            chats: getChat
        })

    }catch(err){
        console.log(err);
        res.status(500).json({
            message: "internal server error"
        })
    }
}

export const getSingleChat = async (req,res)=>{
    try{

        const {chatId} = req.params;

        if(!chatId){
            return res.status(409).json({
                message: "chatId not provided"
            })
        }

        const findChat = await Chat.findOne({ _id: chatId, userId: req.user._id});
        if(!findChat){
            return res.status(400).json({
                message: "Chat not found"
            })
        }

        res.status(200).json({
            chatId: findChat._id,
            userId: findChat.userId,
            topic: findChat.topic,
            usage: findChat.usage
        })

    }catch(err){
        console.log(err);
        res.status(500).json({
            message: "internal server error"
        })
    }
}