const mongoose=require('mongoose');

const mongoURI = "mongodb+srv://aayush176:aa123456@cluster0.ciznksk.mongodb.net/inotebook?retryWrites=true&w=majority";

const connectToMongo =()=>{
     mongoose.connect(mongoURI ,()=>{
        console.log("Connected to mongo successfully");
     })
}

module.exports=connectToMongo;