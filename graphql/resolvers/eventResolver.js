const User = require("../../models/user");
const Event = require("../../models/event");

const { transformEvent, transformBooking } = require("./merge");

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
  createEvent: async (args, req) => {
    // const event = {
    //   _id: Math.random().toString(),
    //   title: args.eventInput.title,
    //   description: args.eventInput.description,
    //   price: +args.eventInput.price,
    //   date: args.eventInput.date
    // };

    if (!req.isAuth) {
      throw new Error("Request is not authenticated");
    }

    const event = new Event({
      title: args.eventInput.title,
      description: args.eventInput.description,
      price: +args.eventInput.price,
      date: new Date(args.eventInput.date),
      creator: req.userId
    });

    let createdEvent;
    try {
      const result = await event.save();
      createdEvent = transformEvent(event);
      const creator = await User.findById(req.userId);

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
  }
};
