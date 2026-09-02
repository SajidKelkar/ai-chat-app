import mongoose from "mongoose";

const connectDb = async ()=>{
    try{

        await mongoose.connect(`${process.env.MONGO_URL}/GPT`);
        console.log("DB connection successful");

    }
    catch(err){
        console.log("DB connection failed",err)
    }
    
};

export default connectDb;