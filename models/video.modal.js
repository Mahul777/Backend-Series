import mongoose, { Aggregate, Schema } from 'mongoose'
import mongooseAggregatePaginate from 'mongoose-aggregate-paginate-v2';
const videoSchema = new Schema(
    {
        videoFile:
        {
            type:String, //Here we use Cloudinary url
            required:true
        },
        thumbnail:
        {
            type:String,//Here we use Cloudinary url
            required:true
        },
        owner:{
            type:Schema.Types.ObjectId,
            ref:"User"
        },
        title:{
            type:String,
            required:true
        },
        description:{
            type:String,
            required:true
        },
        duration:{
            type:Number, //Here we use Cloudinary url
            required:true
        },
        views:{
            type:Number,
            default:0
        },
        isPublished:{
            //it check video is publically available or not 
            type:Boolean,
            default:true
        }
    },
    {timestamps:true}
)

videoSchema.plugin(mongooseAggregatePaginate)

export const video = mongoose.model("Video",videoSchema);