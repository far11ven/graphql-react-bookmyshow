const bcrypt = require("bcryptjs");

const Event = require("../../models/event");
const User = require("../../models/user");

const getEvents = async eventIds => {
  try {
    const events = await Event.find({ _id: { $in: eventIds } });
    events.map(event => {
      return {
        ...event._doc,
        _id: event.id,
        date: new Date(event._doc.date).toISOString(),
        creator: getUser.bind(this, event.creator)
      };
    });

    return events;
  } catch (err) {
    throw err;
  }
};

const getUser = async userId => {
  try {
    const user = await User.findById(userId);

    return {
      ...user._doc,
      _id: user.id,
      createdEvents: getEvents.bind(this, user._doc.createdEvents)
    };
  } catch (err) {
    throw err;
  }
};

module.exports = {
  events: async () => {
    try {
      const events = await Event.find();

      return events.map(event => {
        return {
          ...event._doc,
          _id: event._doc._id.toString(),
          date: new Date(event._doc.date).toISOString(),
          creator: getUser.bind(this, event._doc.creator)
        };
      });
    } catch (err) {
      console.log(err);
      throw err;
    }
  },
  createEvent: async args => {
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
    try {
      const result = await event.save();
      createdEvent = {
        ...result._doc,
        _id: result._doc._id.toString(),
        date: new Date(result._doc.date).toISOString(),
        creator: getUser.bind(this, result._doc.creator)
      };
      const creator = await User.findById("5d78f09b7f690301242c8716");

      if (!creator) {
        throw new Error("Creator User doesn't exists!!");
      }
      creator.createdEvents.push(event);
      await creator.save();

      console.log(result);
      return createdEvent;
    } catch (err) {
      console.log(err);
      throw err;
    }
  },

  createUser: async args => {
    try {
      const existingUser = await User.findOne({ email: args.userInput.email });

      if (existingUser) {
        throw new Error("User already exists!!");
      }

      const hashedPassword = await bcrypt.hash(args.userInput.password, 12);
      const user = new User({
        email: args.userInput.email,
        password: hashedPassword
      });

      const result = await user.save();
      console.log(result);
      return { ...result._doc, _id: result.id };
    } catch (err) {
      throw err;
    }
  }
};
