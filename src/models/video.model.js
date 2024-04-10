import mongoose , {Schema} from mongoose;
import mongooseAggregatePaginate from "mongoose-aggregate-paginate-v2";
const videoSchema = new Schema(
    {
        videoFile :{
            type : String,
            required : true
        },
        thumbnail : {
            type: String,
            required : true
        },
        owner : {
                type : Schema.Types.ObjectId, 
                ref : "User"
        },
        title : {
            type: String,
            required : true
        },
        description : {
            type: String,
            required : true
        },
        duration :{ 
            type : Number,
            required : false,
            default : 0
        },
        views : {
            type : Number,
            required : true
        },
        isPublished : {
            type : Boolean,
            required : false,
            default : false
        }
    },
    {
        timestamps : true
    }
)

videoSchema.plugin(mongooseAggregatePaginate);
const videoModel = mongoose.model('Video', videoSchema);

export {videoModel};
