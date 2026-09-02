import dotenv from "dotenv";
dotenv.config();

import app from "./src/app.js";
import connectDb from "./src/config/db.js";

import dns from "dns";
dns.setServers(["1.1.1.1","8.8.8.8"]);


const startServer = async ()=>{
    try{
        await connectDb();

        app.listen(process.env.PORT,()=>{
            console.log(`Server is listning on port ${process.env.PORT}`);
        })
    }
    catch(err){
        console.log(err.message);
    }
};

startServer();
