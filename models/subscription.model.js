import mongoose from "mongoose";

//Schema Creation
const SubscriptionSchema  = new Schema({
    subscriber:
    {
        type: Schema.Types.ObjectId,
        ref: "User"
    },
    channel:
    {
        type: Schema.Types.ObjectId,
        ref: "User"
    }
})

//export the Schema
export const Subscription  = mongoose.model("Subscription",SubscriptionSchema);