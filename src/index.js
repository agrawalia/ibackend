import dotenv from "dotenv";
import connectDB from "./db/index.js"
import {app} from  "./app.js";
dotenv.config({
    path : './env'
})


/*
connectDB()
.then(() => {
    app.listen(process.env.PORT || 8000, () => {
        console.log(`⚙️ Server is running at port : ${process.env.PORT}`);
    })
})
.catch((err) => {
    console.log("MONGO db connection failed !!! ", err);
})
*/



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
} catch(error) {
    console.log('MONGODB connection FAILED ',error);
}
