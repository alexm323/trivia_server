import mongoose from 'mongoose';
import { unescape,shuffle } from 'lodash';
import { Question } from '../../models/Question';
import { User } from '../../models/User';
import { ApolloError, UserInputError } from 'apollo-server-errors';

export const resolvers = {
  Query: {
    greet: async () => {
      console.log('before', mongoose.connection.readyState);
      console.log('after', mongoose.connection.readyState);

      return {
        name: 'Jane Doe',
        message: 'Hello, world!',
      };
    },
    question: async (parent,args,context) => {
      console.log('question context',context)
        // const questions = await Question.find({},null,{limit:1}).exec();
        // an aggregation is like a find but with a lot more stuff it can mutate data but we can also use it to grab a random collection. 
        //  a function that takes an argument of an array, take a sample and give it a size 
        const questions = await Question.aggregate([
          {
            $sample: { size: 1 },
          },
        ]);
        console.log(questions)
        if (questions.length === 0){
            throw new ApolloError('Sorry, you\'ve run out of questions')
        }

        const question = questions[0] 
        return {
          _id:question._id,
          question: question.question,
          category:question.category,
          difficulty:question.difficulty,
          answers: shuffle(question.answers)
        }; 
    },
  },


  Mutation:{
    register: async (parent,args) => {
      // console.log(args.user) 
      const {username,password} = args.user;
      const user = await new User({username,password}).save()
      // lets create a token for a user 
      const token = await user.generateToken()
      return {
        username:user.username,
        token
      }
    },

    signin: async(parent,args) => {
      const {username,password} = args;

      const user = await User.findOne({username}).exec();

      if(!user){
        throw new UserInputError('Invalid username')
      }
      // const isMatch = await bcrypt.compare(password,user.password)
      // we can reuse this anywhere else in our application and so we extracted the logic a bit 
      const isMatch = await user.comparePasswords(password)
      let token;
      if(isMatch){
       token = await user.generateToken()
      }
      if(!isMatch){
        throw new UserInputError('Invalid password')
      }

      return {
        username:user.username,
        token
      }
    },
      fetchQuestions: async () => {
  

          const url = `https://opentdb.com/api.php?amount=3`;
          const response = await fetch(url)

          const {results} = await response.json();

            const formattedResults = results.map(result => {
                return {
                    ...result,
                    question: unescape(result.question),
                    answers:[
                        {
                            answer: result.correct_answer,
                            correct:true
                        },
                        ...result.incorrect_answers.map(answer => {
                            return{
                                answer:answer,
                                correct:false
                            }
                            
                        })
                    ]
                }
            })
            console.log(formattedResults)

            const insertResult = await Question.insertMany(formattedResults);
          return {questionsSaved:insertResult.length}
      }
  }
};