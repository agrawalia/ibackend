import mongoose from 'mongoose';
import { DB_NAME } from "../constants.js";

const connectDB = async() => {
    try{

        const connect = await mongoose.connect(`${process.env.MONGODB_URI}/${DB_NAME}`);
        //console.log(`MONGODB connected !! DB host: ${connect.connection.host}`,connect);

    } catch(error) {
        console.log("MONGODB CONNECTION FAILED", error);
        process.exit(1);
    }
}

export default connectDB;