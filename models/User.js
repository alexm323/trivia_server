import * as mongoose from 'mongoose'

const UserSchema = new mongoose.Schema({
    username : {
        type: String,
        required:true,
        unique:true
    },
    password:{
        type:String,
        required:true,
        minLength:2
    },
    incorrectQuestions:{
        type:[String],
        default:[]
    },
    correctQuestions:{
        type:[String],
        default:[]
    },
    roles:{
        type: [String],
        default:[]
    }
})


// we can use a hook on the schema so that if we try to create a duplicate user we can get a different error message
UserSchema.post('save',async(error,doc,next)=> {
    if(error.name === 'MongoError' && error.code === 11000){
        next(new Error("Username is already in use."))
    }else{
        next(error)
    }
});

export const User = mongoose.models.User || mongoose.model('User',UserSchema)