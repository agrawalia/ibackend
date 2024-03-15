import mongoose , {Schema} from mongoose;
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";

const userSchema = new Schema(
    {
        username : {
            type : String,
            required : true,
            unique : true,
            lowercase : true,
            trim : true,
            index : true
        },
        email : {
            type : String,
            required : true,
            unique : true,
            lowercase : true,
            trim : true
        },
        fullName : {
            type : String,
            required : true,
            unique : false,
            lowercase : true,
            trim : true
        },
        avatar : {
            type : String,
            required : true
        },
        coverImage : {
            type : String,
            required : true
        },
        password : {
            type : String,
            required : [true, 'Please provide a password']
        },
        watchHistory : [
            {
                type :  Schema.Types.ObjectId,
                ref : 'Video'
            }
        ],
        refreshToken : {
            type : String,
            required : false
        }
    },
    {
        timestamps : true
    }
)

userSchema.pre("save", async function(next) {
    if(!this.isModified('password')) return next();
    this.password = bcrypt.hash(this.password, 10);
    next();
})

userSchema.methods.isPasswordCorrect = async function(password) {
    return await bcrypt.compare(password, this.password || '');
}

userSchema.methods.generateAccessToken = async function() {
     
    return jwt.sign({
        _id : this._id,
        email : this.email,
        username : this.username,
        fullName : this.fullName,
    },
    process.env.ACCESS_TOKEN_SECRET,
    { 
        expiresIn: process.env.ACCESS_TOKEN_EXPIRY
    }
    )
}

userSchema.methods.generateRefreshToken = async function() {
     
    return jwt.sign({
        _id : this._id,
    },
    process.env.REFRESH_TOKEN_SECRET,
    { 
        expiresIn: process.env.REFRESH_TOKEN_EXPIRY
    }
    )
}

const userModel = mongoose.model('User', userSchema);

export {userModel};