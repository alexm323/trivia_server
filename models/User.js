import * as mongoose from 'mongoose'
import bcrypt from 'bcryptjs'
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

// we need to use the function keyword here because we need access to this which is the user in this case 
// this is letting us set a method on our user which we can use to make the comparison for passwords and we can move that logic out of our resolver 
UserSchema.methods.comparePasswords = async function(password){
    const user = this;

    const isMatch = bcrypt.compare(password,user.password);
    return isMatch
}
// going to hash our password using bcrypt and mongoose 
UserSchema.pre("save", async function(next){
    const user = this;
    
    try {
        const salt = await bcrypt.genSalt(10)
        const hash = await bcrypt.hash(user.password,salt);
        user.password = hash

        next()
    } catch (error) {
        next(error)
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