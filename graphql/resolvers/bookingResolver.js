const { transformEvent, transformBooking } = require("./merge");
const Booking = require("../../models/booking");
const Event = require("../../models/event");

module.exports = {
  bookings: async (args, req) => {
    if (!req.isAuth) {
      throw new Error("Request is not authenticated");
    }

    try {
      const bookings = await Booking.find();
      console.log(bookings);
      return bookings.map(booking => {
        return transformBooking(booking);
      });
    } catch (err) {
      console.log(err);
      throw err;
    }
  },
  bookEvent: async (args, req) => {
    if (!req.isAuth) {
      throw new Error("Request is not authenticated");
    }

    try {
      const fetchedEvent = await Event.findOne({ _id: args.eventId });
      const booking = new Booking({
        user: req.userId,
        event: fetchedEvent
      });

      const result = await booking.save();

      return transformBooking(result);
    } catch (err) {
      console.log("result:", err);
      throw err;
    }
  },
  cancelBooking: async (args, req) => {
    if (!req.isAuth) {
      throw new Error("Request is not authenticated");
    }

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
