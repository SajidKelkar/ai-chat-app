import "dotenv/config";

import app from "./src/app.js";
import connectDb from "./src/config/db.js";
import { connectRedis } from "./src/config/redis.js";

import dns from "dns";
dns.setServers(["1.1.1.1","8.8.8.8"]);


const startServer = async ()=>{
    try{
        await connectDb();
        await connectRedis();
        
        const PORT = process.env.PORT || 3000;

        app.listen(PORT, () => {
        console.log(`Server is listening on port ${PORT}`);
        });

    }
    catch(err){
        console.log(err.message);
    }

};


startServer();