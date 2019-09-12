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
  }
};
