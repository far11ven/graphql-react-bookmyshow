const express = require("express");
const bodyParser = require("body-parser");
const express_graphql = require("express-graphql");
const { buildSchema } = require("graphql");
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const Event = require("./models/event");
const User = require("./models/user");

const app = express();
const port = process.env.port || 3000;

app.use(bodyParser.json());
app.use(
  "/graphql",
  express_graphql({
    schema: buildSchema(`
        type Event{
            _id: ID!
            title: String!
            description: String!
            price: Float!
            date: String!
        }
        type User{
          _id: ID!
          email: String!
          password: String
         }
        input EventInput{
            title: String!
            description: String!
            price: Float!
            date: String!
        }
        input UserInput{
          email: String!
          password: String!
        }
        type RootQuery{
            events: [Event!]!
        }
        type RootMutation{
            createEvent(eventInput: EventInput): Event
            createUser(userInput: UserInput) : User
        }
        schema {
            query: RootQuery
            mutation: RootMutation
        }
    `),
    rootValue: {
      events: () => {
        return Event.find()
          .then(events => {
            console.log(events);
            return events.map(event => {
              return { ...event._doc, _id: event._doc._id.toString() };
            });
          })
          .catch(err => {
            console.log(err);
            throw err;
          });
      },
      createEvent: args => {
        // const event = {
        //   _id: Math.random().toString(),
        //   title: args.eventInput.title,
        //   description: args.eventInput.description,
        //   price: +args.eventInput.price,
        //   date: args.eventInput.date
        // };

        const event = new Event({
          title: args.eventInput.title,
          description: args.eventInput.description,
          price: +args.eventInput.price,
          date: new Date(args.eventInput.date),
          creator: "5d78f09b7f690301242c8716"
        });

        let createdEvent;

        return event
          .save()
          .then(result => {
            createdEvent = { ...result._doc, _id: event.id };
            return User.findById("5d78f09b7f690301242c8716");
          })
          .then(user => {
            if (!user) {
              throw new Error("User doesn't exists!!");
            }
            user.createdEvents.push(event);
            return user.save();
          })
          .then(result => {
            console.log(result);
            return createdEvent;
          })
          .catch(err => {
            console.log(err);
            throw err;
          });
      },
      createUser: args => {
        return User.findOne({ email: args.userInput.email })
          .then(user => {
            if (user) {
              throw new Error("User already exists!!");
            }
            return bcrypt.hash(args.userInput.password, 12);
          })
          .then(hashedPassword => {
            const user = new User({
              email: args.userInput.email,
              password: hashedPassword
            });
            return user.save();
          })
          .then(result => {
            console.log(result);
            return { ...result._doc, _id: result.id };
          })
          .catch(err => {
            throw err;
          });
      }
    },
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
