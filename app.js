const express = require("express");
const bodyParser = require("body-parser");
const express_graphql = require("express-graphql");
const mongoose = require("mongoose");

const graphqlSchema = require("./graphql/schema/index");
const graphqlResolver = require("./graphql/resolvers/index");

const app = express();
const port = process.env.port || 3000;

app.use(bodyParser.json());

app.use(
  "/graphql",
  express_graphql({
    schema: graphqlSchema,
    rootValue: graphqlResolver,
    graphiql: true
  })
);

mongoose;
mongoose
  .connect(
    "mongodb+srv://" +
      process.env.MONGO_USER +
      ":" +
      process.env.MONGO_PASSWORD +
      "@cluster0-n1cyt.gcp.mongodb.net/" +
      process.env.MONGO_DB +
      "?retryWrites=true",
    {
      useNewUrlParser: true,
      useUnifiedTopology: true
    }
  )
  .then(() => {
    app.listen(port, () => {
      console.log(`listening on port ${port}..`);
    });
  })
  .catch(err => {
    console.log(err);
  });
