import dotenv from "dotenv";
import connectDB from "./db/index.js"
import express from "express";

dotenv.config({
    path : './env'
})

const app = express();
(async () => {
    try{
        //await mongoose.connect(`${process.env.MONNGODB_URI}/${DB_NAME}`);
        await connectDB();
        app.on('error', (error)=> {
            console.log("ERR : ", error);
            throw error;
        })

        app.listen(process.env.PORT || 8000, ()=>{
            console.log(`App listening at port ${process.env.PORT}`);
})

    } catch(error){
        console.log('MONGODB connection FAILED',error);
    }
})()
