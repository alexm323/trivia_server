import {ApolloServer} from 'apollo-server-micro'
import {typeDefs} from '../../graphql/schemas/index'
import { resolvers } from '../../graphql/resolvers/index'
import { connectMongo } from '../../util/dbConnect';
import jwt from 'jsonwebtoken'
import  {User} from '../../models/User'
import { AuthenticationError } from 'apollo-server-errors';
const apolloServer = new ApolloServer({typeDefs,resolvers,
    // we can look at our request data here which we can grab from this param
    context: async ({req}) => {
    await connectMongo()
    const context = {}
    // we want to add our user if the authorization header is passed so we can access the user anywhere 

    // console.log(req.headers)
    if (req?.headers?.authorization){
        // we care about the second value which is our token so we have a blank and then deconstruct the second value 
        const [,token] = req.headers.authorization.split('Bearer ');
        const decoded = await jwt.verify(token,process.env.JWT_SECRET)
        // console.log('decoded',decoded)
        // import the user model and we should be able to see user data
        const user = await User.findOne({ _id: decoded._id }).exec();
        // console.log('user',user)
        // if there is no valid user then we should throw an error 
        if (!user){
            throw new AuthenticationError('Invalid user. Please sign in.')
        }
        // if we made it to this point we know we have a user so we can set the context variable that we initialized above to give us access to that user
        context.user = user
    }
    return context
}});

export const config = {
    api:{
        bodyParser:false
    }
}

export default apolloServer.createHandler({path:'/api/graphql'})

