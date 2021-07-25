import * as mongoose from 'mongoose';

const QuestionSchema = mongoose.Schema({
    question: {
        type: String,
        unique:true,
    },
    category:{
        type:String
    },
    difficulty:{
        type:String
    },
    answers:[
        {
            answer:String,
            correct:Boolean,
        }
    ]
})

export const Question = mongoose.models.Question ||  mongoose.model("Question",QuestionSchema)

// in this file we are creating a schema for mongo which is typically a schemaless database but we are doing this to organize our data and as an exercise 

// we are either creating a new model or using an existing one if it is already out there