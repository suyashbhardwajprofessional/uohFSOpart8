const { ApolloServer } = require('@apollo/server');
const { expressMiddleware } = require('@apollo/server/express4')
const { ApolloServerPluginDrainHttpServer } = require('@apollo/server/plugin/drainHttpServer')
const { makeExecutableSchema } = require('@graphql-tools/schema')
const express = require('express')
const cors = require('cors')
const http = require('http')
const mongoose = require('mongoose');
require('dotenv').config();
const jwt = require('jsonwebtoken');
const User = require('./models/user');
const typeDefs = require('./schema')
const resolvers = require('./resolvers')

/*packages for adding subscriptions to GraphQL and a Node.js WebSocket library*/
const { WebSocketServer } = require('ws')
const { useServer } = require('graphql-ws/lib/use/ws') 

mongoose.set('strictQuery', false);

const MONGODB_URI = process.env.LOCAL_MONGODB_URI;
console.log('connecting to', MONGODB_URI);
mongoose
  .connect(MONGODB_URI)
  .then(() => {
    console.log('connected to locally hosted MongoDB');
  })
  .catch(error => {
    console.log('error connection to locally hosted MongoDB:', error.message);
  });

// setup is now within a function - start
const start = async () => {
  console.log('start function entered into!')
  const app = express()
  const httpServer = http.createServer(app)

  /*registration of a WebSocketServer object to listen the WebSocket connections*/
  const wsServer = new WebSocketServer({
    server: httpServer,
    path: '/',
  })
  const schema = makeExecutableSchema({ typeDefs, resolvers })
  const serverCleanup = useServer({ schema }, wsServer)

  /*added to the configuration of the GraphQL server - ApolloServerPluginDrainHttpServer({ httpServer })*/
  const graphQlServer = new ApolloServer({
    schema: makeExecutableSchema({ typeDefs, resolvers }),
    plugins: 
      [
        ApolloServerPluginDrainHttpServer({ httpServer }),
        /*registered below a function that closes the WebSocket connection on server shutdown.*/
        {
          async serverWillStart() {
            return {
              async drainServer() {
                await serverCleanup.dispose();
              },
            };
          },
        }

      ],
  })

  await graphQlServer.start()

  /*graphQlServer being set up to listen to the root ('/') of the server using expressMiddleware obj*/
  app.use(
    '/',
    cors(),
    express.json(),
    expressMiddleware(graphQlServer, {
      
      context: async ({ req, res }) => {
        const auth = req ? req.headers.authorization : null;
        if (auth && auth.startsWith('Bearer ')) {
          const decodedToken = jwt.verify(auth.substring(7), process.env.JWT_SECRET);
          const currentUser = await User.findById(decodedToken.id).populate('favoriteGenre');
          return { currentUser };
        }
      },

    }),
  )

  const PORT = 4000

  httpServer.listen(PORT, () =>
    console.log(`Server is now running on http://localhost:${PORT}`)
  )
}

start()