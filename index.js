const express = require("express");
const { ApolloServer } = require("apollo-server-express");
const typeDefs = require("./typeDefs");
const resolvers = require("./resolvers");
const models = require("./models");

const app = express();
const port = 4000;

const server = new ApolloServer({
  typeDefs,
  resolvers,
  context: { models },
});

server.applyMiddleware({ app });
models.sequelize.authenticate();
models.sequelize.sync();
app.listen({ port }, () =>
  console.log(
    `🚀 Server ready at http://localhost:ocalhost:${port}${server.graphqlPath}`
  )
);
