const bcrypt = require("bcryptjs");

const Event = require("../../models/event");
const User = require("../../models/user");
const Booking = require("../../models/booking");

const getEvents = async eventIds => {
  try {
    const events = await Event.find({ _id: { $in: eventIds } });
    return events.map(event => {
      return {
        ...event._doc,
        _id: event.id,
        date: new Date(event._doc.date).toISOString(),
        creator: getUser.bind(this, event.creator)
      };
    });
  } catch (err) {
    throw err;
  }
};

const getSingleEvent = async eventId => {
  try {
    const event = await Event.find({ _id: eventId });
    return transformEvent(event);
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

const transformEvent = event => {
  return {
    ...event._doc,
    _id: event._doc._id.toString(),
    date: new Date(event._doc.date).toISOString(),
    creator: getUser.bind(this, event._doc.creator)
  };
};

module.exports = {
  events: async () => {
    try {
      const events = await Event.find();

      return events.map(event => {
        return transformEvent(event);
      });
    } catch (err) {
      console.log(err);
      throw err;
    }
  },
  bookings: async () => {
    try {
      const bookings = await Booking.find();
      console.log(bookings);
      return bookings.map(booking => {
        return {
          ...booking._doc,
          _id: booking.id,
          user: getUser.bind(this, booking._doc.user),
          event: getSingleEvent.bind(this, booking._doc.event),
          createdAt: new Date(booking._doc.createdAt).toISOString(),
          updatedAt: new Date(booking._doc.updatedAt).toISOString()
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
      creator: "5d7a44913b141610ec10d987"
    });

    let createdEvent;
    try {
      const result = await event.save();
      createdEvent = transformEvent(event);
      const creator = await User.findById("5d7a44913b141610ec10d987");

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
  },
  bookEvent: async args => {
    try {
      const fetchedEvent = await Event.findOne({ _id: args.eventId });
      const booking = new Booking({
        user: "5d7a44913b141610ec10d987",
        event: fetchedEvent
      });

      const result = await booking.save();

      return {
        ...result._doc,
        _id: result.id,
        user: getUser.bind(this, booking._doc.user),
        event: getSingleEvent.bind(this, booking._doc.event),
        createdAt: new Date(result._doc.createdAt).toISOString(),
        updatedAt: new Date(result._doc.updatedAt).toISOString()
      };
    } catch (err) {
      console.log("result:", err);
      throw err;
    }
  },
  cancelBooking: async args => {
    try {
      const booking = await Booking.findOne({ _id: args.bookingId }).populate(
        "event"
      );
      const event = transformEvent(booking.event);
      await Booking.deleteOne({ _id: args.bookingId });
      return event;
    } catch (err) {
      throw err;
    }
  }
};
